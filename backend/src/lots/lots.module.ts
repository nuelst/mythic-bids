import { Module } from '@nestjs/common';
import { AuditModule } from '../audit/audit.module.js';
import { CatalogModule } from '../catalog/catalog.module.js';
import { WalletModule } from '../wallet/wallet.module.js';
import { LotsController, SellerLotsController } from './lots.controller.js';
import { LotsService } from './lots.service.js';

@Module({
  imports: [CatalogModule, AuditModule, WalletModule],
  controllers: [LotsController, SellerLotsController],
  providers: [LotsService],
  exports: [LotsService],
})
export class LotsModule {}
