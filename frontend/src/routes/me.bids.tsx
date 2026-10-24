import { createFileRoute } from '@tanstack/react-router'
import { m } from '#/paraglide/messages'
import { requireRole } from '#/shared/auth/guards'

export const Route = createFileRoute('/me/bids')({
  ssr: false,
  beforeLoad: requireRole('BIDDER'),
  component: MyBidsPlaceholder,
})

function MyBidsPlaceholder() {
  return (
    <main className="container-page py-10">
      <h1 className="font-display text-3xl font-semibold">{m.nav_bids()}</h1>
    </main>
  )
}
