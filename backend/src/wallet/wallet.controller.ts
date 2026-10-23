import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import type { AuthUser } from '../auth/auth-user.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { Idempotent } from '../common/idempotency/idempotent.decorator.js';
import { PaginationQueryDto } from '../common/pagination/pagination.js';
import { DepositDto } from './dto/deposit.dto.js';
import { WalletService } from './wallet.service.js';

@ApiBearerAuth()
@Controller('wallet')
export class WalletController {
  constructor(private readonly wallet: WalletService) {}

  @Get()
  find(@CurrentUser() user: AuthUser) {
    return this.wallet.findByUser(user.id);
  }

  @Post('deposits')
  @Roles('BIDDER')
  @Idempotent()
  deposit(@CurrentUser() user: AuthUser, @Body() dto: DepositDto) {
    return this.wallet.deposit(user.id, BigInt(dto.amountCents));
  }

  @Get('ledger')
  ledger(@CurrentUser() user: AuthUser, @Query() query: PaginationQueryDto) {
    return this.wallet.ledger(user.id, query);
  }
}
