import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { useDebouncedValue } from '#/shared/lib/debounce'
import { catalogQueryOptions } from '../api/seller-api'

export const CATALOG_PAGE_SIZE = 8

export function sliceCatalogPage<T>(items: T[], page: number) {
  const total = items.length
  const pages = Math.max(1, Math.ceil(total / CATALOG_PAGE_SIZE))
  const current = Math.min(Math.max(1, page), pages)
  return {
    page: current,
    total,
    items: items.slice(
      (current - 1) * CATALOG_PAGE_SIZE,
      current * CATALOG_PAGE_SIZE,
    ),
  }
}

export function useCatalogSearch() {
  const [draft, setDraft] = useState('')
  const [page, setPage] = useState(1)
  const q = useDebouncedValue(draft.trim(), 350)
  const enabled = q.length >= 2
  const result = useQuery({
    ...catalogQueryOptions(q),
    enabled,
    placeholderData: keepPreviousData,
  })
  const paged = sliceCatalogPage(result.data?.items ?? [], page)

  useEffect(() => {
    setPage(1)
  }, [q])

  return {
    draft,
    setDraft,
    q,
    enabled,
    data: result.data,
    items: paged.items,
    page: paged.page,
    pageSize: CATALOG_PAGE_SIZE,
    total: paged.total,
    setPage,
    isFetching: result.isFetching,
    isError: result.isError && !result.data,
    isOffline: result.data?.source === 'cache',
  }
}
