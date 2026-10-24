import {
  getAccessToken,
  setAccessToken,
  subscribeUnauthorized,
} from '#/shared/auth/session'
import { createApiClient } from './client'

function jsonResponse(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  })
}

afterEach(() => {
  setAccessToken(null)
})

describe('api client', () => {
  it('sends the token and the current locale', async () => {
    setAccessToken('tok')
    const fetch = vi.fn(async (input: Request) => {
      expect(input.headers.get('authorization')).toBe('Bearer tok')
      expect(input.headers.get('accept-language')).toBe('pt')
      return jsonResponse(200, { status: 'ok' })
    })

    const client = createApiClient({
      baseUrl: 'http://api.test',
      fetch,
    })
    await client.GET('/health')
    expect(fetch).toHaveBeenCalledOnce()
  })

  it('throws ApiError and clears the session on 401', async () => {
    setAccessToken('expired')
    const onUnauthorized = vi.fn()
    const unsubscribe = subscribeUnauthorized(onUnauthorized)

    const client = createApiClient({
      baseUrl: 'http://api.test',
      fetch: async () =>
        jsonResponse(401, {
          statusCode: 401,
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password',
        }),
    })

    await expect(client.GET('/me')).rejects.toMatchObject({
      name: 'ApiError',
      status: 401,
      code: 'INVALID_CREDENTIALS',
    })
    expect(getAccessToken()).toBeNull()
    expect(onUnauthorized).toHaveBeenCalledOnce()
    unsubscribe()
  })
})
