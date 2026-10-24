import { Link } from '@tanstack/react-router'
import { AlertCircle, SearchX } from 'lucide-react'
import { m } from '#/paraglide/messages'
import { getLocale } from '#/paraglide/runtime'
import { formatDateTime } from '#/shared/lib/datetime'
import { Alias } from '#/shared/ui/alias'
import { Badge } from '#/shared/ui/badge'
import { Button, buttonVariants } from '#/shared/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '#/shared/ui/card'
import { CardImage } from '#/shared/ui/card-image'
import { CopyButton } from '#/shared/ui/copy-button'
import { EmptyState } from '#/shared/ui/empty-state'
import { Price } from '#/shared/ui/price'
import { RarityBadge } from '#/shared/ui/rarity-badge'
import { Skeleton } from '#/shared/ui/skeleton'
import { shortHash } from '../api/receipt-view'
import { AuditStatus } from '../components/audit-status'
import { HashChain } from '../components/hash-chain'
import { PublicKeyCard } from '../components/public-key-card'
import { ReceiptSeal } from '../components/receipt-seal'
import { useReceipt } from '../view-models/use-receipt'

function ReceiptSkeleton() {
  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,18rem)_1fr]">
      <Skeleton className="aspect-[63/88] rounded-xl" />
      <div className="grid gap-3">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="h-5 w-1/2" />
        <Skeleton className="h-12 w-40" />
        <Skeleton className="h-24 w-full" />
      </div>
    </div>
  )
}

export function ReceiptPage({ token }: { token: string }) {
  const state = useReceipt(token)

  if (state.isNotFound) {
    return (
      <main className="container-page py-10">
        <EmptyState
          icon={SearchX}
          title={m.error_receipt_not_found()}
          description={m.receipt_not_found_hint()}
          action={
            <Link
              to="/"
              search={{}}
              className={buttonVariants({ variant: 'secondary' })}
            >
              {m.lot_room_back()}
            </Link>
          }
        />
      </main>
    )
  }

  if (state.isError) {
    return (
      <main className="container-page py-10">
        <EmptyState
          icon={AlertCircle}
          title={m.receipt_error()}
          description={m.showcase_error_hint()}
          action={
            <Button variant="secondary" onClick={() => state.refetch()}>
              {m.showcase_retry()}
            </Button>
          }
        />
      </main>
    )
  }

  const receipt = state.receipt

  return (
    <main className="container-page grid gap-10 py-10">
      <div className="grid gap-2">
        <p className="text-sm text-muted-foreground">{m.receipt_title()}</p>
        <h1 className="font-display text-4xl font-bold">
          {receipt ? receipt.lot.item.name : m.toast_view_receipt()}
        </h1>
        <p className="text-muted-foreground">{m.receipt_description()}</p>
      </div>

      {!receipt ? (
        <ReceiptSkeleton />
      ) : (
        <>
          <div className="grid gap-8 lg:grid-cols-[minmax(0,18rem)_1fr] lg:items-start">
            <CardImage
              src={receipt.lot.item.imageUrl}
              alt={receipt.lot.item.name}
              priority
            />
            <div className="grid gap-5">
              <div className="flex flex-wrap gap-1.5">
                <RarityBadge rarity={receipt.lot.item.rarity} />
                <Badge tone="gold">{m.showcase_sold()}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {receipt.lot.item.setName} · {receipt.lot.item.collectorNumber}{' '}
                · {receipt.lot.item.lang}
              </p>
              <div className="grid gap-1">
                <p className="text-sm text-muted-foreground">
                  {m.receipt_amount()}
                </p>
                <Price
                  cents={receipt.amountCents}
                  className="text-4xl font-semibold text-gold-text"
                />
                <p className="text-sm text-muted-foreground">
                  {m.showcase_bids({ count: receipt.bidCount })}
                </p>
              </div>
              <p className="flex flex-wrap items-center gap-2 text-sm">
                <span className="text-muted-foreground">
                  {m.receipt_winner()}
                </span>
                <Alias value={receipt.winnerAlias} />
              </p>
              <p className="text-sm text-muted-foreground">
                {m.receipt_issued({
                  when: formatDateTime(receipt.issuedAt, getLocale()),
                })}
              </p>
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <span className="text-muted-foreground">
                  {m.receipt_final_hash()}
                </span>
                <code
                  title={receipt.finalHash}
                  className="font-mono text-xs text-muted-foreground"
                >
                  {shortHash(receipt.finalHash)}
                </code>
                <CopyButton
                  value={receipt.finalHash}
                  label={m.receipt_final_hash()}
                />
              </div>
              <ReceiptSeal valid={receipt.sealValid} />
              <Link
                to="/lots/$lotId"
                params={{ lotId: receipt.lot.id }}
                className={buttonVariants({ variant: 'secondary', size: 'sm' })}
              >
                {m.receipt_view_lot()}
              </Link>
            </div>
          </div>

          <section className="grid gap-4">
            <h2 className="font-display text-2xl font-semibold">
              {m.audit_title()}
            </h2>
            {state.auditError ? (
              <p className="text-sm text-danger">{m.audit_error()}</p>
            ) : state.audit ? (
              <AuditStatus report={state.audit} />
            ) : (
              <Skeleton className="h-24 w-full" />
            )}
          </section>

          <Card>
            <CardHeader>
              <CardTitle>{m.audit_chain()}</CardTitle>
            </CardHeader>
            <CardContent>
              {state.audit ? (
                <HashChain report={state.audit} />
              ) : (
                <Skeleton className="h-40 w-full" />
              )}
            </CardContent>
          </Card>

          <PublicKeyCard pem={state.publicKey} />
        </>
      )}
    </main>
  )
}
