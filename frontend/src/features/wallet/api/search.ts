export type WalletSearch = {
  page?: number
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

export function validateWalletSearch(
  search: Record<string, unknown>,
): WalletSearch {
  const page = parsePage(search.page)
  return page && page > 1 ? { page } : {}
}
