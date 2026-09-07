import { createServerFn } from '@tanstack/react-start'
import { getRequestHeaders } from '@tanstack/react-start-server'
import { auth } from '~/lib/auth'

export const getCurrentUserSession = createServerFn({ method: 'GET' }).handler(
  async () => {
    try {
      const headers = getRequestHeaders()
      const session = await auth.api.getSession({
        headers: headers as any,
      })
      return session
    } catch {
      return null
    }
  },
)
