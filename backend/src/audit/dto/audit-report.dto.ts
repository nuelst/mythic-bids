import { ApiProperty } from '@nestjs/swagger';
import { AUDIT_ISSUE_CODES } from '../hash-chain.js';
import type { AuditIssueCode } from '../hash-chain.js';

export class AuditIssueDto {
  @ApiProperty({ enum: AUDIT_ISSUE_CODES })
  code: AuditIssueCode;

  /** Bid where the issue was found. */
  seq?: number;
}

export class AuditTermsDto {
  sellerId: string;
  itemId: string;

  @ApiProperty({ type: 'integer' })
  startingPriceCents: bigint;

  @ApiProperty({ type: 'integer' })
  minIncrementCents: bigint;

  startsAt: Date;
  originalEndsAt: Date;
  genesisHash: string;
  genesisSignature: string;
}

export class AuditBidDto {
  seq: number;
  bidderAlias: string;

  @ApiProperty({ type: 'integer' })
  amountCents: bigint;

  createdAt: Date;
  prevHash: string;
  hash: string;

  /** Ed25519 signature (base64) of `hash`. */
  signature: string;
}

export class AuditSealDto {
  lotId: string;
  bidCount: number;
  finalHash: string;

  @ApiProperty({ type: 'integer' })
  amountCents: bigint;

  winnerAlias: string;
  issuedAt: Date;
  signature: string;
}

export class AuditReportDto {
  lotId: string;

  /** False when any hash, signature, link or rule check failed. */
  intact: boolean;

  issues: AuditIssueDto[];
  checkedAt: Date;
  terms: AuditTermsDto;
  bids: AuditBidDto[];

  /** Present once the lot was sold. */
  seal: AuditSealDto | null;
}
