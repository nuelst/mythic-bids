import { act, renderHook } from '@testing-library/react'
import { useDebouncedValue } from './debounce'

describe('useDebouncedValue', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('keeps the first value immediately and updates after the delay', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebouncedValue(value, 350),
      { initialProps: { value: '' } },
    )

    expect(result.current).toBe('')

    rerender({ value: 'ser' })
    expect(result.current).toBe('')

    act(() => {
      vi.advanceTimersByTime(349)
    })
    expect(result.current).toBe('')

    act(() => {
      vi.advanceTimersByTime(1)
    })
    expect(result.current).toBe('ser')
  })

  it('restarts the timer when the value changes', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebouncedValue(value, 350),
      { initialProps: { value: 'a' } },
    )

    rerender({ value: 'an' })
    act(() => {
      vi.advanceTimersByTime(200)
    })
    rerender({ value: 'angel' })
    act(() => {
      vi.advanceTimersByTime(349)
    })
    expect(result.current).toBe('a')

    act(() => {
      vi.advanceTimersByTime(1)
    })
    expect(result.current).toBe('angel')
  })
})
