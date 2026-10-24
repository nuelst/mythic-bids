import { Gavel, SearchX } from 'lucide-react'
import { m } from '#/paraglide/messages'
import { Button } from '#/shared/ui/button'
import { EmptyState } from '#/shared/ui/empty-state'
import { Skeleton } from '#/shared/ui/skeleton'
import type { ShowcasePhase } from '../api/search'
import type { Lot } from '../api/showcase-api'
import { LotCard } from './lot-card'

const EMPTY = {
  LIVE: {
    title: m.showcase_empty_live,
    description: m.showcase_empty_live_hint,
  },
  SCHEDULED: {
    title: m.showcase_empty_scheduled,
    description: m.showcase_empty_scheduled_hint,
  },
  CLOSED: {
    title: m.showcase_empty_closed,
    description: m.showcase_empty_closed_hint,
  },
} satisfies Record<
  ShowcasePhase,
  { title: () => string; description: () => string }
>

export function LotCardSkeleton() {
  return (
    <div className="grid gap-3 rounded-lg border bg-surface p-4">
      <Skeleton className="aspect-[63/88] rounded-xl" />
      <Skeleton className="h-5 w-24" />
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-7 w-28" />
    </div>
  )
}

export function ShowcaseGrid({
  lots,
  filtered,
  phase,
  onClear,
}: {
  lots: Lot[]
  filtered: boolean
  phase: ShowcasePhase
  onClear: () => void
}) {
  if (lots.length === 0) {
    if (filtered) {
      return (
        <EmptyState
          icon={SearchX}
          title={m.showcase_empty_filtered()}
          description={m.showcase_empty_filtered_hint()}
          action={
            <Button variant="secondary" onClick={onClear}>
              {m.showcase_clear_filters()}
            </Button>
          }
        />
      )
    }
    const copy = EMPTY[phase]
    return (
      <EmptyState
        icon={Gavel}
        title={copy.title()}
        description={copy.description()}
      />
    )
  }

  return (
    <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {lots.map((lot, index) => (
        <li key={lot.id}>
          <LotCard lot={lot} priority={index < 4} />
        </li>
      ))}
    </ul>
  )
}
