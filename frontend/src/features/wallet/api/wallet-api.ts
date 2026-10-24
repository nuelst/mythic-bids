import { queryOptions } from '@tanstack/react-query'
import { api } from '#/shared/api/client'
import { ApiError } from '#/shared/api/api-error'
import { queryKeys } from '#/shared/api/query-keys'
import type { components } from '#/shared/api/schema'

export type Wallet = components['schemas']['WalletDto']
export type LedgerEntry = components['schemas']['LedgerEntryDto']
export type LedgerPage = components['schemas']['LedgerPageDto']
export type LedgerEntryType = components['schemas']['LedgerEntryType']

export const LEDGER_PAGE_SIZE = 20

export async function fetchWallet(): Promise<Wallet> {
  const { data } = await api.GET('/wallet')
  if (!data) throw new ApiError(500, 'Empty response')
  return data
}

export async function fetchLedger(page = 1): Promise<LedgerPage> {
  const { data } = await api.GET('/wallet/ledger', {
    // Pagination lives on PaginationQueryDto; the generated spec omitted it.
    params: {
      query: { page, pageSize: LEDGER_PAGE_SIZE },
    } as unknown as { query?: undefined },
  })
  if (!data) throw new ApiError(500, 'Empty response')
  return data
}

export async function deposit(
  amountCents: number,
  idempotencyKey: string,
): Promise<Wallet> {
  const { data } = await api.POST('/wallet/deposits', {
    params: { header: { 'Idempotency-Key': idempotencyKey } },
    body: { amountCents },
  })
  if (!data) throw new ApiError(500, 'Empty response')
  return data
}

export function walletQueryOptions() {
  return queryOptions({
    queryKey: queryKeys.wallet(),
    queryFn: fetchWallet,
  })
}

export function ledgerQueryOptions(page: number) {
  return queryOptions({
    queryKey: queryKeys.ledger({ page, pageSize: LEDGER_PAGE_SIZE }),
    queryFn: () => fetchLedger(page),
  })
}
