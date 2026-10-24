/** In-memory token. Phase 5 persists the session and wires the 401 redirect. */

let accessToken: string | null = null
const unauthorizedListeners = new Set<() => void>()

export function getAccessToken() {
  return accessToken
}

export function setAccessToken(token: string | null) {
  accessToken = token
}

export function subscribeUnauthorized(listener: () => void) {
  unauthorizedListeners.add(listener)
  return () => {
    unauthorizedListeners.delete(listener)
  }
}

export function notifyUnauthorized() {
  accessToken = null
  for (const listener of unauthorizedListeners) listener()
}
