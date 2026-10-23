import { Type } from 'class-transformer';
import { Trim } from '../../common/validation/transforms.js';
import {
  IsInt,
  IsOptional,
  IsString,
  Length,
  Matches,
  Max,
  Min,
} from 'class-validator';

export class SearchCatalogDto {
  /** Card name or any Scryfall search syntax. */
  @Trim()
  @IsString()
  @Length(2, 100)
  q: string;

  /** Printed language of the card (Scryfall code, e.g. "en", "pt"). */
  @IsOptional()
  @Matches(/^[a-z]{2,3}$/)
  lang?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(1000)
  page: number = 1;
}
