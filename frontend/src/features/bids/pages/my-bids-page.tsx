import { Link } from '@tanstack/react-router'
import { AlertCircle, Gavel } from 'lucide-react'
import { m } from '#/paraglide/messages'
import { Button, buttonVariants } from '#/shared/ui/button'
import { EmptyState } from '#/shared/ui/empty-state'
import { Pagination } from '#/shared/ui/pagination'
import { Skeleton } from '#/shared/ui/skeleton'
import { Tabs, TabsList, TabsTrigger } from '#/shared/ui/tabs'
import { BID_FILTERS } from '../api/search'
import type { BidFilter, BidsSearch } from '../api/search'
import { BidRow } from '../components/bid-row'
import { useMyBids } from '../view-models/use-my-bids'

const FILTER_LABEL = {
  WINNING: m.bids_outcome_winning,
  OUTBID: m.bids_outcome_outbid,
  WON: m.bids_outcome_won,
} satisfies Record<BidFilter, () => string>

export function MyBidsPage({ search }: { search: BidsSearch }) {
  const bids = useMyBids(search)

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

  const emptyAll = bids.data && bids.data.items.length === 0
  const emptyFilter = !emptyAll && bids.items && bids.items.length === 0

  return (
    <main className="container-page grid gap-8 py-10">
      <div className="grid gap-2">
        <h1 className="font-display text-4xl font-bold">{m.nav_bids()}</h1>
        <p className="text-muted-foreground">{m.bids_description()}</p>
      </div>

      <Tabs
        value={bids.outcome ?? 'all'}
        onValueChange={(value) =>
          bids.setOutcome(value === 'all' ? undefined : (value as BidFilter))
        }
      >
        <TabsList className="w-full sm:w-fit">
          <TabsTrigger value="all" className="flex-1 sm:flex-none">
            {m.bids_outcome_all()}
          </TabsTrigger>
          {BID_FILTERS.map((value) => (
            <TabsTrigger
              key={value}
              value={value}
              className="flex-1 sm:flex-none"
            >
              {FILTER_LABEL[value]()}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {!bids.data || !bids.items ? (
        <div className="grid gap-3">
          {Array.from({ length: 3 }, (_, index) => (
            <Skeleton key={index} className="h-24 w-full" />
          ))}
        </div>
      ) : emptyAll ? (
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
      ) : emptyFilter ? (
        <EmptyState
          icon={Gavel}
          title={m.bids_filter_empty()}
          description={m.bids_filter_empty_hint()}
        />
      ) : (
        <>
          <ol className="divide-y border-y">
            {bids.items.map((bid) => (
              <BidRow key={bid.lot.id} bid={bid} />
            ))}
          </ol>
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
