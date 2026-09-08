import { betterAuth } from 'better-auth'
import { APIError } from 'better-auth/api'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { tanstackStartCookies } from 'better-auth/tanstack-start'
import { eq } from 'drizzle-orm'
import { db } from '~/db'
import * as schema from '~/db/schema'

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema,
  }),
  baseURL: {
    allowedHosts: [
      'localhost:3000',
      'localhost:3001',
      'localhost:5173',
      'sipra-untad.vercel.app',
      '*.vercel.app',
    ],
    protocol: process.env.NODE_ENV === 'development' ? 'http' : 'https',
  },
  trustedOrigins: [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:5173',
    'https://*.vercel.app',
    'https://sipra-untad.vercel.app',
  ],
  advanced: {
    trustedProxyHeaders: true,
  },
  secret: process.env.BETTER_AUTH_SECRET,
  rateLimit: {
    window: 60,
    max: 10,
  },
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: (process.env.GOOGLE_CLIENT_ID as string) || '',
      clientSecret: (process.env.GOOGLE_CLIENT_SECRET as string) || '',
      prompt: 'select_account',
    },
  },
  user: {
    additionalFields: {
      role: {
        type: 'string',
        required: false,
        defaultValue: 'reporter',
        input: false,
      },
    },
  },
  databaseHooks: {
    session: {
      create: {
        before: async (session, ctx) => {
          if (ctx?.path?.includes('callback')) {
            const [u] = await db
              .select({ role: schema.user.role })
              .from(schema.user)
              .where(eq(schema.user.id, session.userId))

            if (u && u.role !== 'reporter') {
              throw new APIError('FORBIDDEN', {
                message: 'staff_oauth_forbidden',
              })
            }
          }
          return { data: session }
        },
      },
    },
  },
  onAPIError: {
    errorURL: '/login',
  },
  plugins: [tanstackStartCookies()],
})
