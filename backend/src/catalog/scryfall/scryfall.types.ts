export const CARD_RARITIES = [
  'common',
  'uncommon',
  'rare',
  'mythic',
  'special',
  'bonus',
] as const;

interface ScryfallFace {
  name: string;
  printed_name?: string;
  type_line?: string;
  printed_type_line?: string;
  oracle_text?: string;
  printed_text?: string;
  flavor_text?: string;
  mana_cost?: string;
  colors?: string[];
  oracle_id?: string;
  image_uris?: { normal: string };
}

export interface ScryfallCard extends ScryfallFace {
  id: string;
  lang: string;
  rarity: string;
  set: string;
  set_name: string;
  collector_number: string;
  artist?: string;
  released_at?: string;
  card_faces?: ScryfallFace[];
  prices?: { usd: string | null; eur: string | null };
}

export interface ScryfallList {
  data: ScryfallCard[];
  has_more: boolean;
  total_cards?: number;
}
