import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'
import { useIdempotentMutation } from './use-idempotent-mutation'

function createWrapper() {
  const client = new QueryClient({
    defaultOptions: { mutations: { retry: false } },
  })
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>
  }
}

describe('useIdempotentMutation', () => {
  it('reuses the key when the same payload is retried', async () => {
    const keys: string[] = []
    const { result } = renderHook(
      () =>
        useIdempotentMutation({
          mutationFn: async (amount: number, key) => {
            keys.push(key)
            if (keys.length === 1) throw new Error('network')
            return amount
          },
        }),
      { wrapper: createWrapper() },
    )

    await result.current.mutateAsync(100).catch(() => undefined)
    await result.current.mutateAsync(100)

    expect(keys).toHaveLength(2)
    expect(keys[0]).toBe(keys[1])
  })

  it('issues a new key after success or when the payload changes', async () => {
    const keys: string[] = []
    const { result } = renderHook(
      () =>
        useIdempotentMutation({
          mutationFn: async (amount: number, key) => {
            keys.push(key)
            return amount
          },
        }),
      { wrapper: createWrapper() },
    )

    await result.current.mutateAsync(100)
    await result.current.mutateAsync(100)
    await result.current.mutateAsync(200)

    expect(new Set(keys).size).toBe(3)
  })
})
