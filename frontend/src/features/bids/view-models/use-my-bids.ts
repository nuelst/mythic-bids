import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { myBidsQueryOptions } from '../api/bids-api'
import type { BidFilter, BidsSearch } from '../api/search'

export function useMyBids(search: BidsSearch) {
  const navigate = useNavigate({ from: '/me/bids' })
  const page = search.page ?? 1
  const result = useQuery({
    ...myBidsQueryOptions(page),
    placeholderData: keepPreviousData,
  })

  const items = result.data
    ? search.outcome
      ? result.data.items.filter((item) => item.outcome === search.outcome)
      : result.data.items
    : undefined

  function setPage(next: number) {
    void navigate({
      search: {
        ...(search.outcome ? { outcome: search.outcome } : {}),
        ...(next > 1 ? { page: next } : {}),
      },
      replace: true,
    })
  }

  function setOutcome(outcome?: BidFilter) {
    void navigate({
      search: outcome ? { outcome } : {},
      replace: true,
    })
  }

  return {
    page,
    outcome: search.outcome,
    data: result.data,
    items,
    isPending: result.isPending,
    isError: result.isError && !result.data,
    refetch: result.refetch,
    setPage,
    setOutcome,
  }
}
