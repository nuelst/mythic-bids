import { SettlementService } from '../src/settlement/settlement.service.js';
import {
  bid,
  createLot,
  createTestApp,
  deposit,
  minutesFromNow,
  signUp,
  TestApp,
} from './helpers.js';

describe('Auction flow (e2e)', () => {
  let t: TestApp;

  beforeAll(async () => {
    t = await createTestApp();
  });

  afterAll(async () => {
    await t.app.close();
  });

  afterEach(() => t.clock.reset());

  it('runs a lot from first bid to a sealed, auditable receipt', async () => {
    const seller = await signUp(t, 'AUCTIONEER');
    const ana = await signUp(t, 'BIDDER');
    const bruno = await signUp(t, 'BIDDER');
    await deposit(t, ana, 50_000);
    await deposit(t, bruno, 50_000);

    const endsAt = minutesFromNow(10);
    const lotId = await createLot(t, seller, {
      startingPriceCents: 1_000,
      minIncrementCents: 100,
      endsAt,
    });

    await bid(t, ana, lotId, 1_000).expect(201);
    await bid(t, ana, lotId, 1_200).expect(422, /ALREADY_WINNING/);
    await bid(t, bruno, lotId, 1_050).expect(422, /BELOW_MINIMUM/);
    await bid(t, bruno, lotId, 1_100).expect(201);

    // Outbid money goes back to the available balance immediately.
    const anaWallet = await t.http().get('/wallet').set(ana.auth).expect(200);
    expect(anaWallet.body).toMatchObject({
      committedCents: 0,
      availableCents: 50_000,
    });
    const room = await t.http().get(`/lots/${lotId}`).set(ana.auth).expect(200);
    expect(room.body.viewer).toMatchObject({ isLeading: false, position: 2 });

    // Anti-sniping: a bid one minute before the end pushes it to two minutes after the bid.
    const lastMinute = new Date(endsAt.getTime() - 60_000);
    t.clock.set(lastMinute);
    const late = await bid(t, ana, lotId, 1_500).expect(201);
    expect(new Date(late.body.endsAt).getTime()).toBe(
      lastMinute.getTime() + 120_000,
    );

    t.clock.set(new Date(lastMinute.getTime() + 121_000));
    await bid(t, bruno, lotId, 2_000).expect(422, /LOT_CLOSED/);
    // Settles every due lot, like the worker does (the test database keeps lots from other runs).
    const settlement = t.app.get(SettlementService);
    while (await settlement.settleNext());

    const mine = await t.http().get('/me/bids').set(ana.auth).expect(200);
    const [won] = mine.body.items;
    expect(won).toMatchObject({ outcome: 'WON', myHighestCents: 1_500 });

    const receipt = await t
      .http()
      .get(`/receipts/${won.receiptToken}`)
      .expect(200);
    expect(receipt.body).toMatchObject({
      amountCents: 1_500,
      bidCount: 3,
      sealValid: true,
    });
    expect(JSON.stringify(receipt.body)).not.toContain(ana.id);

    const audit = await t.http().get(`/audit/lots/${lotId}`).expect(200);
    expect(audit.body).toMatchObject({ intact: true, issues: [] });

    const sellerLots = await t
      .http()
      .get('/seller/lots')
      .set(seller.auth)
      .expect(200);
    expect(sellerLots.body.totalReceivedCents).toBe(1_500);
    const finalWallet = await t.http().get('/wallet').set(ana.auth).expect(200);
    expect(finalWallet.body).toMatchObject({
      balanceCents: 48_500,
      committedCents: 0,
    });
  });

  it('detects a bid edited directly in the database', async () => {
    const seller = await signUp(t, 'AUCTIONEER');
    const ana = await signUp(t, 'BIDDER');
    await deposit(t, ana, 10_000);
    const lotId = await createLot(t, seller, {
      startingPriceCents: 1_000,
      minIncrementCents: 100,
      endsAt: minutesFromNow(30),
    });
    await bid(t, ana, lotId, 1_000).expect(201);

    await t.prisma.$transaction([
      t.prisma.$executeRaw`ALTER TABLE bids DISABLE TRIGGER bids_append_only`,
      t.prisma
        .$executeRaw`UPDATE bids SET amount_cents = 999999 WHERE lot_id = ${lotId}::uuid`,
      t.prisma.$executeRaw`ALTER TABLE bids ENABLE TRIGGER bids_append_only`,
    ]);

    const audit = await t.http().get(`/audit/lots/${lotId}`).expect(200);
    expect(audit.body.intact).toBe(false);
    expect(audit.body.issues).toContainEqual({ code: 'HASH_MISMATCH', seq: 1 });
  });

  it('refunds the leader when the seller cancels a lot', async () => {
    const seller = await signUp(t, 'AUCTIONEER');
    const ana = await signUp(t, 'BIDDER');
    await deposit(t, ana, 10_000);
    const lotId = await createLot(t, seller, {
      startingPriceCents: 3_000,
      minIncrementCents: 100,
      endsAt: minutesFromNow(30),
    });
    await bid(t, ana, lotId, 3_000).expect(201);

    await t.http().delete(`/lots/${lotId}`).set(seller.auth).expect(200);

    const wallet = await t.http().get('/wallet').set(ana.auth).expect(200);
    expect(wallet.body).toMatchObject({
      committedCents: 0,
      availableCents: 10_000,
    });
    const showcase = await t.http().get('/lots').expect(200);
    expect(
      showcase.body.items.map((lot: { id: string }) => lot.id),
    ).not.toContain(lotId);
  });
});
