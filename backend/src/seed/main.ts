import { NestFactory } from '@nestjs/core';
import '../common/money/bigint-json.js';
import { SeedModule } from './seed.module.js';
import { Seeder } from './seeder.js';

const app = await NestFactory.createApplicationContext(SeedModule, {
  logger: ['log', 'warn', 'error'],
});
try {
  await app.get(Seeder).run();
} finally {
  await app.close();
}
