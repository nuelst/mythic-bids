import { HttpStatus, Injectable } from '@nestjs/common';
import { AuditService } from '../audit/audit.service.js';
import { Clock } from '../common/clock/clock.js';
import { AppException } from '../common/errors/app.exception.js';
import { ErrorCode } from '../common/errors/error-code.enum.js';
import { Locale } from '../common/locale/locale.js';
import { PaginationQueryDto, toPage } from '../common/pagination/pagination.js';
import { DomainEvent, EventsService } from '../events/events.service.js';
import { endsAtAfterBid, minimumBidCents } from '../lots/lot.rules.js';
import { lotInclude, toLotView } from '../lots/lot.view.js';
import { LotsService } from '../lots/lots.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import {
  availableCents,
  Movement,
  WalletService,
} from '../wallet/wallet.service.js';
import { BidRejection, rejectBid } from './bid.policy.js';
import type { BidOutcome } from './dto/bid-result.dto.js';

const rejected = ({ code, message, minimumCents }: BidRejection) =>
  new AppException(
    code,
    HttpStatus.UNPROCESSABLE_ENTITY,
    message,
    minimumCents === undefined ? {} : { minimumCents },
  );

@Injectable()
export class BidsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly lots: LotsService,
    private readonly wallet: WalletService,
    private readonly audit: AuditService,
    private readonly events: EventsService,
    private readonly clock: Clock,
  ) {}

  /**
   * One transaction per bid: the lot row lock serializes bids on the same lot, then the
   * wallets are locked in a fixed order, so concurrent bids cannot double-spend or deadlock.
   */
  place(lotId: string, bidderId: string, amountCents: bigint) {
    return this.prisma.$transaction(async (tx) => {
      const lot = await this.lots.lockForUpdate(tx, lotId);
      const now = this.clock.now();

      const rejection = rejectBid(lot, bidderId, amountCents, now);
      if (rejection) throw rejected(rejection);

      const previousLeaderId = lot.currentLeaderId;
      const wallets = await this.wallet.lock(
        tx,
        previousLeaderId ? [bidderId, previousLeaderId] : [bidderId],
      );
      if (availableCents(wallets.get(bidderId)!) < amountCents) {
        throw rejected({
          code: ErrorCode.INSUFFICIENT_FUNDS,
          message: 'Not enough available balance for this bid',
        });
      }

      // The previous leader's money goes back to their available balance right away.
      const movements: Movement[] = [
        { userId: bidderId, type: 'HOLD', amountCents, lotId },
      ];
      if (previousLeaderId && lot.currentPriceCents) {
        movements.push({
          userId: previousLeaderId,
          type: 'RELEASE',
          amountCents: lot.currentPriceCents,
          lotId,
        });
      }
      await this.wallet.apply(tx, movements);

      const fields = {
        lotId,
        seq: lot.bidCount + 1,
        bidderAlias: this.audit.alias(bidderId, lotId),
        amountCents,
        createdAt: now,
        prevHash: lot.headHash,
      };
      const signed = this.audit.signBid(fields);
      await tx.bid.create({ data: { ...fields, ...signed, bidderId } });

      const updated = await tx.lot.update({
        where: { id: lotId },
        data: {
          currentPriceCents: amountCents,
          currentLeaderId: bidderId,
          bidCount: fields.seq,
          headHash: signed.hash,
          endsAt: endsAtAfterBid(lot.endsAt, now),
        },
      });

      const bid = {
        seq: fields.seq,
        bidderAlias: fields.bidderAlias,
        amountCents,
        createdAt: now,
        hash: signed.hash,
      };
      const state = {
        currentPriceCents: amountCents,
        nextMinimumCents: minimumBidCents(updated),
        bidCount: updated.bidCount,
        endsAt: updated.endsAt,
        extended: updated.endsAt > lot.endsAt,
      };

      const events: DomainEvent[] = [
        { type: 'bid.placed', lotId, payload: { bid, ...state } },
        { type: 'wallet.changed', userId: bidderId },
      ];
      if (previousLeaderId) {
        events.push(
          {
            type: 'bid.outbid',
            lotId,
            userId: previousLeaderId,
            payload: { bid },
          },
          { type: 'wallet.changed', userId: previousLeaderId },
        );
      }
      await this.events.emit(tx, events);

      return { bid, ...state };
    });
  }

  /** Lots the bidder took part in, with their highest bid and outcome. */
  async findMine(bidderId: string, query: PaginationQueryDto, locale: Locale) {
    const where = { bids: { some: { bidderId } } };
    const [lots, total] = await this.prisma.$transaction([
      this.prisma.lot.findMany({
        where,
        include: { ...lotInclude, receipt: { select: { publicToken: true } } },
        orderBy: { endsAt: 'desc' },
        skip: query.skip,
        take: query.pageSize,
      }),
      this.prisma.lot.count({ where }),
    ]);
    const highest = await this.prisma.bid.groupBy({
      by: ['lotId'],
      where: { bidderId, lotId: { in: lots.map((lot) => lot.id) } },
      _max: { amountCents: true },
    });
    const highestOf = new Map(
      highest.map((h) => [h.lotId, h._max.amountCents]),
    );
    const now = this.clock.now();

    const items = lots.map((lot) => ({
      lot: toLotView(lot, locale, now),
      myHighestCents: highestOf.get(lot.id) ?? null,
      outcome: this.outcome(lot, bidderId),
      receiptToken:
        lot.winnerId === bidderId ? (lot.receipt?.publicToken ?? null) : null,
    }));
    return toPage([items, total], query);
  }

  private outcome(
    lot: {
      status: string;
      winnerId: string | null;
      currentLeaderId: string | null;
    },
    bidderId: string,
  ): BidOutcome {
    if (lot.status === 'CANCELLED') return 'CANCELLED';
    if (lot.status === 'SETTLED')
      return lot.winnerId === bidderId ? 'WON' : 'LOST';
    return lot.currentLeaderId === bidderId ? 'WINNING' : 'OUTBID';
  }
}
