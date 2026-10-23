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
import type { Locale } from '../common/locale/locale.js';
import { RequestLocale } from '../common/locale/locale.js';
import { PaginationQueryDto } from '../common/pagination/pagination.js';
import { CreateLotDto } from './dto/create-lot.dto.js';
import { ShowcaseQueryDto } from './dto/showcase-query.dto.js';
import { LotsService } from './lots.service.js';

@Controller('lots')
export class LotsController {
  constructor(private readonly lots: LotsService) {}

  @Public()
  @Get()
  showcase(@Query() query: ShowcaseQueryDto, @RequestLocale() locale: Locale) {
    return this.lots.showcase(query, locale);
  }

  @Public()
  @Get(':id')
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @RequestLocale() locale: Locale,
  ) {
    return this.lots.findOne(id, locale);
  }

  @Post()
  @ApiBearerAuth()
  @Roles('AUCTIONEER')
  create(
    @CurrentUser() user: AuthUser,
    @Body() dto: CreateLotDto,
    @RequestLocale() locale: Locale,
  ) {
    return this.lots.create(user.id, dto, locale);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @Roles('AUCTIONEER')
  cancel(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @RequestLocale() locale: Locale,
  ) {
    return this.lots.cancel(user.id, id, locale);
  }
}

@ApiBearerAuth()
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
  ) {
    return this.lots.listForSeller(user.id, query, locale);
  }
}
