import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Env } from '../config/env.validation.js';
import { AuditSigner } from './audit-signer.js';
import {
  bidHash,
  BidFields,
  genesisHash,
  GenesisFields,
  sealHash,
  SealFields,
} from './hash-chain.js';

@Injectable()
export class AuditService {
  private readonly signer: AuditSigner;

  constructor(config: ConfigService<Env, true>) {
    this.signer = new AuditSigner(
      config.get('AUDIT_PRIVATE_KEY', { infer: true }),
      config.get('ALIAS_SECRET', { infer: true }),
    );
  }

  alias(userId: string, lotId: string) {
    return this.signer.alias(userId, lotId);
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
}
