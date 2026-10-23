import { generateKeyPairSync } from 'node:crypto';
import { AuditSigner } from './audit-signer.js';
import {
  bidHash,
  ChainInput,
  genesisHash,
  sealHash,
  verifyChain,
} from './hash-chain.js';

const { privateKey } = generateKeyPairSync('ed25519');
const signer = new AuditSigner(
  privateKey.export({ type: 'pkcs8', format: 'der' }).toString('base64'),
  'alias-secret',
);

const start = new Date('2026-01-01T10:00:00.000Z');
const minutes = (n: number) => new Date(start.getTime() + n * 60_000);

function buildChain(amounts: [string, number][]): ChainInput {
  const lot = {
    lotId: 'lot-1',
    sellerId: 'seller-1',
    itemId: 'item-1',
    startingPriceCents: 1000n,
    minIncrementCents: 100n,
    startsAt: start,
    originalEndsAt: minutes(60),
    endsAt: minutes(60),
  };
  const genesis = genesisHash(lot);

  let prevHash = genesis;
  const bids = amounts.map(([alias, amount], index) => {
    const fields = {
      lotId: lot.lotId,
      seq: index + 1,
      bidderAlias: alias,
      amountCents: BigInt(amount),
      createdAt: minutes(index + 1),
      prevHash,
    };
    const hash = bidHash(fields);
    prevHash = hash;
    return { ...fields, hash, signature: signer.sign(hash) };
  });

  const last = bids.at(-1)!;
  const seal = {
    lotId: lot.lotId,
    bidCount: bids.length,
    finalHash: prevHash,
    amountCents: last.amountCents,
    winnerAlias: last.bidderAlias,
    issuedAt: minutes(61),
  };

  return {
    lot: {
      ...lot,
      genesisHash: genesis,
      genesisSignature: signer.sign(genesis),
      headHash: prevHash,
      bidCount: bids.length,
    },
    bids,
    seal: { ...seal, signature: signer.sign(sealHash(seal)) },
  };
}

const codes = (input: ChainInput) =>
  verifyChain(input, signer.isSigned).map((issue) => issue.code);

describe('verifyChain', () => {
  const valid = () =>
    buildChain([
      ['B-AAA', 1000],
      ['B-BBB', 1100],
      ['B-AAA', 1500],
    ]);

  it('accepts an untouched chain', () => {
    expect(codes(valid())).toEqual([]);
  });

  it('detects an edited amount', () => {
    const chain = valid();
    chain.bids[1].amountCents = 1200n;
    expect(codes(chain)).toContain('HASH_MISMATCH');
  });

  it('detects an edited amount even when the attacker recomputes the hashes', () => {
    const chain = valid();
    const bid = chain.bids[1];
    bid.amountCents = 1200n;
    bid.hash = bidHash(bid);
    chain.bids[2].prevHash = bid.hash;
    expect(codes(chain)).toEqual(
      expect.arrayContaining(['INVALID_SIGNATURE', 'HASH_MISMATCH']),
    );
  });

  it('detects a removed bid in the middle', () => {
    const chain = valid();
    chain.bids.splice(1, 1);
    expect(codes(chain)).toEqual(
      expect.arrayContaining(['SEQUENCE_GAP', 'BROKEN_LINK']),
    );
  });

  it('detects the last bid removed after closing through the seal', () => {
    const chain = valid();
    chain.bids.pop();
    chain.lot.headHash = chain.bids.at(-1)!.hash;
    chain.lot.bidCount = 2;
    expect(codes(chain)).toEqual(['SEAL_MISMATCH']);
  });

  it('detects an inserted bid without a valid signature', () => {
    const chain = valid();
    const last = chain.bids.at(-1)!;
    const forged = {
      ...last,
      seq: 4,
      bidderAlias: 'B-BBB',
      amountCents: 1600n,
      prevHash: last.hash,
    };
    forged.hash = bidHash(forged);
    chain.bids.push({ ...forged, signature: last.signature });
    expect(codes(chain)).toContain('INVALID_SIGNATURE');
  });

  it('detects edited lot terms through the genesis', () => {
    const chain = valid();
    chain.lot.startingPriceCents = 1n;
    expect(codes(chain)).toContain('GENESIS_TAMPERED');
  });

  it('flags bids that break the auction rules', () => {
    const chain = buildChain([
      ['B-AAA', 1000],
      ['B-AAA', 1050],
    ]);
    expect(codes(chain)).toEqual(['RULE_VIOLATION']);
  });
});

describe('AuditSigner.alias', () => {
  it('is stable per lot and differs across lots', () => {
    expect(signer.alias('user', 'lot-1')).toBe(signer.alias('user', 'lot-1'));
    expect(signer.alias('user', 'lot-1')).not.toBe(
      signer.alias('user', 'lot-2'),
    );
    expect(signer.alias('user', 'lot-1')).toMatch(/^B-[0-9A-F]{8}$/);
  });
});
