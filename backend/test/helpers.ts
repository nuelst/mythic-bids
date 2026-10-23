import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';
import request from 'supertest';
import { AppModule } from '../src/app.module.js';
import { setupApp } from '../src/app.setup.js';
import { CatalogService } from '../src/catalog/catalog.service.js';
import { ScryfallCard } from '../src/catalog/scryfall/scryfall.types.js';
import { Clock } from '../src/common/clock/clock.js';
import { PrismaService } from '../src/prisma/prisma.service.js';

/** Real time unless pinned, so tests can jump to the end of a lot. */
export class FakeClock extends Clock {
  private pinned?: number;

  now() {
    return new Date(this.pinned ?? Date.now());
  }

  set(date: Date) {
    this.pinned = date.getTime();
  }

  reset() {
    this.pinned = undefined;
  }
}

export async function createTestApp() {
  const clock = new FakeClock();
  const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
    .overrideProvider(Clock)
    .useValue(clock)
    .compile();

  const app = moduleRef.createNestApplication();
  setupApp(app);
  // Listening once lets supertest reuse the server instead of opening one per request.
  await app.listen(0);

  return {
    app,
    clock,
    prisma: app.get(PrismaService),
    http: () => request(app.getHttpServer()),
  };
}

export type TestApp = Awaited<ReturnType<typeof createTestApp>>;

export async function signUp({ http }: TestApp, role: 'AUCTIONEER' | 'BIDDER') {
  const { body } = await http()
    .post('/auth/register')
    .send({
      name: 'Test User',
      email: `${randomUUID()}@test.dev`,
      password: 'password123',
      role,
    })
    .expect(201);
  return {
    id: body.user.id as string,
    auth: { Authorization: `Bearer ${body.accessToken}` },
  };
}

export async function deposit(
  { http }: TestApp,
  user: { auth: Record<string, string> },
  amountCents: number,
) {
  await http()
    .post('/wallet/deposits')
    .set(user.auth)
    .set('Idempotency-Key', randomUUID())
    .send({ amountCents })
    .expect(201);
}

/** Stores a fixture card in the catalog (no Scryfall call) and returns its item id. */
export async function catalogItem(app: INestApplication) {
  const card = JSON.parse(
    readFileSync(
      new URL(
        '../src/catalog/scryfall/__fixtures__/academy-drake-pt.json',
        import.meta.url,
      ),
      'utf8',
    ),
  ) as ScryfallCard;
  const [item] = await app.get(CatalogService).saveCards([card]);
  return item.id;
}

export async function createLot(
  t: TestApp,
  seller: { auth: Record<string, string> },
  terms: {
    startingPriceCents: number;
    minIncrementCents: number;
    endsAt: Date;
  },
) {
  const { body } = await t
    .http()
    .post('/lots')
    .set(seller.auth)
    .send({
      itemId: await catalogItem(t.app),
      ...terms,
      endsAt: terms.endsAt.toISOString(),
    })
    .expect(201);
  return body.id as string;
}

export function bid(
  { http }: TestApp,
  bidder: { auth: Record<string, string> },
  lotId: string,
  amountCents: number,
) {
  return http()
    .post(`/lots/${lotId}/bids`)
    .set(bidder.auth)
    .set('Idempotency-Key', randomUUID())
    .send({ amountCents });
}

export const minutesFromNow = (minutes: number) =>
  new Date(Date.now() + minutes * 60_000);
