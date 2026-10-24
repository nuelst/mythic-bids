import type { Lot } from './showcase-api'

/** Current asking price, or the hammer price once the lot has ended. */
export function displayPriceCents(lot: Lot): number {
  if (
    lot.phase === 'CLOSED' ||
    lot.phase === 'CLOSING' ||
    lot.phase === 'CANCELLED'
  ) {
    return (
      lot.finalPriceCents ?? lot.currentPriceCents ?? lot.startingPriceCents
    )
  }
  return lot.currentPriceCents ?? lot.startingPriceCents
}

export function isLiveLot(lot: Lot) {
  return lot.phase === 'LIVE' || lot.phase === 'CLOSING'
}
