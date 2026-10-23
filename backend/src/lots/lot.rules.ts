import { LotStatus } from '../generated/prisma/enums.js';

export const ANTI_SNIPING_WINDOW_MS = 2 * 60 * 1000;

export type LotPhase =
  'SCHEDULED' | 'LIVE' | 'CLOSING' | 'CLOSED' | 'CANCELLED';

interface LotTiming {
  status: LotStatus;
  startsAt: Date;
  endsAt: Date;
}

interface LotPricing {
  bidCount: number;
  startingPriceCents: bigint;
  minIncrementCents: bigint;
  currentPriceCents: bigint | null;
}

/** CLOSING: the end time has passed but the settlement worker has not run yet; no bids are accepted. */
export function lotPhase(lot: LotTiming, now: Date): LotPhase {
  if (lot.status === 'CANCELLED') return 'CANCELLED';
  if (lot.status === 'SETTLED') return 'CLOSED';
  if (now < lot.startsAt) return 'SCHEDULED';
  if (now < lot.endsAt) return 'LIVE';
  return 'CLOSING';
}

export function minimumBidCents(lot: LotPricing): bigint {
  return lot.bidCount === 0 || lot.currentPriceCents === null
    ? lot.startingPriceCents
    : lot.currentPriceCents + lot.minIncrementCents;
}

/**
 * A bid accepted in the last 2 minutes pushes the end to 2 minutes after the bid,
 * so there is always a full window to respond (it does not stack +2 min per bid).
 */
export function endsAtAfterBid(endsAt: Date, now: Date): Date {
  return endsAt.getTime() - now.getTime() < ANTI_SNIPING_WINDOW_MS
    ? new Date(now.getTime() + ANTI_SNIPING_WINDOW_MS)
    : endsAt;
}
