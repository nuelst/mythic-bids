import { createTestApp, signUp, TestApp } from './helpers.js';

describe('Idempotency-Key (e2e)', () => {
  let t: TestApp;

  beforeAll(async () => {
    t = await createTestApp();
  });

  afterAll(async () => {
    await t.app.close();
  });

  const depositWithKey = (
    auth: Record<string, string>,
    key: string,
    amountCents: number,
  ) =>
    t
      .http()
      .post('/wallet/deposits')
      .set(auth)
      .set('Idempotency-Key', key)
      .send({ amountCents });

  it('applies a retried request once and replays the response', async () => {
    const user = await signUp(t, 'BIDDER');

    const first = await depositWithKey(user.auth, 'key-1', 5_000).expect(201);
    const retry = await depositWithKey(user.auth, 'key-1', 5_000).expect(201);
    expect(retry.body).toEqual(first.body);

    await depositWithKey(user.auth, 'key-1', 9_000).expect(
      422,
      /IDEMPOTENCY_KEY_REUSED/,
    );
    await t
      .http()
      .post('/wallet/deposits')
      .set(user.auth)
      .send({ amountCents: 1 })
      .expect(400);

    const entries = await t.prisma.ledgerEntry.count({
      where: { userId: user.id },
    });
    expect(entries).toBe(1);
  });

  it('applies concurrent requests with the same key once', async () => {
    const user = await signUp(t, 'BIDDER');

    const responses = await Promise.all(
      Array.from({ length: 5 }, () =>
        depositWithKey(user.auth, 'same-key', 1_000),
      ),
    );
    expect(
      responses.filter((r) => r.status === 201).length,
    ).toBeGreaterThanOrEqual(1);
    for (const response of responses.filter((r) => r.status !== 201)) {
      expect(response.status).toBe(409);
    }

    const wallet = await t.http().get('/wallet').set(user.auth).expect(200);
    expect(wallet.body.balanceCents).toBe(1_000);
  });
});
