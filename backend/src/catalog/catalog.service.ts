import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { HttpStatus, Inject, Injectable, Logger } from '@nestjs/common';
import type { Cache } from 'cache-manager';
import { CatalogJobType } from '../generated/prisma/client.js';
import { AppException } from '../common/errors/app.exception.js';
import { ErrorCode } from '../common/errors/error-code.enum.js';
import { errorMessage } from '../common/errors/error-message.js';
import { Locale, LOCALES } from '../common/locale/locale.js';
import { PrismaService } from '../prisma/prisma.service.js';
import {
  catalogItemInclude,
  CatalogItemWithTranslations,
  toCatalogItemView,
} from './catalog-item.view.js';
import { SearchCatalogDto } from './dto/search-catalog.dto.js';
import { ScryfallClient } from './scryfall/scryfall.client.js';
import {
  printedTranslation,
  toItemData,
  toTranslations,
} from './scryfall/scryfall.mapper.js';
import { ScryfallCard } from './scryfall/scryfall.types.js';

const SEARCH_TTL_MS = 10 * 60 * 1000;
const OFFLINE_RESULTS = 60;

type SearchResult = Awaited<ReturnType<ScryfallClient['search']>>;

@Injectable()
export class CatalogService {
  private readonly logger = new Logger(CatalogService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly scryfall: ScryfallClient,
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
  ) {}

  async search({ q, lang, page }: SearchCatalogDto, locale: Locale) {
    try {
      const { cards, hasMore } = await this.searchScryfall(
        lang ? `${q} lang:${lang}` : q,
        page,
      );
      const items = await this.saveCards(cards);
      return {
        source: 'scryfall' as const,
        hasMore,
        items: items.map((item) => toCatalogItemView(item, locale)),
      };
    } catch (error) {
      this.logger.warn(
        `Scryfall unavailable, using the local catalog: ${errorMessage(error)}`,
      );
      const items = await this.prisma.catalogItem.findMany({
        where: {
          lang,
          translations: {
            some: { name: { contains: q, mode: 'insensitive' } },
          },
        },
        include: catalogItemInclude,
        orderBy: { createdAt: 'desc' },
        take: OFFLINE_RESULTS,
      });
      return {
        source: 'cache' as const,
        hasMore: false,
        items: items.map((item) => toCatalogItemView(item, locale)),
      };
    }
  }

  /** Inserts new cards only: existing rows are snapshots referenced by lots and must not change. */
  async saveCards(
    cards: ScryfallCard[],
  ): Promise<CatalogItemWithTranslations[]> {
    if (!cards.length) return [];
    const scryfallIds = cards.map((card) => card.id);

    await this.prisma.catalogItem.createMany({
      data: cards.map(toItemData),
      skipDuplicates: true,
    });
    const ids = await this.prisma.catalogItem.findMany({
      where: { scryfallId: { in: scryfallIds } },
      select: { id: true, scryfallId: true },
    });
    const itemIdOf = new Map(ids.map((item) => [item.scryfallId, item.id]));

    await this.prisma.catalogItemTranslation.createMany({
      data: cards.flatMap((card) =>
        toTranslations(card).map((translation) => ({
          ...translation,
          itemId: itemIdOf.get(card.id)!,
        })),
      ),
      skipDuplicates: true,
    });

    const items = await this.prisma.catalogItem.findMany({
      where: { scryfallId: { in: scryfallIds } },
      include: catalogItemInclude,
    });
    const order = new Map(scryfallIds.map((id, index) => [id, index]));
    return items.sort(
      (a, b) => order.get(a.scryfallId)! - order.get(b.scryfallId)!,
    );
  }

  /** Stores the text of another printing (in its language) as a translation of the item. */
  async addSiblingTranslation(itemId: string, sibling: ScryfallCard) {
    const translation = printedTranslation(sibling, 'SIBLING');
    if (!translation) return;
    await this.prisma.catalogItemTranslation.createMany({
      data: { ...translation, itemId },
      skipDuplicates: true,
    });
  }

  /** Makes sure the item exists and schedules the image copy and missing translations. */
  async prepareForLot(itemId: string) {
    const item = await this.prisma.catalogItem.findUnique({
      where: { id: itemId },
      include: catalogItemInclude,
    });
    if (!item) {
      throw new AppException(
        ErrorCode.CATALOG_ITEM_NOT_FOUND,
        HttpStatus.NOT_FOUND,
        'Catalog item not found',
      );
    }

    const jobs: CatalogJobType[] = [];
    if (item.imageStatus !== 'MIRRORED') jobs.push('IMAGE_MIRROR');
    if (
      LOCALES.some(
        (locale) => !item.translations.some((t) => t.locale === locale),
      )
    ) {
      jobs.push('TRANSLATE');
    }
    await this.prisma.catalogJob.createMany({
      data: jobs.map((type) => ({ type, itemId })),
      skipDuplicates: true,
    });
    return item;
  }

  async findImage(itemId: string) {
    return this.prisma.catalogItem.findUnique({
      where: { id: itemId },
      select: { sourceImageUrl: true, image: true },
    });
  }

  private async searchScryfall(query: string, page: number) {
    const key = `scryfall:${page}:${query.toLowerCase()}`;
    const cached = await this.cache.get<SearchResult>(key);
    if (cached) return cached;

    const result = await this.scryfall.search(query, page);
    await this.cache.set(key, result, SEARCH_TTL_MS);
    return result;
  }
}
