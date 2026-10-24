import { queryOptions } from '@tanstack/react-query'
import { api } from '#/shared/api/client'
import { ApiError } from '#/shared/api/api-error'
import { queryKeys } from '#/shared/api/query-keys'
import type { components } from '#/shared/api/schema'

export type MyBid = components['schemas']['MyBidDto']
export type MyBidsPage = components['schemas']['MyBidsPageDto']
export type BidOutcome = MyBid['outcome']

export const BIDS_PAGE_SIZE = 20

export const BID_OUTCOMES = [
  'WINNING',
  'OUTBID',
  'WON',
  'LOST',
  'CANCELLED',
] as const satisfies readonly BidOutcome[]

export async function fetchMyBids(page = 1): Promise<MyBidsPage> {
  const { data } = await api.GET('/me/bids', {
    // Pagination lives on PaginationQueryDto; the generated spec omitted it.
    params: {
      query: { page, pageSize: BIDS_PAGE_SIZE },
    } as unknown as { query?: undefined },
  })
  if (!data) throw new ApiError(500, 'Empty response')
  return data
}

export function myBidsQueryOptions(page: number) {
  return queryOptions({
    queryKey: queryKeys.myBids({ page, pageSize: BIDS_PAGE_SIZE }),
    queryFn: () => fetchMyBids(page),
  })
}

export function groupBidsByOutcome(items: MyBid[]) {
  return BID_OUTCOMES.map((outcome) => ({
    outcome,
    items: items.filter((item) => item.outcome === outcome),
  })).filter((group) => group.items.length > 0)
}
