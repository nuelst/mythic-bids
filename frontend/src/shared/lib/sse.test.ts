import { renderHook } from '@testing-library/react'
import { useEventStream } from './sse'

class MockEventSource {
  static instances: MockEventSource[] = []
  onopen: (() => void) | null = null
  private listeners = new Map<string, Set<(event: Event) => void>>()

  constructor(readonly url: string) {
    MockEventSource.instances.push(this)
  }

  addEventListener(type: string, listener: (event: Event) => void) {
    const set = this.listeners.get(type) ?? new Set()
    set.add(listener)
    this.listeners.set(type, set)
  }

  removeEventListener(type: string, listener: (event: Event) => void) {
    this.listeners.get(type)?.delete(listener)
  }

  close() {
    this.listeners.clear()
  }

  emit(type: string, data: unknown) {
    const event = new MessageEvent(type, { data: JSON.stringify(data) })
    this.listeners.get(type)?.forEach((listener) => listener(event))
  }
}

describe('useEventStream', () => {
  beforeEach(() => {
    MockEventSource.instances = []
    vi.stubGlobal('EventSource', MockEventSource)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('does nothing without a url', () => {
    renderHook(() => useEventStream(null, {}))
    expect(MockEventSource.instances).toHaveLength(0)
  })

  it('notifies on open and named events, then closes', () => {
    const onOpen = vi.fn()
    const onOutbid = vi.fn()
    const { unmount } = renderHook(() =>
      useEventStream(
        'http://api.test/me/events?token=t',
        { 'bid.outbid': onOutbid },
        { onOpen },
      ),
    )

    const source = MockEventSource.instances[0]
    expect(source.url).toContain('/me/events')
    source.onopen?.()
    source.emit('bid.outbid', { lotId: 'lot-1', bid: { amountCents: 1000 } })

    expect(onOpen).toHaveBeenCalledOnce()
    expect(onOutbid).toHaveBeenCalledWith({
      lotId: 'lot-1',
      bid: { amountCents: 1000 },
    })

    unmount()
    source.emit('bid.outbid', { lotId: 'lot-2' })
    expect(onOutbid).toHaveBeenCalledOnce()
  })
})
