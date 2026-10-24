import type { components } from '#/shared/api/schema'

export type AuthUser = components['schemas']['PublicUserDto']
export type AuthSession = components['schemas']['AuthSessionDto']
export type Role = components['schemas']['Role']

const STORAGE_KEY = 'mythic.session'

let session: AuthSession | null = null
let hydrated = false
const sessionListeners = new Set<() => void>()
const unauthorizedListeners = new Set<() => void>()

function emit() {
  for (const listener of sessionListeners) listener()
}

export function hydrateSession() {
  if (hydrated) return
  hydrated = true
  if (typeof localStorage === 'undefined') return
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return
  try {
    session = JSON.parse(raw) as AuthSession
  } catch {
    localStorage.removeItem(STORAGE_KEY)
  }
}

export function getSession() {
  hydrateSession()
  return session
}

export function getAccessToken() {
  return getSession()?.accessToken ?? null
}

export function setSession(next: AuthSession | null) {
  hydrated = true
  session = next
  if (typeof localStorage !== 'undefined') {
    if (next) localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    else localStorage.removeItem(STORAGE_KEY)
  }
  emit()
}

/** Used by tests and the API client; prefer `setSession` with a full payload. */
export function setAccessToken(token: string | null) {
  if (!token) {
    setSession(null)
    return
  }
  setSession({
    accessToken: token,
    user: getSession()?.user ?? {
      id: '',
      name: '',
      email: '',
      role: 'BIDDER',
      createdAt: new Date(0).toISOString(),
    },
  })
}

export function subscribeSession(listener: () => void) {
  sessionListeners.add(listener)
  return () => {
    sessionListeners.delete(listener)
  }
}

export function subscribeUnauthorized(listener: () => void) {
  unauthorizedListeners.add(listener)
  return () => {
    unauthorizedListeners.delete(listener)
  }
}

export function notifyUnauthorized() {
  setSession(null)
  for (const listener of unauthorizedListeners) listener()
}

if (typeof localStorage !== 'undefined') hydrateSession()
