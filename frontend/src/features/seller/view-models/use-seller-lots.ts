import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { sellerLotsQueryOptions } from '../api/seller-api'

export function useSellerLots(page = 1) {
  const navigate = useNavigate({ from: '/seller' })
  const result = useQuery({
    ...sellerLotsQueryOptions(page),
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
    isPending: result.isPending,
    isError: result.isError && !result.data,
    refetch: result.refetch,
    setPage,
  }
}
