import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Receipt } from '../generated/prisma/client.js';
import { Clock } from '../common/clock/clock.js';
import { Env } from '../config/env.validation.js';
import { lotNotFound } from '../lots/lot.errors.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { AuditSigner } from './audit-signer.js';
import {
  bidHash,
  BidFields,
  genesisHash,
  GenesisFields,
  sealHash,
  SealFields,
  verifyChain,
} from './hash-chain.js';

const toSeal = (receipt: Receipt): SealFields => ({
  lotId: receipt.lotId,
  bidCount: receipt.bidCount,
  finalHash: receipt.finalHash,
  amountCents: receipt.amountCents,
  winnerAlias: receipt.winnerAlias,
  issuedAt: receipt.issuedAt,
});

@Injectable()
export class AuditService {
  private readonly signer: AuditSigner;

  constructor(
    config: ConfigService<Env, true>,
    private readonly prisma: PrismaService,
    private readonly clock: Clock,
  ) {
    this.signer = new AuditSigner(
      config.get('AUDIT_PRIVATE_KEY', { infer: true }),
      config.get('ALIAS_SECRET', { infer: true }),
    );
  }

  alias(userId: string, lotId: string) {
    return this.signer.alias(userId, lotId);
  }

  publicKeyPem() {
    return this.signer.publicKeyPem();
  }

  genesis(fields: GenesisFields) {
    const hash = genesisHash(fields);
    return { genesisHash: hash, genesisSignature: this.signer.sign(hash) };
  }

  signBid(fields: BidFields) {
    const hash = bidHash(fields);
    return { hash, signature: this.signer.sign(hash) };
  }

  seal(fields: SealFields) {
    return this.signer.sign(sealHash(fields));
  }

  isSealValid(receipt: Receipt) {
    return this.signer.isSigned(
      sealHash(toSeal(receipt)),
      receipt.sealSignature,
    );
  }

  /** Public audit: recomputes the lot's chain from the database and reports any tampering. */
  async verifyLot(lotId: string) {
    const lot = await this.prisma.lot.findUnique({
      where: { id: lotId },
      include: { bids: { orderBy: { seq: 'asc' } }, receipt: true },
    });
    if (!lot) throw lotNotFound();

    const issues = verifyChain(
      {
        lot: { ...lot, lotId: lot.id },
        bids: lot.bids,
        seal: lot.receipt
          ? { ...toSeal(lot.receipt), signature: lot.receipt.sealSignature }
          : undefined,
      },
      this.signer.isSigned,
    );

    return {
      lotId: lot.id,
      intact: issues.length === 0,
      issues,
      checkedAt: this.clock.now(),
      terms: {
        sellerId: lot.sellerId,
        itemId: lot.itemId,
        startingPriceCents: lot.startingPriceCents,
        minIncrementCents: lot.minIncrementCents,
        startsAt: lot.startsAt,
        originalEndsAt: lot.originalEndsAt,
        genesisHash: lot.genesisHash,
        genesisSignature: lot.genesisSignature,
      },
      bids: lot.bids.map((bid) => ({
        seq: bid.seq,
        bidderAlias: bid.bidderAlias,
        amountCents: bid.amountCents,
        createdAt: bid.createdAt,
        prevHash: bid.prevHash,
        hash: bid.hash,
        signature: bid.signature,
      })),
      seal: lot.receipt && {
        ...toSeal(lot.receipt),
        signature: lot.receipt.sealSignature,
      },
    };
  }
}
