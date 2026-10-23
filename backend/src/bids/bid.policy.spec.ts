import { ErrorCode } from '../common/errors/error-code.enum.js';
import { rejectBid } from './bid.policy.js';

const at = (iso: string) => new Date(`2026-01-01T${iso}Z`);

describe('rejectBid', () => {
  const lot = {
    status: 'OPEN' as const,
    startsAt: at('10:00:00'),
    endsAt: at('11:00:00'),
    bidCount: 1,
    startingPriceCents: 1000n,
    minIncrementCents: 100n,
    currentPriceCents: 1500n,
    currentLeaderId: 'ana',
  };
  const live = at('10:30:00');

  it('accepts a bid equal to the current price plus the increment', () => {
    expect(rejectBid(lot, 'bruno', 1600n, live)).toBeNull();
  });

  it('accepts a first bid equal to the starting price', () => {
    const fresh = {
      ...lot,
      bidCount: 0,
      currentPriceCents: null,
      currentLeaderId: null,
    };
    expect(rejectBid(fresh, 'bruno', 1000n, live)).toBeNull();
    expect(rejectBid(fresh, 'bruno', 999n, live)?.code).toBe(
      ErrorCode.BELOW_MINIMUM,
    );
  });

  it('rejects bids below the minimum and tells the minimum', () => {
    expect(rejectBid(lot, 'bruno', 1599n, live)).toMatchObject({
      code: ErrorCode.BELOW_MINIMUM,
      minimumCents: 1600n,
    });
  });

  it('rejects the leader covering their own bid', () => {
    expect(rejectBid(lot, 'ana', 5000n, live)?.code).toBe(
      ErrorCode.ALREADY_WINNING,
    );
  });

  it('rejects bids before the start and after the end', () => {
    expect(rejectBid(lot, 'bruno', 1600n, at('09:59:59'))?.code).toBe(
      ErrorCode.LOT_NOT_STARTED,
    );
    expect(rejectBid(lot, 'bruno', 1600n, at('11:00:00'))?.code).toBe(
      ErrorCode.LOT_CLOSED,
    );
  });

  it('rejects bids on cancelled or settled lots', () => {
    expect(
      rejectBid({ ...lot, status: 'CANCELLED' }, 'bruno', 1600n, live)?.code,
    ).toBe(ErrorCode.LOT_CLOSED);
    expect(
      rejectBid({ ...lot, status: 'SETTLED' }, 'bruno', 1600n, live)?.code,
    ).toBe(ErrorCode.LOT_CLOSED);
  });
});
