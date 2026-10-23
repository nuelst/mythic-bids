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

/** The bidder's best bid and rank among distinct bidders (1 = leading), from the public history. */
export function standing(
  bids: { bidderAlias: string; amountCents: bigint }[],
  alias: string,
) {
  const best = new Map<string, bigint>();
  for (const bid of bids) {
    if ((best.get(bid.bidderAlias) ?? 0n) < bid.amountCents) {
      best.set(bid.bidderAlias, bid.amountCents);
    }
  }
  const myHighestCents = best.get(alias) ?? null;
  const position =
    myHighestCents === null
      ? null
      : [...best.values()].filter((amount) => amount > myHighestCents).length +
        1;
  return { myHighestCents, position, bidders: best.size };
}
