export const BID_FILTERS = ['WINNING', 'OUTBID', 'WON'] as const
export type BidFilter = (typeof BID_FILTERS)[number]

export type BidsSearch = {
  page?: number
  outcome?: BidFilter
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

export function validateBidsSearch(
  search: Record<string, unknown>,
): BidsSearch {
  const page = parsePage(search.page)
  const outcome =
    typeof search.outcome === 'string' &&
    BID_FILTERS.includes(search.outcome as BidFilter)
      ? (search.outcome as BidFilter)
      : undefined
  return {
    ...(page && page > 1 ? { page } : {}),
    ...(outcome ? { outcome } : {}),
  }
}
