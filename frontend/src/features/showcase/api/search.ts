export const SHOWCASE_PHASES = ['LIVE', 'SCHEDULED', 'CLOSED'] as const
export const SHOWCASE_RARITIES = [
  'common',
  'uncommon',
  'rare',
  'mythic',
  'special',
  'bonus',
] as const
export const SHOWCASE_PAGE_SIZE = 20
export const SHOWCASE_DEFAULT_PHASE = 'LIVE' as const

export type ShowcasePhase = (typeof SHOWCASE_PHASES)[number]
export type ShowcaseRarity = (typeof SHOWCASE_RARITIES)[number]

export type ShowcaseSearch = {
  phase?: ShowcasePhase
  q?: string
  rarity?: ShowcaseRarity
  page?: number
}

export type ShowcaseQuery = {
  phase: ShowcasePhase
  q?: string
  rarity?: ShowcaseRarity
  page: number
  pageSize: typeof SHOWCASE_PAGE_SIZE
}

function isPhase(value: unknown): value is ShowcasePhase {
  return (
    typeof value === 'string' &&
    (SHOWCASE_PHASES as readonly string[]).includes(value)
  )
}

function isRarity(value: unknown): value is ShowcaseRarity {
  return (
    typeof value === 'string' &&
    (SHOWCASE_RARITIES as readonly string[]).includes(value)
  )
}

/** Drops one-character queries: the API only searches from 2 characters. */
export function normalizeShowcaseQuery(value: string): string | undefined {
  const q = value.trim().slice(0, 100)
  return q.length >= 2 ? q : undefined
}

function parsePage(value: unknown): number | undefined {
  const page =
    typeof value === 'number'
      ? value
      : typeof value === 'string'
        ? Number(value)
        : Number.NaN
  if (!Number.isInteger(page) || page < 1) return undefined
  return page
}

export function validateShowcaseSearch(
  search: Record<string, unknown>,
): ShowcaseSearch {
  return compactShowcaseSearch({
    phase: isPhase(search.phase) ? search.phase : undefined,
    q: typeof search.q === 'string' ? search.q : undefined,
    rarity: isRarity(search.rarity) ? search.rarity : undefined,
    page: parsePage(search.page),
  })
}

/** Defaults applied when talking to the API (LIVE, page 1). */
export function toShowcaseQuery(search: ShowcaseSearch): ShowcaseQuery {
  return {
    phase: search.phase ?? SHOWCASE_DEFAULT_PHASE,
    q: search.q,
    rarity: search.rarity,
    page: search.page ?? 1,
    pageSize: SHOWCASE_PAGE_SIZE,
  }
}

/** Omits LIVE / page 1 so the home URL stays clean. */
export function compactShowcaseSearch(search: ShowcaseSearch): ShowcaseSearch {
  const next: ShowcaseSearch = {}
  if (search.phase && search.phase !== SHOWCASE_DEFAULT_PHASE) {
    next.phase = search.phase
  }
  const q =
    typeof search.q === 'string' ? normalizeShowcaseQuery(search.q) : undefined
  if (q) next.q = q
  if (search.rarity) next.rarity = search.rarity
  if (search.page && search.page > 1) next.page = search.page
  return next
}
