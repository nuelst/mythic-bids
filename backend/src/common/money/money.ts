import { applyDecorators } from '@nestjs/common';
import { IsInt, IsPositive, Max } from 'class-validator';

/** R$ 1.000.000,00 — upper bound for a single amount (deposit, bid, price). */
export const MAX_AMOUNT_CENTS = 100_000_000;

export const IsAmountCents = () =>
  applyDecorators(IsInt(), IsPositive(), Max(MAX_AMOUNT_CENTS));
