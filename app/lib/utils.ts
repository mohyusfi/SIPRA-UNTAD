import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateTrackingCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let randomPart = ''
  for (let i = 0; i < 6; i++) {
    randomPart += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  const year = new Date().getFullYear()
  return `UNTAD-${year}-${randomPart}`
}

export function formatDate(date: Date | string | number): string {
  const d = new Date(date)
  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Makassar',
  }).format(d)
}

interface ZodIssueItem {
  message?: string
  code?: string
  path?: (string | number)[]
}

export function formatErrorMessage(
  err: unknown,
  fallback = 'Terjadi kesalahan sistem. Silakan coba kembali.',
): string {
  if (!err) return fallback

  let raw = ''
  if (typeof err === 'string') {
    raw = err
  } else if (err instanceof Error) {
    raw = err.message
  } else if (
    typeof err === 'object' &&
    'message' in err &&
    typeof (err as { message?: unknown }).message === 'string'
  ) {
    raw = (err as { message: string }).message
  }

  raw = raw.trim()
  if (!raw) return fallback

  if (
    (raw.startsWith('[') && raw.endsWith(']')) ||
    (raw.startsWith('{') && raw.endsWith('}'))
  ) {
    try {
      const parsed = JSON.parse(raw) as unknown
      if (Array.isArray(parsed) && parsed.length > 0) {
        const issues = parsed as ZodIssueItem[]
        const extracted = issues
          .map((item) => {
            if (!item?.message) return null
            const m = item.message
            if (m.includes('Too small: expected string to have >=')) {
              return 'Format isian terlalu pendek dari batas minimal'
            }
            if (m.includes('Too big: expected string to have <=')) {
              return 'Format isian melebihi batas karakter maksimal'
            }
            if (m.includes('Required')) {
              return 'Kolom isian wajib diisi'
            }
            if (m.includes('Invalid email')) {
              return 'Format email tidak valid'
            }
            if (m.includes('Expected ') && m.includes('received')) {
              return 'Format tipe data tidak sesuai'
            }
            return m
          })
          .filter(Boolean) as string[]

        if (extracted.length > 0) {
          return extracted.join('. ')
        }
      } else if (
        parsed &&
        typeof parsed === 'object' &&
        'message' in parsed &&
        typeof (parsed as { message?: unknown }).message === 'string'
      ) {
        return (parsed as { message: string }).message
      }
    } catch {
      // Continue with raw string
    }
  }

  const lower = raw.toLowerCase()
  if (lower.includes('fetch failed') || lower.includes('failed to fetch')) {
    return 'Gagal terhubung ke server. Periksa koneksi internet Anda.'
  }
  if (lower.includes('invalid credentials') || lower.includes('invalid email or password')) {
    return 'Kredensial tidak valid. Silakan periksa email dan kata sandi.'
  }
  if (lower.includes('user already exists') || lower.includes('email already in use')) {
    return 'Email sudah terdaftar di sistem. Silakan gunakan email lain.'
  }
  if (lower.includes('unauthorized') || lower.includes('not authenticated')) {
    return 'Sesi Anda telah berakhir atau belum memiliki akses. Silakan masuk kembali.'
  }
  if (lower.includes('forbidden') || lower.includes('permission denied')) {
    return 'Anda tidak memiliki izin untuk melakukan tindakan ini.'
  }
  if (lower.includes('internal server error')) {
    return 'Terjadi gangguan pada server. Silakan coba beberapa saat lagi.'
  }

  return raw
}

