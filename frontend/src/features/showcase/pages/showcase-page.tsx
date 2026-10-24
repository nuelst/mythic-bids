import { AlertCircle } from 'lucide-react'
import { m } from '#/paraglide/messages'
import { Button } from '#/shared/ui/button'
import { EmptyState } from '#/shared/ui/empty-state'
import { Pagination } from '#/shared/ui/pagination'
import { ShowcaseFilters } from '../components/showcase-filters'
import { LotCardSkeleton, ShowcaseGrid } from '../components/showcase-grid'
import { useShowcase } from '../view-models/use-showcase'
import type { ShowcaseSearch } from '../api/search'

export function ShowcasePage({ search }: { search: ShowcaseSearch }) {
  const showcase = useShowcase(search)
  const filtered = Boolean(search.q || search.rarity)

  return (
    <main className="container-page grid gap-8 py-10">
      <div className="grid gap-2">
        <h1 className="font-display text-4xl font-bold">
          {m.showcase_title()}
        </h1>
        <p className="text-muted-foreground">{m.showcase_description()}</p>
      </div>

      <ShowcaseFilters
        phase={showcase.phase}
        rarity={showcase.rarity}
        draft={showcase.draft}
        onPhase={showcase.setPhase}
        onRarity={showcase.setRarity}
        onDraft={showcase.setDraft}
      />

      {showcase.isError && !showcase.data ? (
        <EmptyState
          icon={AlertCircle}
          title={m.showcase_error()}
          description={m.showcase_error_hint()}
          action={
            <Button variant="secondary" onClick={() => void showcase.refetch()}>
              {m.showcase_retry()}
            </Button>
          }
        />
      ) : showcase.isPending && !showcase.data ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }, (_, index) => (
            <LotCardSkeleton key={index} />
          ))}
        </div>
      ) : (
        <>
          <ShowcaseGrid
            lots={showcase.data?.items ?? []}
            filtered={filtered}
            phase={showcase.phase}
            onClear={showcase.clearFilters}
          />
          {showcase.data && (
            <Pagination
              page={showcase.data.page}
              pageSize={showcase.data.pageSize}
              total={showcase.data.total}
              onPageChange={showcase.setPage}
            />
          )}
        </>
      )}
    </main>
  )
}
