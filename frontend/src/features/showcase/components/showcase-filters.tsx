import { Search } from 'lucide-react'
import { m } from '#/paraglide/messages'
import { Input } from '#/shared/ui/input'
import { Label } from '#/shared/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/shared/ui/select'
import { Tabs, TabsList, TabsTrigger } from '#/shared/ui/tabs'
import { SHOWCASE_PHASES, SHOWCASE_RARITIES } from '../api/search'
import type { ShowcasePhase, ShowcaseRarity } from '../api/search'

const PHASE_LABEL = {
  LIVE: m.showcase_phase_live,
  SCHEDULED: m.showcase_phase_scheduled,
  CLOSED: m.showcase_phase_closed,
} satisfies Record<ShowcasePhase, () => string>

const RARITY_LABEL = {
  common: m.rarity_common,
  uncommon: m.rarity_uncommon,
  rare: m.rarity_rare,
  mythic: m.rarity_mythic,
  special: m.rarity_special,
  bonus: m.rarity_bonus,
} satisfies Record<ShowcaseRarity, () => string>

export function ShowcaseFilters({
  phase,
  rarity,
  draft,
  onPhase,
  onRarity,
  onDraft,
}: {
  phase: ShowcasePhase
  rarity?: ShowcaseRarity
  draft: string
  onPhase: (phase: ShowcasePhase) => void
  onRarity: (rarity?: ShowcaseRarity) => void
  onDraft: (value: string) => void
}) {
  return (
    <div className="grid gap-4">
      <Tabs
        value={phase}
        onValueChange={(value) => onPhase(value as ShowcasePhase)}
      >
        <TabsList className="w-full sm:w-fit">
          {SHOWCASE_PHASES.map((value) => (
            <TabsTrigger
              key={value}
              value={value}
              className="flex-1 sm:flex-none"
            >
              {PHASE_LABEL[value]()}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative min-w-0 flex-1">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            type="search"
            value={draft}
            onChange={(event) => onDraft(event.target.value)}
            placeholder={m.showcase_search_placeholder()}
            aria-label={m.showcase_search_label()}
            autoComplete="off"
            className="pl-9"
          />
        </div>
        <div className="grid gap-2 sm:w-52">
          <Label htmlFor="showcase-rarity" className="sr-only">
            {m.showcase_rarity_label()}
          </Label>
          <Select
            value={rarity ?? 'all'}
            onValueChange={(value) =>
              onRarity(value === 'all' ? undefined : (value as ShowcaseRarity))
            }
          >
            <SelectTrigger id="showcase-rarity" className="w-full">
              <SelectValue placeholder={m.showcase_rarity_all()} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{m.showcase_rarity_all()}</SelectItem>
              {SHOWCASE_RARITIES.map((value) => (
                <SelectItem key={value} value={value}>
                  {RARITY_LABEL[value]()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}
