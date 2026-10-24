import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { sellerLotsQueryOptions } from '../api/seller-api'
import { matchesSellerPhase } from '../api/search'
import type { SellerPhase, SellerSearch } from '../api/search'

export function useSellerLots(search: SellerSearch) {
  const navigate = useNavigate({ from: '/seller/' })
  const page = search.page ?? 1
  const result = useQuery({
    ...sellerLotsQueryOptions(page),
    placeholderData: keepPreviousData,
  })

  const items = result.data
    ? result.data.items.filter((lot) =>
        matchesSellerPhase(lot.phase, search.phase),
      )
    : undefined

  function setPage(next: number) {
    void navigate({
      search: {
        ...(search.phase ? { phase: search.phase } : {}),
        ...(next > 1 ? { page: next } : {}),
      },
      replace: true,
    })
  }

  function setPhase(phase?: SellerPhase) {
    void navigate({
      search: phase ? { phase } : {},
      replace: true,
    })
  }

  return {
    page,
    phase: search.phase,
    data: result.data,
    items,
    isPending: result.isPending,
    isError: result.isError && !result.data,
    refetch: result.refetch,
    setPage,
    setPhase,
  }
}
