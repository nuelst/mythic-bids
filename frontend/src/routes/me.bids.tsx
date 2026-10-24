import { createFileRoute } from '@tanstack/react-router'
import { MyBidsPage } from '#/features/bids/pages/my-bids-page'
import { requireRole } from '#/shared/auth/guards'

function validateSearch(search: Record<string, unknown>) {
  const page = Number(search.page)
  return Number.isInteger(page) && page > 1 ? { page } : {}
}

export const Route = createFileRoute('/me/bids')({
  ssr: false,
  validateSearch,
  beforeLoad: requireRole('BIDDER'),
  component: MyBidsRoute,
})

function MyBidsRoute() {
  const { page } = Route.useSearch()
  return <MyBidsPage page={page} />
}
