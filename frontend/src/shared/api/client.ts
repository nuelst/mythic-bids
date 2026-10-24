import createClient from 'openapi-fetch'
import type { ClientOptions, Middleware } from 'openapi-fetch'
import { getLocale } from '#/paraglide/runtime'
import { getAccessToken, notifyUnauthorized } from '#/shared/auth/session'
import { API_URL } from '#/shared/lib/env'
import { toApiError } from './api-error'
import type { paths } from './schema'

const middleware: Middleware = {
  onRequest({ request }) {
    const token = getAccessToken()
    if (token) request.headers.set('Authorization', `Bearer ${token}`)
    request.headers.set('Accept-Language', getLocale())
    return request
  },
  async onResponse({ response }) {
    if (response.ok) return
    const error = await toApiError(response)
    if (response.status === 401) notifyUnauthorized()
    throw error
  },
}

export function createApiClient(options?: {
  baseUrl?: string
  fetch?: ClientOptions['fetch']
}) {
  const client = createClient<paths>({
    baseUrl: options?.baseUrl ?? API_URL,
    fetch: options?.fetch,
  })
  client.use(middleware)
  return client
}

export const api = createApiClient()
