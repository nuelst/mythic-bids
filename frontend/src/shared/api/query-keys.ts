export const queryKeys = {
  health: () => ['health'] as const,
  me: () => ['me'] as const,
  showcase: (query?: Record<string, unknown>) =>
    query
      ? (['lots', 'showcase', query] as const)
      : (['lots', 'showcase'] as const),
  lot: (id: string) => ['lots', id] as const,
  sellerLots: (query?: Record<string, unknown>) =>
    query
      ? (['seller', 'lots', query] as const)
      : (['seller', 'lots'] as const),
  catalog: (query?: Record<string, unknown>) =>
    query ? (['catalog', query] as const) : (['catalog'] as const),
  wallet: () => ['wallet'] as const,
  ledger: (query?: Record<string, unknown>) =>
    query
      ? (['wallet', 'ledger', query] as const)
      : (['wallet', 'ledger'] as const),
  myBids: (query?: Record<string, unknown>) =>
    query ? (['me', 'bids', query] as const) : (['me', 'bids'] as const),
  receipt: (token: string) => ['receipts', token] as const,
  audit: (lotId: string) => ['audit', lotId] as const,
}
