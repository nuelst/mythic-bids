export function receiptPath(token: string) {
  return `/receipts/${encodeURIComponent(token)}`
}

export function receiptUrl(token: string, origin: string) {
  return `${origin}${receiptPath(token)}`
}

export function canWebShare(data: ShareData) {
  return (
    typeof navigator !== 'undefined' &&
    typeof navigator.share === 'function' &&
    (typeof navigator.canShare !== 'function' || navigator.canShare(data))
  )
}
