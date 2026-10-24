import { createFileRoute } from '@tanstack/react-router'
import { MyBidsPage } from '#/features/bids/pages/my-bids-page'
import { validateBidsSearch } from '#/features/bids/api/search'
import { requireRole } from '#/shared/auth/guards'

export const Route = createFileRoute('/me/bids')({
  ssr: false,
  validateSearch: validateBidsSearch,
  beforeLoad: requireRole('BIDDER'),
  component: MyBidsRoute,
})

function MyBidsRoute() {
  return <MyBidsPage search={Route.useSearch()} />
}
