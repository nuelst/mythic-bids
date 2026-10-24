import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { isApiError } from '#/shared/api/api-error'
import { queryKeys } from '#/shared/api/query-keys'
import { useIdempotentMutation } from '#/shared/api/use-idempotent-mutation'
import { errorMessage } from '#/shared/i18n/error-messages'
import { placeBid } from '../api/room-api'
import type { LotRoom } from '../api/room-api'
import { applyOptimisticBid, applyPlaceResult } from '../api/room-events'
import { bidSchema } from '../api/schemas'
import type { BidValues } from '../api/schemas'

const FIELD_ERRORS = new Set(['BELOW_MINIMUM', 'ALREADY_WINNING'])

export function useBidForm(room: LotRoom) {
  const queryClient = useQueryClient()
  const alias = room.viewer?.alias
  const form = useForm<BidValues>({
    resolver: zodResolver(bidSchema),
    mode: 'onTouched',
    defaultValues: { amountCents: room.nextMinimumCents },
  })

  useEffect(() => {
    if (!form.formState.isDirty) {
      form.reset({ amountCents: room.nextMinimumCents })
    }
  }, [room.nextMinimumCents, form])

  const mutation = useIdempotentMutation<
    Awaited<ReturnType<typeof placeBid>>,
    Error,
    BidValues,
    { previous?: LotRoom }
  >({
    mutationFn: (values, key) => placeBid(room.id, values.amountCents, key),
    onMutate: async (values) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.lot(room.id) })
      const previous = queryClient.getQueryData<LotRoom>(queryKeys.lot(room.id))
      if (previous && alias) {
        queryClient.setQueryData(
          queryKeys.lot(room.id),
          applyOptimisticBid(previous, values.amountCents, alias),
        )
      }
      return { previous }
    },
    onError: (error, _values, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.lot(room.id), context.previous)
      }
      if (isApiError(error) && error.code && FIELD_ERRORS.has(error.code)) {
        form.setError('amountCents', {
          message: errorMessage(error.code, {
            minimumCents: error.minimumCents,
          }),
        })
        form.setFocus('amountCents')
        return
      }
      toast.error(
        isApiError(error) && error.code
          ? errorMessage(error.code, { minimumCents: error.minimumCents })
          : error.message,
      )
    },
    onSuccess: (result) => {
      queryClient.setQueryData<LotRoom>(queryKeys.lot(room.id), (current) =>
        current ? applyPlaceResult(current, result) : current,
      )
      form.reset({ amountCents: result.nextMinimumCents })
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.wallet() })
    },
  })

  function setAmount(cents: number) {
    form.setValue('amountCents', cents, {
      shouldDirty: true,
      shouldValidate: true,
    })
  }

  return {
    form,
    isSubmitting: mutation.isPending,
    onSubmit: form.handleSubmit((values) => mutation.mutate(values)),
    setAmount,
    minimumCents: room.nextMinimumCents,
    plusOneCents: room.nextMinimumCents + room.minIncrementCents,
    plusFiveCents: room.nextMinimumCents + room.minIncrementCents * 5,
  }
}
