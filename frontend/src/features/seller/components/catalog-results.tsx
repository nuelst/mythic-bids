import { m } from '#/paraglide/messages'
import { getLocale } from '#/paraglide/runtime'
import { cn } from '#/shared/lib/cn'
import { CardImage } from '#/shared/ui/card-image'
import { Pagination } from '#/shared/ui/pagination'
import { RarityBadge } from '#/shared/ui/rarity-badge'
import { Skeleton } from '#/shared/ui/skeleton'
import type { CatalogItem, CatalogSearch } from '../api/seller-api'

function formatReference(item: CatalogItem) {
  const price = item.referencePrice
  if (!price) return null
  const locale = getLocale()
  if (locale === 'pt' && price.eur) return `€${price.eur}`
  if (price.usd) return `$${price.usd}`
  if (price.eur) return `€${price.eur}`
  return null
}

export function CatalogResults({
  data,
  items,
  fetching,
  page,
  pageSize,
  total,
  onPageChange,
  selectedId,
  onSelect,
}: {
  data?: CatalogSearch
  items: CatalogItem[]
  fetching: boolean
  page: number
  pageSize: number
  total: number
  onPageChange: (page: number) => void
  selectedId?: string
  onSelect: (item: CatalogItem) => void
}) {
  if (fetching && !data) {
    return (
      <div className="grid gap-3 sm:grid-cols-2">
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton key={index} className="h-28 w-full" />
        ))}
      </div>
    )
  }

  if (!data) return null

  if (data.items.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">{m.seller_search_empty()}</p>
    )
  }

  return (
    <div className="grid gap-4">
      <ul className="grid gap-3 sm:grid-cols-2">
        {items.map((item) => {
          const selected = item.id === selectedId
          const reference = formatReference(item)
          return (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => onSelect(item)}
                className={cn(
                  'group flex w-full gap-3 rounded-lg border p-3 text-left transition-colors',
                  selected
                    ? 'border-primary bg-primary-soft'
                    : 'hover:border-border-strong hover:bg-muted',
                )}
              >
                <CardImage
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-16 shrink-0"
                />
                <span className="grid min-w-0 gap-1">
                  <span className="font-display font-semibold">{item.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {item.setName} · {item.collectorNumber} · {item.lang}
                  </span>
                  <span className="flex flex-wrap items-center gap-2">
                    <RarityBadge rarity={item.rarity} />
                    {reference && (
                      <span className="text-xs text-muted-foreground">
                        {m.seller_reference({ price: reference })}
                      </span>
                    )}
                  </span>
                </span>
              </button>
            </li>
          )
        })}
      </ul>
      <Pagination
        page={page}
        pageSize={pageSize}
        total={total}
        onPageChange={onPageChange}
      />
    </div>
  )
}
