import { Controller, Get, Param } from '@nestjs/common';
import { Public } from '../auth/decorators/public.decorator.js';
import type { Locale } from '../common/locale/locale.js';
import { RequestLocale } from '../common/locale/locale.js';
import { ReceiptsService } from './receipts.service.js';

@Public()
@Controller('receipts')
export class ReceiptsController {
  constructor(private readonly receipts: ReceiptsService) {}

  @Get(':token')
  find(@Param('token') token: string, @RequestLocale() locale: Locale) {
    return this.receipts.findByToken(token, locale);
  }
}
