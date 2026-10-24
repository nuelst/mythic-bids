import { createFileRoute } from '@tanstack/react-router'
import { WalletPage } from '#/features/wallet/pages/wallet-page'
import { validateWalletSearch } from '#/features/wallet/api/search'
import { requireRole } from '#/shared/auth/guards'

export const Route = createFileRoute('/wallet')({
  ssr: false,
  validateSearch: validateWalletSearch,
  beforeLoad: requireRole('BIDDER'),
  component: WalletRoute,
})

function WalletRoute() {
  return <WalletPage search={Route.useSearch()} />
}
