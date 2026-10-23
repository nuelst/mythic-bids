import { IsDateString, IsOptional, IsUUID } from 'class-validator';
import { IsAmountCents } from '../../common/money/money.js';

export class CreateLotDto {
  /** Catalog item id returned by GET /catalog/search. */
  @IsUUID()
  itemId: string;

  @IsAmountCents()
  startingPriceCents: number;

  @IsAmountCents()
  minIncrementCents: number;

  /** Defaults to now; past dates are treated as now. */
  @IsOptional()
  @IsDateString()
  startsAt?: string;

  @IsDateString()
  endsAt: string;
}
