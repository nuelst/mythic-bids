import { Module } from '@nestjs/common';
import { AuditModule } from '../audit/audit.module.js';
import { LotsModule } from '../lots/lots.module.js';
import { WalletModule } from '../wallet/wallet.module.js';
import { BidsController } from './bids.controller.js';
import { BidsService } from './bids.service.js';

@Module({
  imports: [LotsModule, WalletModule, AuditModule],
  controllers: [BidsController],
  providers: [BidsService],
  exports: [BidsService],
})
export class BidsModule {}
