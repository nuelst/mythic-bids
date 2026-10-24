import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { isApiError } from '#/shared/api/api-error'
import { queryKeys } from '#/shared/api/query-keys'
import { errorMessage } from '#/shared/i18n/error-messages'
import { createLot } from '../api/seller-api'
import { createLotSchema } from '../api/schemas'
import type { CreateLotValues } from '../api/schemas'
import { defaultLotEndsAt, toDateTimeLocal } from '../api/schedule'

export function useCreateLotForm(itemId?: string) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const form = useForm<CreateLotValues>({
    resolver: zodResolver(createLotSchema),
    mode: 'onTouched',
    defaultValues: {
      itemId: itemId ?? '',
      startingPriceCents: 1_000,
      minIncrementCents: 100,
      startsAt: '',
      endsAt: toDateTimeLocal(defaultLotEndsAt()),
    },
  })

  useEffect(() => {
    form.setValue('itemId', itemId ?? '', { shouldValidate: Boolean(itemId) })
  }, [itemId, form])

  const mutation = useMutation({
    mutationFn: createLot,
    onSuccess: (lot) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.sellerLots() })
      void queryClient.invalidateQueries({ queryKey: queryKeys.showcase() })
      void navigate({ to: '/lots/$lotId', params: { lotId: lot.id } })
    },
    onError: (error) => {
      if (isApiError(error) && error.code === 'INVALID_SCHEDULE') {
        form.setError('endsAt', { message: errorMessage(error.code) })
        form.setFocus('endsAt')
        return
      }
      toast.error(
        isApiError(error) && error.code
          ? errorMessage(error.code)
          : error.message,
      )
    },
  })

  return {
    form,
    isSubmitting: mutation.isPending,
    onSubmit: form.handleSubmit((values) => mutation.mutate(values)),
  }
}
