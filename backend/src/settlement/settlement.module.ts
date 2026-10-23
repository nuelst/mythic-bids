import { Module } from '@nestjs/common';
import { AuditModule } from '../audit/audit.module.js';
import { WalletModule } from '../wallet/wallet.module.js';
import { ReceiptsController } from './receipts.controller.js';
import { ReceiptsService } from './receipts.service.js';
import { SettlementService } from './settlement.service.js';

@Module({
  imports: [WalletModule, AuditModule],
  controllers: [ReceiptsController],
  providers: [SettlementService, ReceiptsService],
  exports: [SettlementService],
})
export class SettlementModule {}
