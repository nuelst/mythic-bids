import { Link } from '@tanstack/react-router'
import type { ErrorComponentProps } from '@tanstack/react-router'
import { AlertCircle, SearchX } from 'lucide-react'
import { m } from '#/paraglide/messages'
import { isApiError } from '#/shared/api/api-error'
import { errorMessage } from '#/shared/i18n/error-messages'
import { Button, buttonVariants } from '#/shared/ui/button'
import { EmptyState } from '#/shared/ui/empty-state'
import { Skeleton } from '#/shared/ui/skeleton'

export function RouteError({ error, reset }: ErrorComponentProps) {
  const description =
    isApiError(error) && error.code
      ? errorMessage(error.code, { minimumCents: error.minimumCents })
      : error instanceof Error && error.message
        ? error.message
        : m.error_unknown()

  return (
    <main className="container-page py-10">
      <EmptyState
        icon={AlertCircle}
        title={m.error_unknown()}
        description={description}
        action={
          <Button variant="secondary" onClick={reset}>
            {m.showcase_retry()}
          </Button>
        }
      />
    </main>
  )
}

export function RouteNotFound() {
  return (
    <main className="container-page py-10">
      <EmptyState
        icon={SearchX}
        title={m.not_found_title()}
        description={m.not_found_hint()}
        action={
          <Link to="/" search={{}} className={buttonVariants()}>
            {m.nav_home()}
          </Link>
        }
      />
    </main>
  )
}

export function RoutePending() {
  return (
    <main
      className="container-page grid gap-6 py-10"
      aria-busy="true"
      aria-live="polite"
    >
      <p className="sr-only">{m.loading()}</p>
      <Skeleton className="h-10 w-64 max-w-full" />
      <Skeleton className="h-5 w-96 max-w-full" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, index) => (
          <Skeleton key={index} className="h-56 w-full" />
        ))}
      </div>
    </main>
  )
}
