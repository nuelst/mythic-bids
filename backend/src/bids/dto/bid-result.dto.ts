import { ApiProperty } from '@nestjs/swagger';
import { PageDto } from '../../common/pagination/pagination.js';
import { LotDto } from '../../lots/dto/lot.dto.js';

export class PlacedBidDto {
  seq: number;
  bidderAlias: string;

  @ApiProperty({ type: 'integer' })
  amountCents: bigint;

  createdAt: Date;

  /** Link of the lot's hash chain. */
  hash: string;
}

export class PlaceBidResultDto {
  bid: PlacedBidDto;

  @ApiProperty({ type: 'integer' })
  currentPriceCents: bigint;

  @ApiProperty({ type: 'integer' })
  nextMinimumCents: bigint;

  bidCount: number;
  endsAt: Date;

  /** True when this bid pushed the end (anti-sniping). */
  extended: boolean;
}

export const BID_OUTCOMES = [
  'WINNING',
  'OUTBID',
  'WON',
  'LOST',
  'CANCELLED',
] as const;
export type BidOutcome = (typeof BID_OUTCOMES)[number];

export class MyBidDto {
  lot: LotDto;

  @ApiProperty({ type: 'integer', nullable: true })
  myHighestCents: bigint | null;

  @ApiProperty({ enum: BID_OUTCOMES })
  outcome: BidOutcome;

  /** Token of the public receipt (GET /receipts/{token}) when the lot was won. */
  receiptToken: string | null;
}

export class MyBidsPageDto extends PageDto(MyBidDto) {}
