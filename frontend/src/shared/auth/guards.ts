import { redirect } from '@tanstack/react-router'
import { safeRedirect } from './redirect'
import { getSession, hydrateSession } from './session'
import type { Role } from './session'

export function requireAuth({
  location,
}: {
  location: { pathname: string; href: string }
}) {
  hydrateSession()
  const session = getSession()
  if (!session) {
    throw redirect({
      to: '/login',
      search: {
        redirect: location.href.startsWith('/')
          ? location.href
          : location.pathname,
      },
    })
  }
  return { session }
}

export function requireRole(role: Role) {
  return (ctx: { location: { pathname: string; href: string } }) => {
    const { session } = requireAuth(ctx)
    if (session.user.role !== role) throw redirect({ to: '/', search: {} })
    return { session }
  }
}

export function requireGuest({
  location,
}: {
  location: { search: { redirect?: string } }
}) {
  hydrateSession()
  if (getSession()) {
    throw redirect({ to: safeRedirect(location.search.redirect) ?? '/' })
  }
}
