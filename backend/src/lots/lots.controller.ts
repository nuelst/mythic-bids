import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import type { AuthUser } from '../auth/auth-user.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { Public } from '../auth/decorators/public.decorator.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { ApiErrors } from '../common/errors/api-errors.decorator.js';
import { ErrorCode } from '../common/errors/error-code.enum.js';
import type { Locale } from '../common/locale/locale.js';
import { RequestLocale } from '../common/locale/locale.js';
import { PaginationQueryDto } from '../common/pagination/pagination.js';
import { CreateLotDto } from './dto/create-lot.dto.js';
import {
  LotDto,
  LotPageDto,
  LotRoomDto,
  SellerLotsPageDto,
} from './dto/lot.dto.js';
import { ShowcaseQueryDto } from './dto/showcase-query.dto.js';
import { LotsService } from './lots.service.js';

@Controller('lots')
export class LotsController {
  constructor(private readonly lots: LotsService) {}

  /** Showcase of live, scheduled and closed lots; cancelled lots are left out. */
  @Public()
  @Get()
  @ApiErrors({ 400: true })
  showcase(
    @Query() query: ShowcaseQueryDto,
    @RequestLocale() locale: Locale,
  ): Promise<LotPageDto> {
    return this.lots.showcase(query, locale);
  }

  /** Lot room. Public; with a bidder token it also returns the viewer's standing. */
  @Public()
  @Get(':id')
  @ApiErrors({ 400: true, 404: [ErrorCode.LOT_NOT_FOUND] })
  room(
    @Param('id', ParseUUIDPipe) id: string,
    @RequestLocale() locale: Locale,
    @CurrentUser() viewer?: AuthUser,
  ): Promise<LotRoomDto> {
    return this.lots.room(id, locale, viewer);
  }

  /** Creates a lot from a catalog item (see GET /catalog/search). */
  @Post()
  @ApiBearerAuth()
  @Roles('AUCTIONEER')
  @ApiErrors({
    400: true,
    401: true,
    403: true,
    404: [ErrorCode.CATALOG_ITEM_NOT_FOUND],
    422: [ErrorCode.INVALID_SCHEDULE],
  })
  create(
    @CurrentUser() user: AuthUser,
    @Body() dto: CreateLotDto,
    @RequestLocale() locale: Locale,
  ): Promise<LotDto> {
    return this.lots.create(user.id, dto, locale);
  }

  /** Cancels a scheduled or live lot; the leading bid is refunded. */
  @Delete(':id')
  @ApiBearerAuth()
  @Roles('AUCTIONEER')
  @ApiErrors({
    401: true,
    403: true,
    404: [ErrorCode.LOT_NOT_FOUND],
    409: [ErrorCode.LOT_NOT_CANCELLABLE],
  })
  cancel(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @RequestLocale() locale: Locale,
  ): Promise<LotDto> {
    return this.lots.cancel(user.id, id, locale);
  }
}

@ApiBearerAuth()
@ApiErrors({ 401: true, 403: true })
@Controller('seller/lots')
export class SellerLotsController {
  constructor(private readonly lots: LotsService) {}

  /** The seller's lots with their results and the total received. */
  @Get()
  @Roles('AUCTIONEER')
  list(
    @CurrentUser() user: AuthUser,
    @Query() query: PaginationQueryDto,
    @RequestLocale() locale: Locale,
  ): Promise<SellerLotsPageDto> {
    return this.lots.listForSeller(user.id, query, locale);
  }
}
