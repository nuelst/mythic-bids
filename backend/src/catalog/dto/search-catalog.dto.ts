import { Type } from 'class-transformer';
import {
  IsInt,
  IsOptional,
  IsString,
  Length,
  Matches,
  Min,
} from 'class-validator';

export class SearchCatalogDto {
  /** Card name or any Scryfall search syntax. */
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
  page: number = 1;
}
