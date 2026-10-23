import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { CatalogJobsService } from './catalog-jobs.service.js';
import { CatalogController } from './catalog.controller.js';
import { CatalogService } from './catalog.service.js';
import { ScryfallClient } from './scryfall/scryfall.client.js';

@Module({
  imports: [CacheModule.register()],
  controllers: [CatalogController],
  providers: [ScryfallClient, CatalogService, CatalogJobsService],
  exports: [CatalogService],
})
export class CatalogModule {}
