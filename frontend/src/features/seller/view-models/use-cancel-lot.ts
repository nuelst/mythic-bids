import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { m } from '#/paraglide/messages'
import { isApiError } from '#/shared/api/api-error'
import { queryKeys } from '#/shared/api/query-keys'
import { errorMessage } from '#/shared/i18n/error-messages'
import { applyOptimisticCancel, cancelLot } from '../api/seller-api'
import type { SellerLotsPage } from '../api/seller-api'

export function useCancelLot() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: cancelLot,
    onMutate: async (lotId) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.sellerLots() })
      const snapshots = queryClient.getQueriesData<SellerLotsPage>({
        queryKey: queryKeys.sellerLots(),
      })
      queryClient.setQueriesData<SellerLotsPage>(
        { queryKey: queryKeys.sellerLots() },
        (page) =>
          page
            ? {
                ...page,
                items: page.items.map((lot) =>
                  lot.id === lotId ? applyOptimisticCancel(lot) : lot,
                ),
              }
            : page,
      )
      return { snapshots }
    },
    onError: (error, _lotId, context) => {
      for (const [key, data] of context?.snapshots ?? []) {
        queryClient.setQueryData(key, data)
      }
      toast.error(
        isApiError(error) && error.code
          ? errorMessage(error.code)
          : error.message,
      )
    },
    onSuccess: (lot) => {
      toast.success(m.toast_lot_cancelled())
      queryClient.setQueriesData<SellerLotsPage>(
        { queryKey: queryKeys.sellerLots() },
        (page) =>
          page
            ? {
                ...page,
                items: page.items.map((item) =>
                  item.id === lot.id ? lot : item,
                ),
              }
            : page,
      )
      queryClient.setQueryData(queryKeys.lot(lot.id), (current) =>
        current ? { ...current, ...lot } : current,
      )
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.sellerLots() })
      void queryClient.invalidateQueries({ queryKey: queryKeys.showcase() })
    },
  })
}
