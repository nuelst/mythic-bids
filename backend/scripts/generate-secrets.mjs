import { generateKeyPairSync, randomBytes } from 'node:crypto';

const { privateKey } = generateKeyPairSync('ed25519');

console.log(`JWT_SECRET=${randomBytes(32).toString('hex')}`);
console.log(`ALIAS_SECRET=${randomBytes(32).toString('hex')}`);
console.log(
  `AUDIT_PRIVATE_KEY=${privateKey.export({ type: 'pkcs8', format: 'der' }).toString('base64')}`,
);
