import handler from '@tanstack/react-start/server-entry'
import { paraglideMiddleware } from './paraglide/server.js'
import { cookieMaxAge, cookieName } from './paraglide/runtime.js'

// Resolves the locale per request (cookie, then Accept-Language) so SSR renders in the
// user's language. The resolved locale is also stored in the cookie the client reads first,
// so server and client always agree on hydration, even when no Accept-Language is sent.
export default {
  fetch(request: Request): Promise<Response> {
    return paraglideMiddleware(request, async ({ locale }) => {
      const response = await handler.fetch(request)
      const hasCookie = request.headers
        .get('cookie')
        ?.includes(`${cookieName}=`)

      if (!hasCookie) {
        response.headers.append(
          'Set-Cookie',
          `${cookieName}=${locale}; Path=/; Max-Age=${cookieMaxAge}; SameSite=Lax`,
        )
      }
      return response
    })
  },
}
