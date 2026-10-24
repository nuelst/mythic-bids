import { useMutation } from '@tanstack/react-query'
import type {
  UseMutationOptions,
  UseMutationResult,
} from '@tanstack/react-query'
import { useRef } from 'react'

type IdempotentFn<TData, TVariables> = (
  variables: TVariables,
  idempotencyKey: string,
) => Promise<TData>

/**
 * One Idempotency-Key per intent (the mutation variables). Retries after a
 * network failure reuse the same key; a different payload, or a later success,
 * gets a new one.
 */
export function useIdempotentMutation<
  TData,
  TError,
  TVariables,
  TOnMutateResult = unknown,
>(
  options: Omit<
    UseMutationOptions<TData, TError, TVariables, TOnMutateResult>,
    'mutationFn'
  > & {
    mutationFn: IdempotentFn<TData, TVariables>
  },
): UseMutationResult<TData, TError, TVariables, TOnMutateResult> {
  const keys = useRef(new Map<string, string>())
  const { mutationFn, onSuccess, ...rest } = options

  return useMutation({
    ...rest,
    mutationFn: (variables) => {
      const intent = JSON.stringify(variables)
      let key = keys.current.get(intent)
      if (!key) {
        key = crypto.randomUUID()
        keys.current.set(intent, key)
      }
      return mutationFn(variables, key)
    },
    onSuccess: (data, variables, onMutateResult, context) => {
      keys.current.delete(JSON.stringify(variables))
      return onSuccess?.(data, variables, onMutateResult, context)
    },
  })
}
