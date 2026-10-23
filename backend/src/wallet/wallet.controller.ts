import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import type { AuthUser } from '../auth/auth-user.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { ApiErrors } from '../common/errors/api-errors.decorator.js';
import { ErrorCode } from '../common/errors/error-code.enum.js';
import { Idempotent } from '../common/idempotency/idempotent.decorator.js';
import { PaginationQueryDto } from '../common/pagination/pagination.js';
import { DepositDto } from './dto/deposit.dto.js';
import { LedgerPageDto, WalletDto } from './dto/wallet.dto.js';
import { WalletService } from './wallet.service.js';

@ApiBearerAuth()
@ApiErrors({ 401: true })
@Controller('wallet')
export class WalletController {
  constructor(private readonly wallet: WalletService) {}

  /** Total, committed (held by leading bids) and available balance. */
  @Get()
  find(@CurrentUser() user: AuthUser): Promise<WalletDto> {
    return this.wallet.findByUser(user.id);
  }

  /** Simulated deposit; retries with the same Idempotency-Key are applied once. */
  @Post('deposits')
  @Roles('BIDDER')
  @Idempotent()
  @ApiErrors({
    400: [
      ErrorCode.IDEMPOTENCY_KEY_REQUIRED,
      ErrorCode.IDEMPOTENCY_KEY_INVALID,
    ],
    403: true,
    409: [ErrorCode.REQUEST_IN_PROGRESS],
    422: [ErrorCode.IDEMPOTENCY_KEY_REUSED],
  })
  deposit(
    @CurrentUser() user: AuthUser,
    @Body() dto: DepositDto,
  ): Promise<WalletDto> {
    return this.wallet.deposit(user.id, BigInt(dto.amountCents));
  }

  /** Wallet statement, newest first. */
  @Get('ledger')
  @ApiErrors({ 400: true })
  ledger(
    @CurrentUser() user: AuthUser,
    @Query() query: PaginationQueryDto,
  ): Promise<LedgerPageDto> {
    return this.wallet.ledger(user.id, query);
  }
}
