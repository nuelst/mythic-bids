import { useEffect, useRef } from 'react'

const EVENT_TYPES = [
  'bid.placed',
  'bid.outbid',
  'lot.closed',
  'lot.cancelled',
  'lot.won',
  'wallet.changed',
] as const

export type StreamEventType = (typeof EVENT_TYPES)[number]

export type StreamHandlers = Partial<
  Record<StreamEventType, (data: unknown) => void>
>

function parseData(data: string) {
  try {
    return JSON.parse(data) as unknown
  } catch {
    return data
  }
}

/**
 * EventSource that reconnects by itself. `onOpen` runs on every (re)connect so
 * the caller can refetch: the stream only sends events that happen after it.
 */
export function useEventStream(
  url: string | null,
  handlers: StreamHandlers,
  options?: { onOpen?: () => void },
) {
  const handlersRef = useRef(handlers)
  handlersRef.current = handlers
  const onOpenRef = useRef(options?.onOpen)
  onOpenRef.current = options?.onOpen

  useEffect(() => {
    if (!url) return
    const source = new EventSource(url)
    source.onopen = () => onOpenRef.current?.()

    const listeners = EVENT_TYPES.map((type) => {
      const listener = (event: Event) => {
        handlersRef.current[type]?.(parseData((event as MessageEvent).data))
      }
      source.addEventListener(type, listener)
      return { type, listener }
    })

    return () => {
      for (const { type, listener } of listeners) {
        source.removeEventListener(type, listener)
      }
      source.close()
    }
  }, [url])
}
