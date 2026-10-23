import { Module } from '@nestjs/common';
import './common/money/bigint-json.js';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { AuthModule } from './auth/auth.module.js';
import { BidsModule } from './bids/bids.module.js';
import { CatalogModule } from './catalog/catalog.module.js';
import { CommonModule } from './common/common.module.js';
import { validateEnv } from './config/env.validation.js';
import { EventsModule } from './events/events.module.js';
import { HealthModule } from './health/health.module.js';
import { LotsModule } from './lots/lots.module.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { SettlementModule } from './settlement/settlement.module.js';
import { UsersModule } from './users/users.module.js';
import { WalletModule } from './wallet/wallet.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate: validateEnv }),
    ScheduleModule.forRoot(),
    PrismaModule,
    CommonModule,
    EventsModule,
    HealthModule,
    UsersModule,
    AuthModule,
    WalletModule,
    CatalogModule,
    LotsModule,
    BidsModule,
    SettlementModule,
  ],
})
export class AppModule {}
