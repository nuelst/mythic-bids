import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import type { AuthUser } from '../auth/auth-user.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { ApiErrors } from '../common/errors/api-errors.decorator.js';
import { ErrorCode } from '../common/errors/error-code.enum.js';
import { Idempotent } from '../common/idempotency/idempotent.decorator.js';
import type { Locale } from '../common/locale/locale.js';
import { RequestLocale } from '../common/locale/locale.js';
import { PaginationQueryDto } from '../common/pagination/pagination.js';
import { BidsService } from './bids.service.js';
import { MyBidsPageDto, PlaceBidResultDto } from './dto/bid-result.dto.js';
import { PlaceBidDto } from './dto/place-bid.dto.js';

@ApiBearerAuth()
@Roles('BIDDER')
@ApiErrors({ 401: true, 403: true })
@Controller()
export class BidsController {
  constructor(private readonly bids: BidsService) {}

  /** Places a bid; retries with the same Idempotency-Key are applied once. */
  @Post('lots/:id/bids')
  @Idempotent()
  @ApiErrors({
    400: [ErrorCode.IDEMPOTENCY_KEY_REQUIRED],
    404: [ErrorCode.LOT_NOT_FOUND],
    409: [ErrorCode.REQUEST_IN_PROGRESS],
    422: [
      ErrorCode.LOT_NOT_STARTED,
      ErrorCode.LOT_CLOSED,
      ErrorCode.ALREADY_WINNING,
      ErrorCode.BELOW_MINIMUM,
      ErrorCode.INSUFFICIENT_FUNDS,
      ErrorCode.IDEMPOTENCY_KEY_REUSED,
    ],
  })
  place(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) lotId: string,
    @Body() dto: PlaceBidDto,
  ): Promise<PlaceBidResultDto> {
    return this.bids.place(lotId, user.id, BigInt(dto.amountCents));
  }

  /** Lots the bidder took part in, with the outcome and the receipt token when won. */
  @Get('me/bids')
  findMine(
    @CurrentUser() user: AuthUser,
    @Query() query: PaginationQueryDto,
    @RequestLocale() locale: Locale,
  ): Promise<MyBidsPageDto> {
    return this.bids.findMine(user.id, query, locale);
  }
}
