import { ApiProperty } from '@nestjs/swagger';
import { LOCALES } from '../../common/locale/locale.js';
import type { Locale } from '../../common/locale/locale.js';

export class ReferencePriceDto {
  usd: string | null;
  eur: string | null;
}

export class CatalogItemDto {
  id: string;

  /** Locale of the texts below (falls back to English when not translated). */
  @ApiProperty({ enum: LOCALES })
  locale: Locale;

  name: string;
  typeLine: string | null;
  rulesText: string | null;
  flavorText: string | null;

  /** Language printed on the physical card. */
  lang: string;
  rarity: string;
  setCode: string;
  setName: string;
  collectorNumber: string;
  manaCost: string | null;
  colors: string[];
  artist: string | null;
  releasedAt: Date | null;

  /** Market price of the English print, from Scryfall. */
  referencePrice: ReferencePriceDto | null;

  /** Path on this API, e.g. /catalog/items/{id}/image. */
  imageUrl: string;
}

export class CatalogSearchDto {
  /** "cache" when Scryfall is unavailable and the local catalog answered. */
  @ApiProperty({ enum: ['scryfall', 'cache'] })
  source: 'scryfall' | 'cache';

  hasMore: boolean;
  items: CatalogItemDto[];
}
