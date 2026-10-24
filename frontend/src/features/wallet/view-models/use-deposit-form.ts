import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { m } from '#/paraglide/messages'
import { isApiError } from '#/shared/api/api-error'
import { queryKeys } from '#/shared/api/query-keys'
import { useIdempotentMutation } from '#/shared/api/use-idempotent-mutation'
import { errorMessage } from '#/shared/i18n/error-messages'
import { deposit } from '../api/wallet-api'
import type { Wallet } from '../api/wallet-api'
import { applyOptimisticDeposit } from '../api/wallet-view'
import { depositSchema } from '../api/schemas'
import type { DepositValues } from '../api/schemas'

export function useDepositForm(options?: { onSuccess?: () => void }) {
  const queryClient = useQueryClient()
  const form = useForm<DepositValues>({
    resolver: zodResolver(depositSchema),
    mode: 'onTouched',
    defaultValues: { amountCents: 10_000 },
  })

  const mutation = useIdempotentMutation<
    Wallet,
    Error,
    DepositValues,
    { previous?: Wallet }
  >({
    mutationFn: (values, key) => deposit(values.amountCents, key),
    onMutate: async (values) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.wallet() })
      const previous = queryClient.getQueryData<Wallet>(queryKeys.wallet())
      if (previous) {
        queryClient.setQueryData(
          queryKeys.wallet(),
          applyOptimisticDeposit(previous, values.amountCents),
        )
      }
      return { previous }
    },
    onError: (error, _values, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.wallet(), context.previous)
      }
      toast.error(
        isApiError(error) && error.code
          ? errorMessage(error.code)
          : error.message,
      )
    },
    onSuccess: (wallet) => {
      queryClient.setQueryData(queryKeys.wallet(), wallet)
      form.reset({ amountCents: 10_000 })
      toast.success(m.toast_deposit())
      options?.onSuccess?.()
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.wallet() })
      void queryClient.invalidateQueries({ queryKey: queryKeys.ledger() })
    },
  })

  return {
    form,
    isSubmitting: mutation.isPending,
    onSubmit: form.handleSubmit((values) => mutation.mutate(values)),
  }
}
