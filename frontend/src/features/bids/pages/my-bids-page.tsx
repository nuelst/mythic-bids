import { Link } from '@tanstack/react-router'
import { AlertCircle, Gavel } from 'lucide-react'
import { m } from '#/paraglide/messages'
import { Button, buttonVariants } from '#/shared/ui/button'
import { EmptyState } from '#/shared/ui/empty-state'
import { Pagination } from '#/shared/ui/pagination'
import { Skeleton } from '#/shared/ui/skeleton'
import type { BidOutcome } from '../api/bids-api'
import { BidRow } from '../components/bid-row'
import { useMyBids } from '../view-models/use-my-bids'

const GROUP_TITLE = {
  WINNING: m.bids_outcome_winning,
  OUTBID: m.bids_outcome_outbid,
  WON: m.bids_outcome_won,
  LOST: m.bids_outcome_lost,
  CANCELLED: m.bids_outcome_cancelled,
} satisfies Record<BidOutcome, () => string>

export function MyBidsPage({ page = 1 }: { page?: number }) {
  const bids = useMyBids(page)

  if (bids.isError) {
    return (
      <main className="container-page py-10">
        <EmptyState
          icon={AlertCircle}
          title={m.bids_error()}
          description={m.showcase_error_hint()}
          action={
            <Button variant="secondary" onClick={() => void bids.refetch()}>
              {m.showcase_retry()}
            </Button>
          }
        />
      </main>
    )
  }

  return (
    <main className="container-page grid gap-8 py-10">
      <div className="grid gap-2">
        <h1 className="font-display text-4xl font-bold">{m.nav_bids()}</h1>
        <p className="text-muted-foreground">{m.bids_description()}</p>
      </div>

      {!bids.data || !bids.groups ? (
        <div className="grid gap-3">
          {Array.from({ length: 3 }, (_, index) => (
            <Skeleton key={index} className="h-24 w-full" />
          ))}
        </div>
      ) : bids.data.items.length === 0 ? (
        <EmptyState
          icon={Gavel}
          title={m.bids_empty()}
          description={m.bids_empty_hint()}
          action={
            <Link to="/" search={{}} className={buttonVariants()}>
              {m.bids_browse()}
            </Link>
          }
        />
      ) : (
        <>
          {bids.groups.map((group) => (
            <section key={group.outcome} className="grid gap-2">
              <h2 className="font-display text-xl font-semibold">
                {GROUP_TITLE[group.outcome]()}
              </h2>
              <ol className="divide-y border-y">
                {group.items.map((bid) => (
                  <BidRow key={bid.lot.id} bid={bid} />
                ))}
              </ol>
            </section>
          ))}
          <Pagination
            page={bids.data.page}
            pageSize={bids.data.pageSize}
            total={bids.data.total}
            onPageChange={bids.setPage}
          />
        </>
      )}
    </main>
  )
}
