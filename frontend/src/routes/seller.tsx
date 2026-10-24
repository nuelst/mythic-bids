import { createFileRoute } from '@tanstack/react-router'
import { m } from '#/paraglide/messages'
import { requireRole } from '#/shared/auth/guards'

export const Route = createFileRoute('/seller')({
  ssr: false,
  beforeLoad: requireRole('AUCTIONEER'),
  component: SellerPlaceholder,
})

function SellerPlaceholder() {
  return (
    <main className="container-page py-10">
      <h1 className="font-display text-3xl font-semibold">{m.nav_seller()}</h1>
    </main>
  )
}
