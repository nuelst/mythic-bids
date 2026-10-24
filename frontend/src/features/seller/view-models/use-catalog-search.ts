import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { useDebouncedValue } from '#/shared/lib/debounce'
import { catalogQueryOptions } from '../api/seller-api'

export function useCatalogSearch() {
  const [draft, setDraft] = useState('')
  const q = useDebouncedValue(draft.trim(), 350)
  const enabled = q.length >= 2
  const result = useQuery({
    ...catalogQueryOptions(q),
    enabled,
    placeholderData: keepPreviousData,
  })

  return {
    draft,
    setDraft,
    q,
    enabled,
    data: result.data,
    isFetching: result.isFetching,
    isError: result.isError && !result.data,
    isOffline: result.data?.source === 'cache',
  }
}
