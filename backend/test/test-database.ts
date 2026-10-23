import { existsSync } from 'node:fs';

/** TEST_DATABASE_URL, or DATABASE_URL pointing to an "auction_test" database. */
export function testDatabaseUrl() {
  if (existsSync('.env')) process.loadEnvFile('.env');
  if (process.env.TEST_DATABASE_URL) return process.env.TEST_DATABASE_URL;

  const url = new URL(process.env.DATABASE_URL!);
  url.pathname = '/auction_test';
  return url.toString();
}
