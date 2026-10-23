import { Injectable, Logger } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import { randomBytes } from 'node:crypto';
import { Lot, Prisma } from '../generated/prisma/client.js';
import { AuditService } from '../audit/audit.service.js';
import { Clock } from '../common/clock/clock.js';
import { DomainEvent, EventsService } from '../events/events.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { WalletService } from '../wallet/wallet.service.js';

const MAX_PER_TICK = 20;

@Injectable()
export class SettlementService {
  private readonly logger = new Logger(SettlementService.name);
  private running = false;

  constructor(
    private readonly prisma: PrismaService,
    private readonly wallet: WalletService,
    private readonly audit: AuditService,
    private readonly events: EventsService,
    private readonly clock: Clock,
  ) {}

  @Interval(1_000)
  async settleDueLots() {
    if (this.running) return;
    this.running = true;
    try {
      for (let i = 0; i < MAX_PER_TICK && (await this.settleNext()); i++);
    } finally {
      this.running = false;
    }
  }

  /**
   * Settles one expired lot. SKIP LOCKED leaves lots that are taking a bid right now (or being
   * settled by another instance) for the next tick, which re-reads the possibly extended end.
   */
  async settleNext(): Promise<boolean> {
    return this.prisma.$transaction(async (tx) => {
      const now = this.clock.now();
      const [due] = await tx.$queryRaw<{ id: string }[]>`
        SELECT id FROM lots
        WHERE status = 'OPEN' AND ends_at <= ${now}
        ORDER BY ends_at
        LIMIT 1
        FOR UPDATE SKIP LOCKED`;
      if (!due) return false;

      const lot = await tx.lot.findUniqueOrThrow({ where: { id: due.id } });
      await this.settle(tx, lot, now);
      this.logger.log(`Lot ${lot.id} settled`);
      return true;
    });
  }

  private async settle(tx: Prisma.TransactionClient, lot: Lot, now: Date) {
    const winnerId = lot.currentLeaderId;
    const price = lot.currentPriceCents;

    if (!winnerId || !price) {
      await tx.lot.update({
        where: { id: lot.id },
        data: { status: 'SETTLED', settledAt: now },
      });
      await this.events.emit(tx, [
        { type: 'lot.closed', lotId: lot.id, payload: { sold: false } },
      ]);
      return;
    }

    await this.wallet.lock(tx, [winnerId, lot.sellerId]);
    await this.wallet.apply(tx, [
      { userId: winnerId, type: 'CAPTURE', amountCents: price, lotId: lot.id },
      {
        userId: lot.sellerId,
        type: 'PAYOUT',
        amountCents: price,
        lotId: lot.id,
      },
    ]);

    const seal = {
      lotId: lot.id,
      bidCount: lot.bidCount,
      finalHash: lot.headHash,
      amountCents: price,
      winnerAlias: this.audit.alias(winnerId, lot.id),
      issuedAt: now,
    };
    const receipt = await tx.receipt.create({
      data: {
        ...seal,
        winnerId,
        sealSignature: this.audit.seal(seal),
        publicToken: randomBytes(16).toString('base64url'),
      },
    });
    await tx.lot.update({
      where: { id: lot.id },
      data: {
        status: 'SETTLED',
        settledAt: now,
        winnerId,
        finalPriceCents: price,
      },
    });

    const events: DomainEvent[] = [
      {
        type: 'lot.closed',
        lotId: lot.id,
        payload: {
          sold: true,
          winnerAlias: seal.winnerAlias,
          finalPriceCents: price,
        },
      },
      {
        type: 'lot.won',
        lotId: lot.id,
        userId: winnerId,
        payload: { receiptToken: receipt.publicToken, amountCents: price },
      },
      { type: 'wallet.changed', userId: winnerId },
      { type: 'wallet.changed', userId: lot.sellerId },
    ];
    await this.events.emit(tx, events);
  }
}
