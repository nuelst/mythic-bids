import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { useEffect, useRef, useState } from 'react'
import { useDebouncedValue } from '#/shared/lib/debounce'
import { showcaseQueryOptions } from '../api/showcase-api'
import {
  compactShowcaseSearch,
  normalizeShowcaseQuery,
  toShowcaseQuery,
} from '../api/search'
import type {
  ShowcasePhase,
  ShowcaseRarity,
  ShowcaseSearch,
} from '../api/search'

export function useShowcase(search: ShowcaseSearch) {
  const navigate = useNavigate({ from: '/' })
  const searchRef = useRef(search)
  searchRef.current = search

  const query = toShowcaseQuery(search)
  const result = useQuery({
    ...showcaseQueryOptions(query),
    placeholderData: keepPreviousData,
  })

  const [draft, setDraft] = useState(search.q ?? '')
  const debounced = useDebouncedValue(draft)

  useEffect(() => {
    setDraft(search.q ?? '')
  }, [search.q])

  function patch(next: ShowcaseSearch) {
    void navigate({
      search: compactShowcaseSearch({ ...searchRef.current, ...next }),
      replace: true,
    })
  }

  useEffect(() => {
    const next = normalizeShowcaseQuery(debounced)
    if (next === searchRef.current.q) return
    patch({ q: next, page: undefined })
  }, [debounced])

  return {
    phase: query.phase,
    rarity: search.rarity,
    page: query.page,
    draft,
    setDraft,
    pageSize: query.pageSize,
    data: result.data,
    isPending: result.isPending,
    isFetching: result.isFetching,
    isError: result.isError,
    refetch: result.refetch,
    setPhase: (phase: ShowcasePhase) => patch({ phase, page: undefined }),
    setRarity: (rarity?: ShowcaseRarity) => patch({ rarity, page: undefined }),
    setPage: (page: number) => patch({ page }),
    clearFilters: () =>
      patch({ q: undefined, rarity: undefined, page: undefined }),
  }
}
