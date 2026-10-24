import { Link } from '@tanstack/react-router'
import { AlertCircle, Gavel } from 'lucide-react'
import { m } from '#/paraglide/messages'
import { Button, buttonVariants } from '#/shared/ui/button'
import { EmptyState } from '#/shared/ui/empty-state'
import { Pagination } from '#/shared/ui/pagination'
import { Price } from '#/shared/ui/price'
import { Skeleton } from '#/shared/ui/skeleton'
import { SellerLotRow } from '../components/seller-lot-row'
import { useCancelLot } from '../view-models/use-cancel-lot'
import { useSellerLots } from '../view-models/use-seller-lots'

export function SellerPage({ page = 1 }: { page?: number }) {
  const seller = useSellerLots(page)
  const cancel = useCancelLot()

  if (seller.isError) {
    return (
      <main className="container-page py-10">
        <EmptyState
          icon={AlertCircle}
          title={m.seller_error()}
          description={m.showcase_error_hint()}
          action={
            <Button variant="secondary" onClick={() => void seller.refetch()}>
              {m.showcase_retry()}
            </Button>
          }
        />
      </main>
    )
  }

  const lots = seller.data

  return (
    <main className="container-page grid gap-8 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="grid gap-2">
          <h1 className="font-display text-4xl font-bold">{m.nav_seller()}</h1>
          <p className="text-muted-foreground">{m.seller_description()}</p>
        </div>
        <Link to="/seller/new" className={buttonVariants()}>
          {m.seller_new()}
        </Link>
      </div>

      <div className="grid gap-1">
        <p className="text-sm text-muted-foreground">{m.seller_received()}</p>
        {lots ? (
          <Price
            cents={lots.totalReceivedCents}
            className="text-3xl font-semibold text-gold-text"
          />
        ) : (
          <Skeleton className="h-9 w-40" />
        )}
      </div>

      {!lots ? (
        <div className="grid gap-3">
          {Array.from({ length: 3 }, (_, index) => (
            <Skeleton key={index} className="h-24 w-full" />
          ))}
        </div>
      ) : lots.items.length === 0 ? (
        <EmptyState
          icon={Gavel}
          title={m.seller_empty()}
          description={m.seller_empty_hint()}
          action={
            <Link to="/seller/new" className={buttonVariants()}>
              {m.seller_new()}
            </Link>
          }
        />
      ) : (
        <>
          <ol>
            {lots.items.map((lot) => (
              <SellerLotRow
                key={lot.id}
                lot={lot}
                onCancel={(id) => cancel.mutate(id)}
                cancelling={cancel.isPending}
              />
            ))}
          </ol>
          <Pagination
            page={lots.page}
            pageSize={lots.pageSize}
            total={lots.total}
            onPageChange={seller.setPage}
          />
        </>
      )}
    </main>
  )
}
