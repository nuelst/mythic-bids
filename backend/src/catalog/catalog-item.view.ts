import { Prisma } from '../generated/prisma/client.js';
import { DEFAULT_LOCALE, Locale } from '../common/locale/locale.js';

export const catalogItemInclude = {
  translations: true,
} satisfies Prisma.CatalogItemInclude;

export type CatalogItemWithTranslations = Prisma.CatalogItemGetPayload<{
  include: typeof catalogItemInclude;
}>;

export const catalogImagePath = (itemId: string) =>
  `/catalog/items/${itemId}/image`;

/** Item in the requested locale, falling back to English when there is no translation yet. */
export function toCatalogItemView(
  item: CatalogItemWithTranslations,
  locale: Locale,
) {
  const text =
    item.translations.find((t) => t.locale === locale) ??
    item.translations.find((t) => t.locale === DEFAULT_LOCALE) ??
    item.translations[0];

  return {
    id: item.id,
    locale: text?.locale ?? DEFAULT_LOCALE,
    name: text?.name ?? '',
    typeLine: text?.typeLine ?? null,
    rulesText: text?.rulesText ?? null,
    flavorText: text?.flavorText ?? null,
    lang: item.lang,
    rarity: item.rarity,
    setCode: item.setCode,
    setName: item.setName,
    collectorNumber: item.collectorNumber,
    manaCost: item.manaCost,
    colors: item.colors,
    artist: item.artist,
    releasedAt: item.releasedAt,
    referencePrice: item.referencePrice,
    imageUrl: catalogImagePath(item.id),
  };
}

export type CatalogItemView = ReturnType<typeof toCatalogItemView>;
