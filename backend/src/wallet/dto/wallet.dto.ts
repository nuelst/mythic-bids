import { ApiProperty } from '@nestjs/swagger';
import { LedgerEntryType } from '../../generated/prisma/enums.js';
import { PageDto } from '../../common/pagination/pagination.js';

export class WalletDto {
  /** Everything deposited and received, minus what was spent. */
  @ApiProperty({ type: 'integer' })
  balanceCents: bigint;

  /** Held by the lots where the user is currently the highest bidder. */
  @ApiProperty({ type: 'integer' })
  committedCents: bigint;

  /** balance - committed: what can still be bid. */
  @ApiProperty({ type: 'integer' })
  availableCents: bigint;
}

export class LedgerEntryDto {
  @ApiProperty({ type: 'integer' })
  id: bigint;

  @ApiProperty({ enum: LedgerEntryType, enumName: 'LedgerEntryType' })
  type: LedgerEntryType;

  @ApiProperty({ type: 'integer' })
  amountCents: bigint;

  lotId: string | null;
  createdAt: Date;
}

export class LedgerPageDto extends PageDto(LedgerEntryDto) {}
