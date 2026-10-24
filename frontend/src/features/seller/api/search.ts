export const SELLER_PHASES = [
  'LIVE',
  'SCHEDULED',
  'CLOSED',
  'CANCELLED',
] as const
export type SellerPhase = (typeof SELLER_PHASES)[number]

export type SellerSearch = {
  page?: number
  phase?: SellerPhase
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

export function validateSellerSearch(
  search: Record<string, unknown>,
): SellerSearch {
  const page = parsePage(search.page)
  const phase =
    typeof search.phase === 'string' &&
    SELLER_PHASES.includes(search.phase as SellerPhase)
      ? (search.phase as SellerPhase)
      : undefined
  return {
    ...(page && page > 1 ? { page } : {}),
    ...(phase ? { phase } : {}),
  }
}

export function matchesSellerPhase(
  lotPhase: string,
  filter?: SellerPhase,
): boolean {
  if (!filter) return true
  if (filter === 'CLOSED') return lotPhase === 'CLOSED' || lotPhase === 'CLOSING'
  return lotPhase === filter
}
