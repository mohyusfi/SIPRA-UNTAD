import { getRequestHeaders } from '@tanstack/react-start-server'
import { auth } from '~/lib/auth'

export async function getSessionFromServer() {
  try {
    const headers = getRequestHeaders()
    const session = await auth.api.getSession({
      headers: headers as any,
    })
    return session
  } catch (err) {
    console.error('[getSessionFromServer Error]:', err)
    return null
  }
}
