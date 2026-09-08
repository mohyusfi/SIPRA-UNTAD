import { createServerFn } from '@tanstack/react-start'
import { getSessionFromServer } from '~/lib/auth-session.server'

export const getCurrentUserSession = createServerFn({ method: 'GET' }).handler(
  async () => {
    return getSessionFromServer()
  },
)


