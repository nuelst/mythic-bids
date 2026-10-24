import { m } from '#/paraglide/messages'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/shared/ui/card'
import { Price } from '#/shared/ui/price'
import { Skeleton } from '#/shared/ui/skeleton'
import type { Wallet } from '../api/wallet-api'

function BalanceCard({
  title,
  description,
  cents,
  emphasize,
}: {
  title: string
  description: string
  cents: number
  emphasize?: boolean
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Price
          cents={cents}
          className={
            emphasize
              ? 'text-3xl font-semibold text-gold-text'
              : 'text-2xl font-semibold'
          }
        />
      </CardContent>
    </Card>
  )
}

export function BalanceCards({ wallet }: { wallet?: Wallet }) {
  if (!wallet) {
    return (
      <div className="grid gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }, (_, index) => (
          <Card key={index}>
            <CardHeader>
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-9 w-28" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <BalanceCard
        title={m.wallet_available()}
        description={m.wallet_available_hint()}
        cents={wallet.availableCents}
        emphasize
      />
      <BalanceCard
        title={m.wallet_balance()}
        description={m.wallet_balance_hint()}
        cents={wallet.balanceCents}
      />
      <BalanceCard
        title={m.wallet_committed()}
        description={m.wallet_committed_hint()}
        cents={wallet.committedCents}
      />
    </div>
  )
}
