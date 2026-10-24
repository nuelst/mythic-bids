import { useEffect, useState } from 'react'

let offsetMs = 0

/** Sync the local clock from a server timestamp (the lot room sends `serverTime`). */
export function setServerTime(serverTime: Date | string | number) {
  offsetMs = new Date(serverTime).getTime() - Date.now()
}

export function serverNow() {
  return new Date(Date.now() + offsetMs)
}

export function serverOffsetMs() {
  return offsetMs
}

export function resetServerClock() {
  offsetMs = 0
}

export function useNow(intervalMs = 1000) {
  const [now, setNow] = useState(serverNow)

  useEffect(() => {
    const id = setInterval(() => setNow(serverNow()), intervalMs)
    return () => clearInterval(id)
  }, [intervalMs])

  return now
}
