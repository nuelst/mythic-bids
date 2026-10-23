import { endsAtAfterBid, lotPhase, minimumBidCents } from './lot.rules.js';

const at = (iso: string) => new Date(`2026-01-01T${iso}Z`);

describe('lotPhase', () => {
  const lot = {
    status: 'OPEN' as const,
    startsAt: at('10:00:00'),
    endsAt: at('11:00:00'),
  };

  it.each([
    ['09:59:59', 'SCHEDULED'],
    ['10:00:00', 'LIVE'],
    ['10:59:59', 'LIVE'],
    ['11:00:00', 'CLOSING'],
  ])('at %s is %s', (time, phase) => {
    expect(lotPhase(lot, at(time))).toBe(phase);
  });

  it('uses the persisted status for settled and cancelled lots', () => {
    expect(lotPhase({ ...lot, status: 'SETTLED' }, at('10:30:00'))).toBe(
      'CLOSED',
    );
    expect(lotPhase({ ...lot, status: 'CANCELLED' }, at('10:30:00'))).toBe(
      'CANCELLED',
    );
  });
});

describe('minimumBidCents', () => {
  const pricing = {
    bidCount: 0,
    startingPriceCents: 1000n,
    minIncrementCents: 100n,
    currentPriceCents: null,
  };

  it('is the starting price before the first bid', () => {
    expect(minimumBidCents(pricing)).toBe(1000n);
  });

  it('is the current price plus the increment afterwards', () => {
    expect(
      minimumBidCents({ ...pricing, bidCount: 3, currentPriceCents: 1500n }),
    ).toBe(1600n);
  });
});

describe('endsAtAfterBid', () => {
  const endsAt = at('11:00:00');

  it('keeps the end time for bids before the last 2 minutes', () => {
    expect(endsAtAfterBid(endsAt, at('10:58:00'))).toBe(endsAt);
  });

  it('extends to 2 minutes after a bid in the last 2 minutes', () => {
    expect(endsAtAfterBid(endsAt, at('10:58:01'))).toEqual(at('11:00:01'));
    expect(endsAtAfterBid(endsAt, at('10:59:59'))).toEqual(at('11:01:59'));
  });
});
