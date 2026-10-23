import { Prisma, TranslationOrigin } from '../../generated/prisma/client.js';
import { isLocale } from '../../common/locale/locale.js';
import { ScryfallCard } from './scryfall.types.js';

type FaceField = Exclude<
  keyof ScryfallCard & keyof NonNullable<ScryfallCard['card_faces']>[number],
  'colors' | 'image_uris'
>;

export type TranslationData = Omit<
  Prisma.CatalogItemTranslationCreateManyInput,
  'itemId'
>;

/** Double-faced cards keep their texts per face; join them like Scryfall does ("A // B"). */
function field(card: ScryfallCard, key: FaceField, separator = ' // ') {
  const value =
    card[key] ??
    card.card_faces
      ?.map((face) => face[key])
      .filter(Boolean)
      .join(separator);
  return value || null;
}

export function toItemData(
  card: ScryfallCard,
): Prisma.CatalogItemCreateManyInput {
  const face = card.card_faces?.[0];
  const { usd = null, eur = null } = card.prices ?? {};

  return {
    scryfallId: card.id,
    oracleId: card.oracle_id ?? face?.oracle_id ?? null,
    setCode: card.set,
    setName: card.set_name,
    collectorNumber: card.collector_number,
    lang: card.lang,
    rarity: card.rarity,
    manaCost: field(card, 'mana_cost'),
    colors: card.colors ?? face?.colors ?? [],
    artist: card.artist ?? null,
    releasedAt: card.released_at ? new Date(card.released_at) : null,
    referencePrice: usd || eur ? { usd, eur } : Prisma.DbNull,
    sourceImageUrl: card.image_uris?.normal ?? face?.image_uris?.normal ?? null,
  };
}

/** Text printed on the card in its own language (only for supported, non-English locales). */
export function printedTranslation(
  card: ScryfallCard,
  origin: TranslationOrigin,
): TranslationData | null {
  if (card.lang === 'en' || !isLocale(card.lang)) return null;

  return {
    locale: card.lang,
    name: field(card, 'printed_name') ?? card.name,
    typeLine: field(card, 'printed_type_line'),
    rulesText: field(card, 'printed_text', '\n//\n'),
    flavorText: field(card, 'flavor_text', '\n'),
    origin,
  };
}

export function toTranslations(card: ScryfallCard): TranslationData[] {
  const english: TranslationData = {
    locale: 'en',
    name: card.name,
    typeLine: field(card, 'type_line'),
    rulesText: field(card, 'oracle_text', '\n//\n'),
    // Flavor text is printed in the card's language, so it is only English on English prints.
    flavorText: card.lang === 'en' ? field(card, 'flavor_text', '\n') : null,
    origin: 'ORACLE',
  };
  const printed = printedTranslation(card, 'PRINTED');
  return printed ? [english, printed] : [english];
}
