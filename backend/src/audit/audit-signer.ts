import {
  createHmac,
  createPrivateKey,
  createPublicKey,
  KeyObject,
  sign,
  verify,
} from 'node:crypto';

/** Ed25519 signatures with a key that lives only in the environment, never in the database. */
export class AuditSigner {
  private readonly privateKey: KeyObject;
  readonly publicKey: KeyObject;

  constructor(
    privateKeyBase64: string,
    private readonly aliasSecret: string,
  ) {
    this.privateKey = createPrivateKey({
      key: Buffer.from(privateKeyBase64, 'base64'),
      format: 'der',
      type: 'pkcs8',
    });
    this.publicKey = createPublicKey(this.privateKey);
  }

  sign(hash: string) {
    return sign(null, Buffer.from(hash), this.privateKey).toString('base64');
  }

  isSigned = (hash: string, signature: string) =>
    verify(
      null,
      Buffer.from(hash),
      this.publicKey,
      Buffer.from(signature, 'base64'),
    );

  /** Stable pseudonym per bidder and lot, not linkable across lots and without personal data. */
  alias(userId: string, lotId: string) {
    const digest = createHmac('sha256', this.aliasSecret)
      .update(`${lotId}:${userId}`)
      .digest('hex');
    return `B-${digest.slice(0, 8).toUpperCase()}`;
  }

  publicKeyPem() {
    return this.publicKey.export({ type: 'spki', format: 'pem' }).toString();
  }
}
