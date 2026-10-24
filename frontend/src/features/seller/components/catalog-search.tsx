import { Search } from 'lucide-react'
import { m } from '#/paraglide/messages'
import { Input } from '#/shared/ui/input'

export function CatalogSearch({
  draft,
  onDraft,
}: {
  draft: string
  onDraft: (value: string) => void
}) {
  return (
    <div className="relative">
      <Search
        className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden
      />
      <Input
        type="search"
        value={draft}
        onChange={(event) => onDraft(event.target.value)}
        placeholder={m.seller_search_placeholder()}
        aria-label={m.seller_search_label()}
        autoComplete="off"
        autoFocus
        className="pl-9"
      />
    </div>
  )
}
