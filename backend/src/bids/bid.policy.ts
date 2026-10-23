import { Lot } from '../generated/prisma/client.js';
import { ErrorCode } from '../common/errors/error-code.enum.js';
import { lotPhase, minimumBidCents } from '../lots/lot.rules.js';

export interface BidRejection {
  code: ErrorCode;
  message: string;
  minimumCents?: bigint;
}

type BiddableLot = Pick<
  Lot,
  | 'status'
  | 'startsAt'
  | 'endsAt'
  | 'bidCount'
  | 'startingPriceCents'
  | 'minIncrementCents'
  | 'currentPriceCents'
  | 'currentLeaderId'
>;

/** Lot-level rules, checked in this order; the balance is checked later, under the wallet lock. */
export function rejectBid(
  lot: BiddableLot,
  bidderId: string,
  amountCents: bigint,
  now: Date,
): BidRejection | null {
  const phase = lotPhase(lot, now);
  if (phase === 'SCHEDULED') {
    return {
      code: ErrorCode.LOT_NOT_STARTED,
      message: 'The lot has not started yet',
    };
  }
  if (phase !== 'LIVE') {
    return { code: ErrorCode.LOT_CLOSED, message: 'The lot is closed' };
  }
  if (lot.currentLeaderId === bidderId) {
    return {
      code: ErrorCode.ALREADY_WINNING,
      message: 'You already have the highest bid',
    };
  }
  const minimumCents = minimumBidCents(lot);
  if (amountCents < minimumCents) {
    return {
      code: ErrorCode.BELOW_MINIMUM,
      message: 'The bid is below the minimum accepted',
      minimumCents,
    };
  }
  return null;
}
