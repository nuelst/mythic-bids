import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { isApiError } from '#/shared/api/api-error'
import { queryKeys } from '#/shared/api/query-keys'
import { errorMessage } from '#/shared/i18n/error-messages'
import { safeRedirect } from '#/shared/auth/redirect'
import { setSession } from '#/shared/auth/session'
import { login } from '../api/session-api'
import { loginSchema } from '../api/schemas'
import type { LoginValues } from '../api/schemas'

export function useLoginForm(redirect?: string) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    mode: 'onTouched',
    defaultValues: { email: '', password: '' },
  })

  const mutation = useMutation({
    mutationFn: login,
    onSuccess: (session) => {
      setSession(session)
      queryClient.setQueryData(queryKeys.me(), session.user)
      void navigate({ to: safeRedirect(redirect) ?? '/' })
    },
    onError: (error) => {
      if (isApiError(error) && error.code === 'INVALID_CREDENTIALS') {
        form.setError('password', { message: errorMessage(error.code) })
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
