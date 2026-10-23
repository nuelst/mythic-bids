// Builds src/seed/fixtures/cards.json from Scryfall so the seed works offline.
// Usage: node scripts/build-seed-fixture.mjs
import { writeFileSync } from 'node:fs';

const API = 'https://api.scryfall.com';
const HEADERS = { 'User-Agent': 'elite-dev-auction/1.0', Accept: 'application/json' };

// [card name, printed language of the auctioned item]
const CARDS = [
  ['Shivan Dragon', 'pt'],
  ['Serra Angel', 'en'],
  ['Lightning Bolt', 'pt'],
  ['Counterspell', 'en'],
  ['Llanowar Elves', 'pt'],
  ['Birds of Paradise', 'en'],
  ['Wrath of God', 'pt'],
  ['Sol Ring', 'en'],
  ['Dark Ritual', 'pt'],
  ['Thoughtseize', 'en'],
  ['Tarmogoyf', 'en'],
  ['Snapcaster Mage', 'pt'],
  ['Delver of Secrets', 'en'],
  ['Liliana of the Veil', 'pt'],
  ['Jace, the Mind Sculptor', 'en'],
  ['Academy Drake', 'pt'],
];

const CARD_FIELDS = ['id', 'oracle_id', 'lang', 'name', 'printed_name', 'type_line', 'printed_type_line', 'oracle_text', 'printed_text', 'flavor_text', 'mana_cost', 'colors', 'rarity', 'set', 'set_name', 'collector_number', 'artist', 'released_at', 'image_uris', 'card_faces', 'prices'];
const FACE_FIELDS = ['name', 'printed_name', 'type_line', 'printed_type_line', 'oracle_text', 'printed_text', 'flavor_text', 'mana_cost', 'colors', 'oracle_id', 'image_uris'];

const pick = (object, fields) =>
  Object.fromEntries(fields.filter((field) => object[field] != null).map((field) => [field, object[field]]));

const slim = (card) => {
  const result = pick(card, CARD_FIELDS);
  if (result.image_uris) result.image_uris = { normal: result.image_uris.normal };
  if (result.prices) result.prices = { usd: result.prices.usd, eur: result.prices.eur };
  if (result.card_faces) {
    result.card_faces = result.card_faces.map((face) => {
      const slimFace = pick(face, FACE_FIELDS);
      if (slimFace.image_uris) slimFace.image_uris = { normal: slimFace.image_uris.normal };
      return slimFace;
    });
  }
  return result;
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function get(path) {
  await sleep(120);
  const response = await fetch(`${API}${path}`, { headers: HEADERS });
  return response.ok ? response.json() : null;
}

const portuguesePrint = async (name) =>
  (await get(`/cards/search?unique=prints&q=${encodeURIComponent(`!"${name}" lang:pt`)}`))?.data?.[0] ?? null;

const fixture = [];
for (const [name, lang] of CARDS) {
  const english = await get(`/cards/named?exact=${encodeURIComponent(name)}`);
  const portuguese = await portuguesePrint(name);
  if (!english) throw new Error(`Card not found: ${name}`);

  // A Portuguese item already carries its translation; an English one borrows it from a Portuguese print.
  const entry =
    lang === 'pt' && portuguese
      ? { card: slim(portuguese) }
      : { card: slim(english), ...(portuguese && { translation: slim(portuguese) }) };
  fixture.push(entry);
  console.log(`${name}: ${entry.card.lang}${entry.translation ? ' + pt' : ''}`);
}

writeFileSync(
  new URL('../src/seed/fixtures/cards.json', import.meta.url),
  `${JSON.stringify(fixture, null, 2)}\n`,
);
