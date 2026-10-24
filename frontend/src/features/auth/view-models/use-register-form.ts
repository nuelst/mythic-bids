import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { m } from '#/paraglide/messages'
import { isApiError } from '#/shared/api/api-error'
import { queryKeys } from '#/shared/api/query-keys'
import { errorMessage } from '#/shared/i18n/error-messages'
import { safeRedirect } from '#/shared/auth/redirect'
import { setSession } from '#/shared/auth/session'
import { register } from '../api/session-api'
import { registerSchema } from '../api/schemas'
import type { RegisterValues } from '../api/schemas'

export function useRegisterForm(redirect?: string) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const form = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    mode: 'onTouched',
    defaultValues: {
      name: '',
      email: '',
      password: '',
      role: 'BIDDER',
    },
  })

  const mutation = useMutation({
    mutationFn: register,
    onSuccess: (session) => {
      setSession(session)
      queryClient.setQueryData(queryKeys.me(), session.user)
      toast.success(m.toast_register())
      const home = session.user.role === 'AUCTIONEER' ? '/seller' : '/'
      void navigate({ to: safeRedirect(redirect) ?? home })
    },
    onError: (error) => {
      const message =
        isApiError(error) && error.code
          ? errorMessage(error.code)
          : error.message
      toast.error(message)
      if (isApiError(error) && error.code === 'EMAIL_TAKEN') {
        form.setError('email', { message })
      }
    },
  })

  return {
    form,
    isSubmitting: mutation.isPending,
    onSubmit: form.handleSubmit((values) => mutation.mutate(values)),
  }
}
