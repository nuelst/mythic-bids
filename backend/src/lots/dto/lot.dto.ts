import { ApiProperty } from '@nestjs/swagger';
import { CatalogItemDto } from '../../catalog/dto/catalog-item.dto.js';
import { PageDto } from '../../common/pagination/pagination.js';
import { LOT_PHASES } from '../lot.rules.js';
import type { LotPhase } from '../lot.rules.js';

export class LotDto {
  id: string;

  /** CLOSING: ended, waiting for settlement (no bids accepted). */
  @ApiProperty({ enum: LOT_PHASES })
  phase: LotPhase;

  item: CatalogItemDto;

  @ApiProperty({ type: 'integer' })
  startingPriceCents: bigint;

  @ApiProperty({ type: 'integer' })
  minIncrementCents: bigint;

  @ApiProperty({ type: 'integer', nullable: true })
  currentPriceCents: bigint | null;

  /** Lowest bid accepted right now. */
  @ApiProperty({ type: 'integer' })
  nextMinimumCents: bigint;

  bidCount: number;
  startsAt: Date;

  /** Current end; moves forward with anti-sniping. */
  endsAt: Date;
  originalEndsAt: Date;
  extended: boolean;
  sold: boolean;

  @ApiProperty({ type: 'integer', nullable: true })
  finalPriceCents: bigint | null;

  settledAt: Date | null;
  cancelledAt: Date | null;
  createdAt: Date;
}

export class LotPageDto extends PageDto(LotDto) {}

export class SellerLotsPageDto extends PageDto(LotDto) {
  /** Sum of the payouts of every sold lot. */
  @ApiProperty({ type: 'integer' })
  totalReceivedCents: bigint;
}

export class RoomBidDto {
  seq: number;
  bidderAlias: string;

  @ApiProperty({ type: 'integer' })
  amountCents: bigint;

  createdAt: Date;
}

export class ViewerStandingDto {
  /** The viewer's pseudonym in this lot. */
  alias: string;
  isLeading: boolean;

  @ApiProperty({ type: 'integer', nullable: true })
  myHighestCents: bigint | null;

  /** 1 = leading; null when the viewer has not bid. */
  position: number | null;
  bidders: number;
}

export class LotRoomDto extends LotDto {
  /** Server clock, to sync the countdown. */
  serverTime: Date;
  leaderAlias: string | null;

  /** Newest first; bidders appear only by alias. */
  bids: RoomBidDto[];

  /** Only for an authenticated bidder. */
  viewer: ViewerStandingDto | null;
}
