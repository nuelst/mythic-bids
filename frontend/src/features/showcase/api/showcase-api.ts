import { queryOptions } from '@tanstack/react-query'
import { api } from '#/shared/api/client'
import { ApiError } from '#/shared/api/api-error'
import { queryKeys } from '#/shared/api/query-keys'
import type { components, paths } from '#/shared/api/schema'
import type { ShowcaseQuery } from './search'

export type Lot = components['schemas']['LotDto']
export type LotPage = components['schemas']['LotPageDto']

type LotsQuery = NonNullable<paths['/lots']['get']['parameters']['query']> & {
  page?: number
  pageSize?: number
}

export async function fetchShowcase(query: ShowcaseQuery): Promise<LotPage> {
  const { data } = await api.GET('/lots', {
    params: {
      query: {
        phase: query.phase,
        q: query.q,
        rarity: query.rarity,
        page: query.page,
        pageSize: query.pageSize,
      } satisfies LotsQuery,
    },
  })
  if (!data) throw new ApiError(500, 'Empty response')
  return data
}

export function showcaseQueryOptions(query: ShowcaseQuery) {
  return queryOptions({
    queryKey: queryKeys.showcase(query),
    queryFn: () => fetchShowcase(query),
  })
}
