import { Controller, Get, Param } from '@nestjs/common';
import { Public } from '../auth/decorators/public.decorator.js';
import { ApiErrors } from '../common/errors/api-errors.decorator.js';
import { ErrorCode } from '../common/errors/error-code.enum.js';
import type { Locale } from '../common/locale/locale.js';
import { RequestLocale } from '../common/locale/locale.js';
import { ReceiptDto } from './dto/receipt.dto.js';
import { ReceiptsService } from './receipts.service.js';

@Public()
@Controller('receipts')
export class ReceiptsController {
  constructor(private readonly receipts: ReceiptsService) {}

  /** Public receipt behind the share link; the winner appears only by alias. */
  @Get(':token')
  @ApiErrors({ 404: [ErrorCode.RECEIPT_NOT_FOUND] })
  find(
    @Param('token') token: string,
    @RequestLocale() locale: Locale,
  ): Promise<ReceiptDto> {
    return this.receipts.findByToken(token, locale);
  }
}
