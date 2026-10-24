import { createFileRoute } from '@tanstack/react-router'
import { m } from '#/paraglide/messages'
import { requireRole } from '#/shared/auth/guards'

export const Route = createFileRoute('/wallet')({
  ssr: false,
  beforeLoad: requireRole('BIDDER'),
  component: WalletPlaceholder,
})

function WalletPlaceholder() {
  return (
    <main className="container-page py-10">
      <h1 className="font-display text-3xl font-semibold">{m.nav_wallet()}</h1>
    </main>
  )
}
