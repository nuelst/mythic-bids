import { Prisma } from '../generated/prisma/client.js';
import {
  catalogItemInclude,
  toCatalogItemView,
} from '../catalog/catalog-item.view.js';
import { Locale } from '../common/locale/locale.js';
import { lotPhase, minimumBidCents } from './lot.rules.js';

export const lotInclude = {
  item: { include: catalogItemInclude },
} satisfies Prisma.LotInclude;

export type LotWithItem = Prisma.LotGetPayload<{ include: typeof lotInclude }>;

export function toLotView(lot: LotWithItem, locale: Locale, now: Date) {
  return {
    id: lot.id,
    phase: lotPhase(lot, now),
    item: toCatalogItemView(lot.item, locale),
    startingPriceCents: lot.startingPriceCents,
    minIncrementCents: lot.minIncrementCents,
    currentPriceCents: lot.currentPriceCents,
    nextMinimumCents: minimumBidCents(lot),
    bidCount: lot.bidCount,
    startsAt: lot.startsAt,
    endsAt: lot.endsAt,
    originalEndsAt: lot.originalEndsAt,
    extended: lot.endsAt > lot.originalEndsAt,
    sold: lot.status === 'SETTLED' && lot.winnerId !== null,
    finalPriceCents: lot.finalPriceCents,
    settledAt: lot.settledAt,
    cancelledAt: lot.cancelledAt,
    createdAt: lot.createdAt,
  };
}
