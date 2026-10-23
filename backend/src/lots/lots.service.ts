import { HttpStatus, Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { Prisma } from '../generated/prisma/client.js';
import type { AuthUser } from '../auth/auth-user.js';
import { AuditService } from '../audit/audit.service.js';
import { CatalogService } from '../catalog/catalog.service.js';
import { Clock } from '../common/clock/clock.js';
import { AppException } from '../common/errors/app.exception.js';
import { ErrorCode } from '../common/errors/error-code.enum.js';
import { Locale } from '../common/locale/locale.js';
import { PaginationQueryDto, toPage } from '../common/pagination/pagination.js';
import { DomainEvent, EventsService } from '../events/events.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { WalletService } from '../wallet/wallet.service.js';
import { CreateLotDto } from './dto/create-lot.dto.js';
import { ShowcasePhase, ShowcaseQueryDto } from './dto/showcase-query.dto.js';
import { lotNotFound } from './lot.errors.js';
import { lotPhase, standing } from './lot.rules.js';
import { lotInclude, toLotView } from './lot.view.js';

const MIN_DURATION_MS = 60_000;
const MAX_SCHEDULE_MS = 90 * 24 * 60 * 60_000;

@Injectable()
export class LotsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly catalog: CatalogService,
    private readonly audit: AuditService,
    private readonly wallet: WalletService,
    private readonly events: EventsService,
    private readonly clock: Clock,
  ) {}

  /** Row lock that serializes everything that changes a lot (bids, settlement, cancellation). */
  async lockForUpdate(tx: Prisma.TransactionClient, lotId: string) {
    await tx.$queryRaw`SELECT 1 FROM lots WHERE id = ${lotId}::uuid FOR UPDATE`;
    const lot = await tx.lot.findUnique({ where: { id: lotId } });
    if (!lot) throw lotNotFound();
    return lot;
  }

  async create(sellerId: string, dto: CreateLotDto, locale: Locale) {
    const now = this.clock.now();
    const requestedStart = dto.startsAt ? new Date(dto.startsAt) : now;
    const startsAt = requestedStart > now ? requestedStart : now;
    const endsAt = new Date(dto.endsAt);
    if (endsAt.getTime() - startsAt.getTime() < MIN_DURATION_MS) {
      throw new AppException(
        ErrorCode.INVALID_SCHEDULE,
        HttpStatus.UNPROCESSABLE_ENTITY,
        'The lot must end at least one minute after it starts',
      );
    }
    if (endsAt.getTime() - now.getTime() > MAX_SCHEDULE_MS) {
      throw new AppException(
        ErrorCode.INVALID_SCHEDULE,
        HttpStatus.UNPROCESSABLE_ENTITY,
        'The lot must end within 90 days',
      );
    }

    await this.catalog.prepareForLot(dto.itemId);

    const terms = {
      lotId: randomUUID(),
      sellerId,
      itemId: dto.itemId,
      startingPriceCents: BigInt(dto.startingPriceCents),
      minIncrementCents: BigInt(dto.minIncrementCents),
      startsAt,
      originalEndsAt: endsAt,
    };
    const genesis = this.audit.genesis(terms);

    const lot = await this.prisma.lot.create({
      data: {
        id: terms.lotId,
        sellerId,
        itemId: terms.itemId,
        startingPriceCents: terms.startingPriceCents,
        minIncrementCents: terms.minIncrementCents,
        startsAt,
        endsAt,
        originalEndsAt: endsAt,
        ...genesis,
        headHash: genesis.genesisHash,
      },
      include: lotInclude,
    });
    return toLotView(lot, locale, now);
  }

  /** Sellers may cancel open lots; a leading bid is refunded to the bidder. */
  async cancel(sellerId: string, lotId: string, locale: Locale) {
    await this.prisma.$transaction(async (tx) => {
      const lot = await this.lockForUpdate(tx, lotId);
      if (lot.sellerId !== sellerId) throw lotNotFound();

      const phase = lotPhase(lot, this.clock.now());
      if (phase !== 'SCHEDULED' && phase !== 'LIVE') {
        throw new AppException(
          ErrorCode.LOT_NOT_CANCELLABLE,
          HttpStatus.CONFLICT,
          'Only scheduled or live lots can be cancelled',
        );
      }

      const events: DomainEvent[] = [{ type: 'lot.cancelled', lotId }];
      if (lot.currentLeaderId && lot.currentPriceCents) {
        events.push({ type: 'wallet.changed', userId: lot.currentLeaderId });
        await this.wallet.lock(tx, [lot.currentLeaderId]);
        await this.wallet.apply(tx, [
          {
            userId: lot.currentLeaderId,
            type: 'REFUND',
            amountCents: lot.currentPriceCents,
            lotId,
          },
        ]);
      }
      await tx.lot.update({
        where: { id: lotId },
        data: { status: 'CANCELLED', cancelledAt: this.clock.now() },
      });
      await this.events.emit(tx, events);
    });
    return this.findOne(lotId, locale);
  }

  async findOne(lotId: string, locale: Locale) {
    const lot = await this.prisma.lot.findUnique({
      where: { id: lotId },
      include: lotInclude,
    });
    if (!lot) throw lotNotFound();
    return toLotView(lot, locale, this.clock.now());
  }

  /** Live room: lot state, public bid history and, for a bidder, where they stand. */
  async room(lotId: string, locale: Locale, viewer?: AuthUser) {
    const lot = await this.prisma.lot.findUnique({
      where: { id: lotId },
      include: {
        ...lotInclude,
        bids: {
          orderBy: { seq: 'desc' },
          select: {
            seq: true,
            bidderAlias: true,
            amountCents: true,
            createdAt: true,
          },
        },
      },
    });
    if (!lot) throw lotNotFound();

    const now = this.clock.now();
    const me =
      viewer?.role === 'BIDDER' ? this.audit.alias(viewer.id, lotId) : null;

    return {
      ...toLotView(lot, locale, now),
      serverTime: now,
      leaderAlias: lot.bids[0]?.bidderAlias ?? null,
      bids: lot.bids,
      viewer: me
        ? {
            alias: me,
            isLeading: lot.currentLeaderId === viewer!.id,
            ...standing(lot.bids, me),
          }
        : null,
    };
  }

  async showcase(query: ShowcaseQueryDto, locale: Locale) {
    const now = this.clock.now();
    const where: Prisma.LotWhereInput = {
      ...this.phaseFilter(query.phase, now),
      item: {
        rarity: query.rarity,
        translations: query.q
          ? { some: { name: { contains: query.q, mode: 'insensitive' } } }
          : undefined,
      },
    };
    return this.page(where, this.phaseOrder(query.phase), query, locale, now);
  }

  async listForSeller(
    sellerId: string,
    query: PaginationQueryDto,
    locale: Locale,
  ) {
    const now = this.clock.now();
    const [page, received] = await Promise.all([
      this.page({ sellerId }, { createdAt: 'desc' }, query, locale, now),
      this.prisma.ledgerEntry.aggregate({
        where: { userId: sellerId, type: 'PAYOUT' },
        _sum: { amountCents: true },
      }),
    ]);
    return { ...page, totalReceivedCents: received._sum.amountCents ?? 0n };
  }

  private async page(
    where: Prisma.LotWhereInput,
    orderBy: Prisma.LotOrderByWithRelationInput,
    query: PaginationQueryDto,
    locale: Locale,
    now: Date,
  ) {
    const [lots, total] = await this.prisma.$transaction([
      this.prisma.lot.findMany({
        where,
        orderBy,
        include: lotInclude,
        skip: query.skip,
        take: query.pageSize,
      }),
      this.prisma.lot.count({ where }),
    ]);
    return toPage(
      [lots.map((lot) => toLotView(lot, locale, now)), total],
      query,
    );
  }

  // Mirrors lotPhase() in SQL; cancelled lots never show up in the showcase.
  private phaseFilter(
    phase: ShowcasePhase | undefined,
    now: Date,
  ): Prisma.LotWhereInput {
    switch (phase) {
      case 'LIVE':
        return { status: 'OPEN', startsAt: { lte: now }, endsAt: { gt: now } };
      case 'SCHEDULED':
        return { status: 'OPEN', startsAt: { gt: now } };
      case 'CLOSED':
        return {
          OR: [{ status: 'SETTLED' }, { status: 'OPEN', endsAt: { lte: now } }],
        };
      default:
        return { status: { not: 'CANCELLED' } };
    }
  }

  private phaseOrder(
    phase?: ShowcasePhase,
  ): Prisma.LotOrderByWithRelationInput {
    if (phase === 'LIVE') return { endsAt: 'asc' };
    if (phase === 'SCHEDULED') return { startsAt: 'asc' };
    if (phase === 'CLOSED') return { endsAt: 'desc' };
    return { createdAt: 'desc' };
  }
}
