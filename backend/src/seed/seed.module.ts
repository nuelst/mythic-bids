import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from '../auth/auth.module.js';
import { BidsModule } from '../bids/bids.module.js';
import { CatalogModule } from '../catalog/catalog.module.js';
import { CommonModule } from '../common/common.module.js';
import { validateEnv } from '../config/env.validation.js';
import { EventsModule } from '../events/events.module.js';
import { LotsModule } from '../lots/lots.module.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { SettlementModule } from '../settlement/settlement.module.js';
import { WalletModule } from '../wallet/wallet.module.js';
import { Seeder } from './seeder.js';

// No ScheduleModule: background workers must not run while the seed moves the clock.
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate: validateEnv }),
    PrismaModule,
    CommonModule,
    EventsModule,
    AuthModule,
    WalletModule,
    CatalogModule,
    LotsModule,
    BidsModule,
    SettlementModule,
  ],
  providers: [Seeder],
})
export class SeedModule {}
