import crypto from 'node:crypto'
import { getRequestHeaders } from '@tanstack/react-start-server'
import { eq, and, gt, lt } from 'drizzle-orm'
import { db } from '~/db'
import { rateLimits } from '~/db/schema'

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetInSeconds: number
}

function parseCookieHeader(cookieString: string | undefined): Map<string, string> {
  const map = new Map<string, string>()
  if (!cookieString) return map

  const parts = cookieString.split(';')
  for (const part of parts) {
    const [rawKey, rawVal] = part.split('=')
    if (rawKey && rawVal !== undefined) {
      map.set(rawKey.trim(), decodeURIComponent(rawVal.trim()))
    }
  }
  return map
}

export async function resolveRateLimitKey(
  action: string,
  sessionUser?: { id: string } | null,
): Promise<string> {
  if (sessionUser?.id) {
    return `${action}:user:${sessionUser.id}`
  }

  let clientIp = 'unknown'
  let userAgent = 'unknown'
  let deviceId = ''

  try {
    const headers = getRequestHeaders() as unknown as Record<
      string,
      string | undefined
    >
    const forwarded = headers['x-forwarded-for'] || headers['x-real-ip'] || headers['cf-connecting-ip']
    if (forwarded) {
      clientIp = forwarded.split(',')[0].trim()
    }

    if (headers['user-agent']) {
      userAgent = headers['user-agent']
    }

    const cookieMap = parseCookieHeader(headers['cookie'])
    deviceId = cookieMap.get('sipra_did') || ''
  } catch {
    // Fallback if request context is unavailable
  }

  const hashInput = `${clientIp}::${userAgent}::${deviceId}`
  const hash = crypto.createHash('sha256').update(hashInput).digest('hex').slice(0, 32)

  return `${action}:anon:${hash}`
}

export async function consumeRateLimit(
  key: string,
  maxRequests: number,
  windowSeconds: number,
): Promise<RateLimitResult> {
  const now = new Date()

  if (Math.random() < 0.1) {
    try {
      await db.delete(rateLimits).where(lt(rateLimits.expiresAt, now))
    } catch {
      // Ignore background cleanup errors
    }
  }

  try {
    const [record] = await db
      .select({
        id: rateLimits.id,
        count: rateLimits.count,
        expiresAt: rateLimits.expiresAt,
      })
      .from(rateLimits)
      .where(and(eq(rateLimits.key, key), gt(rateLimits.expiresAt, now)))
      .limit(1)

    if (!record) {
      const expiresAt = new Date(Date.now() + windowSeconds * 1000)
      await db.insert(rateLimits).values({
        id: crypto.randomUUID(),
        key,
        count: 1,
        expiresAt,
      })

      return {
        allowed: true,
        remaining: maxRequests - 1,
        resetInSeconds: windowSeconds,
      }
    }

    const resetInSeconds = Math.max(
      1,
      Math.ceil((record.expiresAt.getTime() - Date.now()) / 1000),
    )

    if (record.count >= maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetInSeconds,
      }
    }

    await db
      .update(rateLimits)
      .set({
        count: record.count + 1,
      })
      .where(eq(rateLimits.id, record.id))

    return {
      allowed: true,
      remaining: Math.max(0, maxRequests - (record.count + 1)),
      resetInSeconds,
    }
  } catch (error) {
    console.error('[RateLimit Error]:', error)
    return {
      allowed: true,
      remaining: 1,
      resetInSeconds: windowSeconds,
    }
  }
}
