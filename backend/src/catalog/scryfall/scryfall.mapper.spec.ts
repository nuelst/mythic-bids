import { readFileSync } from 'node:fs';
import { Prisma } from '../../generated/prisma/client.js';
import {
  printedTranslation,
  toItemData,
  toTranslations,
} from './scryfall.mapper.js';
import { ScryfallCard } from './scryfall.types.js';

const fixture = (name: string): ScryfallCard =>
  JSON.parse(
    readFileSync(
      new URL(`./__fixtures__/${name}.json`, import.meta.url),
      'utf8',
    ),
  ) as ScryfallCard;

describe('scryfall mapper', () => {
  it('maps an English print with prices and an English translation only', () => {
    const card = fixture('academy-drake-en');

    expect(toItemData(card)).toMatchObject({
      scryfallId: card.id,
      lang: 'en',
      setCode: 'dom',
      collectorNumber: '40',
      rarity: 'common',
      manaCost: '{2}{U}',
      referencePrice: { usd: card.prices?.usd, eur: card.prices?.eur },
    });
    expect(toTranslations(card)).toEqual([
      expect.objectContaining({
        locale: 'en',
        name: 'Academy Drake',
        origin: 'ORACLE',
      }),
    ]);
  });

  it('maps a Portuguese print to English and Portuguese translations', () => {
    const card = fixture('academy-drake-pt');
    const [english, portuguese] = toTranslations(card);

    expect(toItemData(card)).toMatchObject({
      lang: 'pt',
      referencePrice: Prisma.DbNull,
    });
    expect(english).toMatchObject({
      locale: 'en',
      name: 'Academy Drake',
      flavorText: null,
    });
    expect(portuguese).toMatchObject({
      locale: 'pt',
      name: 'Dragonete da Academia',
      typeLine: 'Criatura — Dragonete',
      origin: 'PRINTED',
    });
  });

  it('joins the faces of double-faced cards', () => {
    const card = fixture('delver-of-secrets');
    const item = toItemData(card);

    expect(item.oracleId).toBe(card.oracle_id);
    expect(item.sourceImageUrl).toBe(card.card_faces?.[0].image_uris?.normal);
    expect(toTranslations(card)[0]).toMatchObject({
      name: 'Delver of Secrets // Insectile Aberration',
      typeLine: expect.stringContaining(' // '),
      rulesText: expect.stringContaining('\n//\n'),
    });
  });

  it('only builds printed translations for supported non-English locales', () => {
    expect(
      printedTranslation(fixture('academy-drake-en'), 'SIBLING'),
    ).toBeNull();
    expect(
      printedTranslation(
        { ...fixture('academy-drake-pt'), lang: 'ja' },
        'SIBLING',
      ),
    ).toBeNull();
    expect(
      printedTranslation(fixture('academy-drake-pt'), 'SIBLING'),
    ).toMatchObject({
      locale: 'pt',
      origin: 'SIBLING',
    });
  });
});
