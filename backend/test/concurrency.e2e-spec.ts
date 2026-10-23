import {
  bid,
  createLot,
  createTestApp,
  deposit,
  minutesFromNow,
  signUp,
  TestApp,
} from './helpers.js';

describe('Concurrent bidding (e2e)', () => {
  let t: TestApp;

  beforeAll(async () => {
    t = await createTestApp();
  });

  afterAll(async () => {
    await t.app.close();
  });

  it('keeps the chain and the wallets consistent under parallel bids', async () => {
    const seller = await signUp(t, 'AUCTIONEER');
    const bidders = await Promise.all(
      [1, 2, 3, 4].map(() => signUp(t, 'BIDDER')),
    );
    for (const bidder of bidders) await deposit(t, bidder, 1_000_000);

    const lotId = await createLot(t, seller, {
      startingPriceCents: 100,
      minIncrementCents: 10,
      endsAt: minutesFromNow(30),
    });

    const responses = await Promise.all(
      Array.from({ length: 40 }, (_, i) =>
        bid(t, bidders[i % 4], lotId, 100 + i * 10),
      ),
    );
    const accepted = responses.filter((response) => response.status === 201);
    expect(accepted.length).toBeGreaterThan(0);
    for (const response of responses.filter((r) => r.status !== 201)) {
      expect(response.status).toBe(422);
    }

    const lot = await t.prisma.lot.findUniqueOrThrow({
      where: { id: lotId },
      include: { bids: { orderBy: { seq: 'asc' } } },
    });
    expect(lot.bidCount).toBe(accepted.length);
    expect(lot.bids.map((b) => b.seq)).toEqual(accepted.map((_, i) => i + 1));

    // Only the leader has money committed, exactly the current price.
    const wallets = await t.prisma.wallet.findMany({
      where: { userId: { in: bidders.map((b) => b.id) } },
    });
    for (const wallet of wallets) {
      const expected =
        wallet.userId === lot.currentLeaderId ? lot.currentPriceCents : 0n;
      expect(wallet.committedCents).toBe(expected);
    }

    const audit = await t.http().get(`/audit/lots/${lotId}`).expect(200);
    expect(audit.body.intact).toBe(true);
  });

  it('keeps every wallet equal to the sum of its ledger', async () => {
    const mismatches = await t.prisma.$queryRaw<unknown[]>`
      SELECT w.user_id
      FROM wallets w
      LEFT JOIN ledger_entries e ON e.user_id = w.user_id
      GROUP BY w.user_id, w.balance_cents, w.committed_cents
      HAVING w.balance_cents <> COALESCE(SUM(CASE
               WHEN e.type IN ('DEPOSIT', 'PAYOUT') THEN e.amount_cents
               WHEN e.type = 'CAPTURE' THEN -e.amount_cents ELSE 0 END), 0)
          OR w.committed_cents <> COALESCE(SUM(CASE
               WHEN e.type = 'HOLD' THEN e.amount_cents
               WHEN e.type IN ('RELEASE', 'REFUND', 'CAPTURE') THEN -e.amount_cents ELSE 0 END), 0)`;
    expect(mismatches).toEqual([]);
  });
});
