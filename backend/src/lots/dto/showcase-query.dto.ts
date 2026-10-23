import { IsIn, IsOptional, IsString, Length } from 'class-validator';
import { PaginationQueryDto } from '../../common/pagination/pagination.js';

export const SHOWCASE_PHASES = ['LIVE', 'SCHEDULED', 'CLOSED'] as const;
export type ShowcasePhase = (typeof SHOWCASE_PHASES)[number];

export class ShowcaseQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsIn(SHOWCASE_PHASES)
  phase?: ShowcasePhase;

  /** Searches the card name in any language. */
  @IsOptional()
  @IsString()
  @Length(2, 100)
  q?: string;

  @IsOptional()
  @IsString()
  rarity?: string;
}
