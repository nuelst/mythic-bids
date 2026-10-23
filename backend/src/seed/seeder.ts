import { Injectable, Logger } from '@nestjs/common';
import { readFileSync } from 'node:fs';
import { AuthService } from '../auth/auth.service.js';
import { BidsService } from '../bids/bids.service.js';
import { CatalogService } from '../catalog/catalog.service.js';
import { ScryfallCard } from '../catalog/scryfall/scryfall.types.js';
import { Clock } from '../common/clock/clock.js';
import { LotsService } from '../lots/lots.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { WalletService } from '../wallet/wallet.service.js';

const PASSWORD = 'demo1234';
const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const CLOSES_SOON = 90_000;

interface FixtureEntry {
  card: ScryfallCard;
  translation?: ScryfallCard;
}

interface LotPlan {
  card: number;
  /** Offsets from now, in ms. */
  start: number;
  end: number;
  price: number;
  increment: number;
  bids?: ['ana' | 'bruno', number][];
}

const LOTS: LotPlan[] = [
  // Live, with bids, open for a month so it is still live whenever the app is reviewed.
  {
    card: 0,
    start: -HOUR,
    end: 30 * DAY,
    price: 15_000,
    increment: 1_000,
    bids: [
      ['ana', 15_000],
      ['bruno', 16_000],
      ['ana', 18_000],
      ['bruno', 20_000],
    ],
  },
  // Live and ending in a few minutes: shows the countdown, anti-sniping and settlement.
  {
    card: 2,
    start: -10 * MINUTE,
    end: 5 * MINUTE,
    price: 2_000,
    increment: 200,
    bids: [['bruno', 2_000]],
  },
  {
    card: 1,
    start: -2 * HOUR,
    end: 3 * DAY,
    price: 3_000,
    increment: 300,
    bids: [['ana', 3_000]],
  },
  { card: 3, start: -HOUR, end: 5 * DAY, price: 4_500, increment: 500 },
  {
    card: 5,
    start: -HOUR,
    end: 7 * DAY,
    price: 9_000,
    increment: 1_000,
    bids: [
      ['bruno', 9_000],
      ['ana', 10_000],
    ],
  },
  { card: 7, start: -HOUR, end: 10 * DAY, price: 6_000, increment: 500 },
  { card: 13, start: -HOUR, end: 14 * DAY, price: 40_000, increment: 2_500 },
  {
    card: 14,
    start: -HOUR,
    end: 20 * DAY,
    price: 55_000,
    increment: 5_000,
    bids: [['ana', 55_000]],
  },
  // Scheduled.
  { card: 4, start: DAY, end: 4 * DAY, price: 1_500, increment: 100 },
  { card: 11, start: 2 * DAY, end: 6 * DAY, price: 12_000, increment: 1_000 },
  // Closed soon after seeding: one sold (with receipt), one without bids. They end in the near
  // future instead of the past so the running API's settlement worker cannot close them before
  // their bids exist; it settles them (and issues the receipt) once they end.
  {
    card: 10,
    start: -3 * DAY,
    end: CLOSES_SOON,
    price: 25_000,
    increment: 2_000,
    bids: [
      ['ana', 25_000],
      ['bruno', 27_000],
      ['ana', 30_000],
    ],
  },
  {
    card: 6,
    start: -2 * DAY,
    end: CLOSES_SOON,
    price: 8_000,
    increment: 500,
  },
];

@Injectable()
export class Seeder {
  private readonly logger = new Logger(Seeder.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly auth: AuthService,
    private readonly wallet: WalletService,
    private readonly catalog: CatalogService,
    private readonly lots: LotsService,
    private readonly bids: BidsService,
    private readonly clock: Clock,
  ) {}

  async run() {
    await this.reset();
    const itemIds = await this.seedCatalog();
    const users = await this.seedUsers();
    const now = Date.now();

    for (const plan of LOTS) {
      await this.seedLot(plan, now, itemIds, users);
    }
    await this.cancelledLot(itemIds[15], users.seller);

    this.logger.log(
      `Seeded ${LOTS.length + 1} lots; two of them close in ${CLOSES_SOON / 1000}s and are settled by the API. Login with leiloeiro@demo.com, ana@demo.com or bruno@demo.com / ${PASSWORD}`,
    );
  }

  private async reset() {
    await this.prisma.$executeRaw`
      TRUNCATE users, wallets, ledger_entries, catalog_items, catalog_item_translations,
        catalog_images, catalog_jobs, lots, bids, receipts, outbox_events, idempotency_keys
      RESTART IDENTITY CASCADE`;
  }

  private async seedCatalog() {
    const fixture = JSON.parse(
      readFileSync(new URL('./fixtures/cards.json', import.meta.url), 'utf8'),
    ) as FixtureEntry[];

    const items = await this.catalog.saveCards(
      fixture.map((entry) => entry.card),
    );
    for (const [index, entry] of fixture.entries()) {
      if (entry.translation) {
        await this.catalog.addSiblingTranslation(
          items[index].id,
          entry.translation,
        );
      }
    }
    return items.map((item) => item.id);
  }

  private async seedUsers() {
    const register = (
      name: string,
      email: string,
      role: 'AUCTIONEER' | 'BIDDER',
    ) =>
      this.auth
        .register({ name, email, password: PASSWORD, role })
        .then((s) => s.user.id);

    const seller = await register(
      'Leiloeiro Demo',
      'leiloeiro@demo.com',
      'AUCTIONEER',
    );
    const ana = await register('Ana Souza', 'ana@demo.com', 'BIDDER');
    const bruno = await register('Bruno Lima', 'bruno@demo.com', 'BIDDER');

    for (const bidder of [ana, bruno]) {
      await this.wallet.deposit(bidder, 1_000_000n); // R$ 10.000,00
    }
    return { seller, ana, bruno };
  }

  private async seedLot(
    plan: LotPlan,
    now: number,
    itemIds: string[],
    users: { seller: string; ana: string; bruno: string },
  ) {
    const startsAt = now + plan.start;
    const lot = await this.at(startsAt, () =>
      this.lots.create(
        users.seller,
        {
          itemId: itemIds[plan.card],
          startingPriceCents: plan.price,
          minIncrementCents: plan.increment,
          endsAt: new Date(now + plan.end).toISOString(),
        },
        'en',
      ),
    );

    // Bids are spread over the first minutes of the lot, through the real bidding flow.
    for (const [index, [bidder, amount]] of (plan.bids ?? []).entries()) {
      await this.at(startsAt + (index + 1) * MINUTE, () =>
        this.bids.place(lot.id, users[bidder], BigInt(amount)),
      );
    }
  }

  private async cancelledLot(itemId: string, sellerId: string) {
    const lot = await this.lots.create(
      sellerId,
      {
        itemId,
        startingPriceCents: 1_000,
        minIncrementCents: 100,
        endsAt: new Date(Date.now() + DAY).toISOString(),
      },
      'en',
    );
    await this.lots.cancel(sellerId, lot.id, 'en');
  }

  /** Runs with the shared Clock pinned to a moment, so lots and bids get realistic timestamps. */
  private async at<T>(time: number, action: () => Promise<T>): Promise<T> {
    this.clock.now = () => new Date(time);
    try {
      return await action();
    } finally {
      this.clock.now = () => new Date();
    }
  }
}
