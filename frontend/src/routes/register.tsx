import { createFileRoute } from '@tanstack/react-router'
import { RegisterPage } from '#/features/auth/pages/register-page'
import { requireGuest } from '#/shared/auth/guards'

export const Route = createFileRoute('/register')({
  ssr: false,
  validateSearch: (search: Record<string, unknown>) => ({
    redirect: typeof search.redirect === 'string' ? search.redirect : undefined,
  }),
  beforeLoad: requireGuest,
  component: RegisterRoute,
})

function RegisterRoute() {
  const { redirect } = Route.useSearch()
  return <RegisterPage redirect={redirect} />
}
