import { queryOptions } from '@tanstack/react-query'
import { api } from '#/shared/api/client'
import { ApiError } from '#/shared/api/api-error'
import { queryKeys } from '#/shared/api/query-keys'
import { getLocale } from '#/paraglide/runtime'
import type { components } from '#/shared/api/schema'
import { fromDateTimeLocal } from './schedule'
import type { CreateLotValues } from './schemas'

export type CatalogItem = components['schemas']['CatalogItemDto']
export type CatalogSearch = components['schemas']['CatalogSearchDto']
export type Lot = components['schemas']['LotDto']
export type SellerLotsPage = components['schemas']['SellerLotsPageDto']

export const SELLER_PAGE_SIZE = 20

export async function searchCatalog(
  q: string,
  options?: { signal?: AbortSignal; page?: number },
): Promise<CatalogSearch> {
  const { data } = await api.GET('/catalog/search', {
    params: {
      query: {
        q,
        page: options?.page ?? 1,
        lang: getLocale(),
      },
    },
    signal: options?.signal,
  })
  if (!data) throw new ApiError(500, 'Empty response')
  return data
}

export async function fetchSellerLots(page = 1): Promise<SellerLotsPage> {
  const { data } = await api.GET('/seller/lots', {
    params: {
      query: { page, pageSize: SELLER_PAGE_SIZE },
    } as unknown as { query?: undefined },
  })
  if (!data) throw new ApiError(500, 'Empty response')
  return data
}

export async function createLot(values: CreateLotValues): Promise<Lot> {
  const startsAt = fromDateTimeLocal(values.startsAt ?? '')
  const endsAt = fromDateTimeLocal(values.endsAt)
  if (!endsAt) throw new ApiError(400, 'Invalid schedule')
  const { data } = await api.POST('/lots', {
    body: {
      itemId: values.itemId,
      startingPriceCents: values.startingPriceCents,
      minIncrementCents: values.minIncrementCents,
      startsAt: startsAt?.toISOString(),
      endsAt: endsAt.toISOString(),
    },
  })
  if (!data) throw new ApiError(500, 'Empty response')
  return data
}

export async function cancelLot(lotId: string): Promise<Lot> {
  const { data } = await api.DELETE('/lots/{id}', {
    params: { path: { id: lotId } },
  })
  if (!data) throw new ApiError(500, 'Empty response')
  return data
}

export function catalogQueryOptions(q: string, page = 1) {
  return queryOptions({
    queryKey: queryKeys.catalog({ q, page, lang: getLocale() }),
    queryFn: ({ signal }) => searchCatalog(q, { signal, page }),
    enabled: q.trim().length >= 2,
  })
}

export function sellerLotsQueryOptions(page: number) {
  return queryOptions({
    queryKey: queryKeys.sellerLots({ page, pageSize: SELLER_PAGE_SIZE }),
    queryFn: () => fetchSellerLots(page),
  })
}

export function applyOptimisticCancel(lot: Lot, now = new Date()): Lot {
  return {
    ...lot,
    phase: 'CANCELLED',
    cancelledAt: now.toISOString(),
  }
}

export function canCancel(lot: Lot) {
  return lot.phase === 'LIVE' || lot.phase === 'SCHEDULED'
}
