import { IsAmountCents } from '../../common/money/money.js';

export class PlaceBidDto {
  @IsAmountCents()
  amountCents: number;
}
