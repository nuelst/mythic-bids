export const queryKeys = {
  health: () => ['health'] as const,
  me: () => ['me'] as const,
  showcase: (query: Record<string, unknown> = {}) =>
    ['lots', 'showcase', query] as const,
  lot: (id: string) => ['lots', id] as const,
  sellerLots: (query: Record<string, unknown> = {}) =>
    ['seller', 'lots', query] as const,
  catalog: (query: Record<string, unknown> = {}) => ['catalog', query] as const,
  wallet: () => ['wallet'] as const,
  ledger: (query: Record<string, unknown> = {}) =>
    ['wallet', 'ledger', query] as const,
  myBids: (query: Record<string, unknown> = {}) =>
    ['me', 'bids', query] as const,
  receipt: (token: string) => ['receipts', token] as const,
  audit: (lotId: string) => ['audit', lotId] as const,
}
