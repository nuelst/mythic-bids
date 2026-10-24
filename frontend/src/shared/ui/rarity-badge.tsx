import { m } from '#/paraglide/messages'
import { Badge } from './badge'
import type { BadgeTone } from './badge'

const RARITIES = {
  common: { tone: 'common', label: m.rarity_common },
  uncommon: { tone: 'uncommon', label: m.rarity_uncommon },
  rare: { tone: 'rare', label: m.rarity_rare },
  mythic: { tone: 'mythic', label: m.rarity_mythic },
  special: { tone: 'special', label: m.rarity_special },
  bonus: { tone: 'special', label: m.rarity_bonus },
} satisfies Record<string, { tone: BadgeTone; label: () => string }>

function RarityBadge({ rarity }: { rarity: string }) {
  const known =
    rarity in RARITIES ? RARITIES[rarity as keyof typeof RARITIES] : undefined
  return (
    <Badge tone={known?.tone ?? 'neutral'}>
      <span className="size-1.5 rounded-full bg-current" aria-hidden />
      {known ? known.label() : rarity}
    </Badge>
  )
}

export { RarityBadge }
