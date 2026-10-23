import { PrismaPg } from '@prisma/adapter-pg';
import { execSync } from 'node:child_process';
import { PrismaClient } from '../src/generated/prisma/client.js';
import { testDatabaseUrl } from './test-database.js';

export default async function createTestDatabase() {
  const url = testDatabaseUrl();
  const name = new URL(url).pathname.slice(1);
  const admin = new URL(url);
  admin.pathname = '/postgres';

  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: admin.toString() }),
  });
  const existing = await prisma.$queryRaw<unknown[]>`
    SELECT 1 FROM pg_database WHERE datname = ${name}`;
  if (!existing.length)
    await prisma.$executeRawUnsafe(`CREATE DATABASE "${name}"`);
  await prisma.$disconnect();

  execSync('npx prisma migrate deploy', {
    env: { ...process.env, DATABASE_URL: url },
    stdio: 'ignore',
  });
}
