import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { groupBidsByOutcome, myBidsQueryOptions } from '../api/bids-api'

export function useMyBids(page = 1) {
  const navigate = useNavigate({ from: '/me/bids' })
  const result = useQuery({
    ...myBidsQueryOptions(page),
    placeholderData: keepPreviousData,
  })

  function setPage(next: number) {
    void navigate({
      search: next > 1 ? { page: next } : {},
      replace: true,
    })
  }

  return {
    page,
    data: result.data,
    groups: result.data ? groupBidsByOutcome(result.data.items) : undefined,
    isPending: result.isPending,
    isError: result.isError && !result.data,
    refetch: result.refetch,
    setPage,
  }
}
