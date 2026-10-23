import { createHash } from 'node:crypto';

// Every hash covers a JSON array so field order is fixed and values cannot shift between fields.
const sha256 = (values: unknown[]) =>
  createHash('sha256').update(JSON.stringify(values)).digest('hex');

export interface GenesisFields {
  lotId: string;
  sellerId: string;
  itemId: string;
  startingPriceCents: bigint;
  minIncrementCents: bigint;
  startsAt: Date;
  originalEndsAt: Date;
}

export interface BidFields {
  lotId: string;
  seq: number;
  bidderAlias: string;
  amountCents: bigint;
  createdAt: Date;
  prevHash: string;
}

export interface SealFields {
  lotId: string;
  bidCount: number;
  finalHash: string;
  amountCents: bigint;
  winnerAlias: string;
  issuedAt: Date;
}

export const genesisHash = (g: GenesisFields) =>
  sha256([
    'genesis',
    g.lotId,
    g.sellerId,
    g.itemId,
    g.startingPriceCents.toString(),
    g.minIncrementCents.toString(),
    g.startsAt.toISOString(),
    g.originalEndsAt.toISOString(),
  ]);

export const bidHash = (b: BidFields) =>
  sha256([
    'bid',
    b.lotId,
    b.seq,
    b.bidderAlias,
    b.amountCents.toString(),
    b.createdAt.toISOString(),
    b.prevHash,
  ]);

export const sealHash = (s: SealFields) =>
  sha256([
    'seal',
    s.lotId,
    s.bidCount,
    s.finalHash,
    s.amountCents.toString(),
    s.winnerAlias,
    s.issuedAt.toISOString(),
  ]);

export const AUDIT_ISSUE_CODES = [
  'GENESIS_TAMPERED',
  'SEQUENCE_GAP',
  'BROKEN_LINK',
  'HASH_MISMATCH',
  'INVALID_SIGNATURE',
  'RULE_VIOLATION',
  'HEAD_MISMATCH',
  'SEAL_MISMATCH',
] as const;
export type AuditIssueCode = (typeof AUDIT_ISSUE_CODES)[number];

export interface AuditIssue {
  code: AuditIssueCode;
  seq?: number;
}

export interface ChainInput {
  lot: GenesisFields & {
    endsAt: Date;
    genesisHash: string;
    genesisSignature: string;
    headHash: string;
    bidCount: number;
  };
  bids: (BidFields & { hash: string; signature: string })[];
  seal?: SealFields & { signature: string };
}

/** Recomputes the whole chain; any edit, removal or insertion shows up as an issue. */
export function verifyChain(
  { lot, bids, seal }: ChainInput,
  isSigned: (hash: string, signature: string) => boolean,
): AuditIssue[] {
  const issues: AuditIssue[] = [];

  const genesis = genesisHash(lot);
  if (genesis !== lot.genesisHash || !isSigned(genesis, lot.genesisSignature)) {
    issues.push({ code: 'GENESIS_TAMPERED' });
  }

  let prevHash = genesis;
  let previous: (typeof bids)[number] | undefined;
  bids.forEach((bid, index) => {
    const at = { seq: bid.seq };
    if (bid.seq !== index + 1) issues.push({ code: 'SEQUENCE_GAP', ...at });
    if (bid.prevHash !== prevHash) issues.push({ code: 'BROKEN_LINK', ...at });
    if (bidHash(bid) !== bid.hash)
      issues.push({ code: 'HASH_MISMATCH', ...at });
    if (!isSigned(bid.hash, bid.signature)) {
      issues.push({ code: 'INVALID_SIGNATURE', ...at });
    }

    const minimum = previous
      ? previous.amountCents + lot.minIncrementCents
      : lot.startingPriceCents;
    const outsideWindow =
      bid.createdAt < lot.startsAt || bid.createdAt > lot.endsAt;
    if (
      bid.amountCents < minimum ||
      bid.bidderAlias === previous?.bidderAlias ||
      outsideWindow
    ) {
      issues.push({ code: 'RULE_VIOLATION', ...at });
    }

    prevHash = bid.hash;
    previous = bid;
  });

  if (lot.headHash !== prevHash || lot.bidCount !== bids.length) {
    issues.push({ code: 'HEAD_MISMATCH' });
  }

  if (seal) {
    const matchesChain =
      seal.finalHash === prevHash &&
      seal.bidCount === bids.length &&
      seal.amountCents === previous?.amountCents &&
      seal.winnerAlias === previous?.bidderAlias;
    if (!matchesChain || !isSigned(sealHash(seal), seal.signature)) {
      issues.push({ code: 'SEAL_MISMATCH' });
    }
  }

  return issues;
}
