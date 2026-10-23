import { IsAmountCents } from '../../common/money/money.js';

export class DepositDto {
  /** Amount in cents (R$ 100,00 = 10000). */
  @IsAmountCents()
  amountCents: number;
}
