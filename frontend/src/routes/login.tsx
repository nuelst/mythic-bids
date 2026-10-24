import { createFileRoute } from '@tanstack/react-router'
import { LoginPage } from '#/features/auth/pages/login-page'
import { requireGuest } from '#/shared/auth/guards'

export const Route = createFileRoute('/login')({
  ssr: false,
  validateSearch: (search: Record<string, unknown>) => ({
    redirect: typeof search.redirect === 'string' ? search.redirect : undefined,
  }),
  beforeLoad: requireGuest,
  component: LoginRoute,
})

function LoginRoute() {
  const { redirect } = Route.useSearch()
  return <LoginPage redirect={redirect} />
}
