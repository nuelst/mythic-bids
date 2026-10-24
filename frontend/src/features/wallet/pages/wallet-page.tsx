import { AlertCircle } from 'lucide-react'
import { m } from '#/paraglide/messages'
import { Button } from '#/shared/ui/button'
import { EmptyState } from '#/shared/ui/empty-state'
import { BalanceCards } from '../components/balance-cards'
import { DepositDialog } from '../components/deposit-dialog'
import { LedgerList } from '../components/ledger-list'
import { useWallet } from '../view-models/use-wallet'
import type { WalletSearch } from '../api/search'

export function WalletPage({ search }: { search: WalletSearch }) {
  const wallet = useWallet(search)

  if (wallet.isError) {
    return (
      <main className="container-page py-10">
        <EmptyState
          icon={AlertCircle}
          title={m.wallet_error()}
          description={m.showcase_error_hint()}
          action={
            <Button variant="secondary" onClick={() => wallet.refetch()}>
              {m.showcase_retry()}
            </Button>
          }
        />
      </main>
    )
  }

  return (
    <main className="container-page grid gap-10 py-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="grid gap-2">
          <h1 className="font-display text-4xl font-bold">{m.nav_wallet()}</h1>
          <p className="text-muted-foreground">{m.wallet_description()}</p>
        </div>
        <DepositDialog />
      </div>

      <BalanceCards wallet={wallet.wallet} />

      <section className="grid gap-4">
        <h2 className="font-display text-xl font-semibold">
          {m.wallet_ledger()}
        </h2>
        <LedgerList ledger={wallet.ledger} onPageChange={wallet.setPage} />
      </section>
    </main>
  )
}
