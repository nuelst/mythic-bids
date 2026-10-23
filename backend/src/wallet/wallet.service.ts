import { Injectable } from '@nestjs/common';
import { LedgerEntryType, Prisma, Wallet } from '../generated/prisma/client.js';
import { PaginationQueryDto, toPage } from '../common/pagination/pagination.js';
import { PrismaService } from '../prisma/prisma.service.js';

export interface Movement {
  userId: string;
  type: LedgerEntryType;
  amountCents: bigint;
  lotId?: string;
}

// How each ledger entry moves the wallet: +1 adds the amount, -1 subtracts it.
const EFFECTS: Record<LedgerEntryType, { balance: number; committed: number }> =
  {
    DEPOSIT: { balance: 1, committed: 0 },
    HOLD: { balance: 0, committed: 1 },
    RELEASE: { balance: 0, committed: -1 },
    REFUND: { balance: 0, committed: -1 },
    CAPTURE: { balance: -1, committed: -1 },
    PAYOUT: { balance: 1, committed: 0 },
  };

export const availableCents = (wallet: Wallet) =>
  wallet.balanceCents - wallet.committedCents;

export const toWalletView = (wallet: Wallet) => ({
  balanceCents: wallet.balanceCents,
  committedCents: wallet.committedCents,
  availableCents: availableCents(wallet),
});

@Injectable()
export class WalletService {
  constructor(private readonly prisma: PrismaService) {}

  /** Locks wallets in user id order so concurrent transactions never deadlock. */
  async lock(tx: Prisma.TransactionClient, userIds: string[]) {
    const ids = [...new Set(userIds)].sort();
    await tx.$queryRaw`
      SELECT 1 FROM wallets WHERE user_id = ANY(${ids}::uuid[])
      ORDER BY user_id FOR UPDATE`;
    const wallets = await tx.wallet.findMany({
      where: { userId: { in: ids } },
    });
    return new Map(wallets.map((wallet) => [wallet.userId, wallet]));
  }

  /** Applies movements to the wallets and records them in the ledger. Callers must hold the wallet locks. */
  async apply(tx: Prisma.TransactionClient, movements: Movement[]) {
    for (const { userId, type, amountCents } of movements) {
      const effect = EFFECTS[type];
      await tx.wallet.update({
        where: { userId },
        data: {
          balanceCents: { increment: amountCents * BigInt(effect.balance) },
          committedCents: {
            increment: amountCents * BigInt(effect.committed),
          },
        },
      });
    }
    await tx.ledgerEntry.createMany({ data: movements });
  }

  deposit(userId: string, amountCents: bigint) {
    return this.prisma.$transaction(async (tx) => {
      await this.lock(tx, [userId]);
      await this.apply(tx, [{ userId, type: 'DEPOSIT', amountCents }]);
      return toWalletView(
        await tx.wallet.findUniqueOrThrow({ where: { userId } }),
      );
    });
  }

  async findByUser(userId: string) {
    return toWalletView(
      await this.prisma.wallet.findUniqueOrThrow({ where: { userId } }),
    );
  }

  async ledger(userId: string, query: PaginationQueryDto) {
    const where = { userId };
    return toPage(
      await this.prisma.$transaction([
        this.prisma.ledgerEntry.findMany({
          where,
          orderBy: { id: 'desc' },
          skip: query.skip,
          take: query.pageSize,
          select: {
            id: true,
            type: true,
            amountCents: true,
            lotId: true,
            createdAt: true,
          },
        }),
        this.prisma.ledgerEntry.count({ where }),
      ]),
      query,
    );
  }
}
