import { IsIn, IsOptional, IsString, Length } from 'class-validator';
import { CARD_RARITIES } from '../../catalog/scryfall/scryfall.types.js';
import { PaginationQueryDto } from '../../common/pagination/pagination.js';
import { Trim } from '../../common/validation/transforms.js';

export const SHOWCASE_PHASES = ['LIVE', 'SCHEDULED', 'CLOSED'] as const;
export type ShowcasePhase = (typeof SHOWCASE_PHASES)[number];

export class ShowcaseQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsIn(SHOWCASE_PHASES)
  phase?: ShowcasePhase;

  /** Searches the card name in any language. */
  @IsOptional()
  @Trim()
  @IsString()
  @Length(2, 100)
  q?: string;

  @IsOptional()
  @IsIn(CARD_RARITIES)
  rarity?: string;
}
