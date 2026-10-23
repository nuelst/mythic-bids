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
import { Idempotent } from '../common/idempotency/idempotent.decorator.js';
import type { Locale } from '../common/locale/locale.js';
import { RequestLocale } from '../common/locale/locale.js';
import { PaginationQueryDto } from '../common/pagination/pagination.js';
import { BidsService } from './bids.service.js';
import { PlaceBidDto } from './dto/place-bid.dto.js';

@ApiBearerAuth()
@Roles('BIDDER')
@Controller()
export class BidsController {
  constructor(private readonly bids: BidsService) {}

  @Post('lots/:id/bids')
  @Idempotent()
  place(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) lotId: string,
    @Body() dto: PlaceBidDto,
  ) {
    return this.bids.place(lotId, user.id, BigInt(dto.amountCents));
  }

  @Get('me/bids')
  findMine(
    @CurrentUser() user: AuthUser,
    @Query() query: PaginationQueryDto,
    @RequestLocale() locale: Locale,
  ) {
    return this.bids.findMine(user.id, query, locale);
  }
}
