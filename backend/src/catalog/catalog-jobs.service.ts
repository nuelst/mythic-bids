import { Injectable, Logger } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import { CatalogJobType } from '../generated/prisma/client.js';
import { errorMessage } from '../common/errors/error-message.js';
import { LOCALES } from '../common/locale/locale.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { CatalogService } from './catalog.service.js';
import { ScryfallClient } from './scryfall/scryfall.client.js';

const MAX_ATTEMPTS = 5;
const RETRY_BASE_MS = 5_000;

interface ClaimedJob {
  id: string;
  type: CatalogJobType;
  itemId: string;
  attempts: number;
}

/** Background work for lot items: copy the image into our database and fill missing translations. */
@Injectable()
export class CatalogJobsService {
  private readonly logger = new Logger(CatalogJobsService.name);
  private running = false;

  constructor(
    private readonly prisma: PrismaService,
    private readonly scryfall: ScryfallClient,
    private readonly catalog: CatalogService,
  ) {}

  @Interval(2_000)
  async processDue() {
    if (this.running) return;
    this.running = true;
    try {
      let job: ClaimedJob | null;
      while ((job = await this.claim())) await this.run(job);
    } finally {
      this.running = false;
    }
  }

  // Leases the job for a minute instead of holding a transaction during the HTTP call;
  // SKIP LOCKED lets several instances share the queue.
  private async claim(): Promise<ClaimedJob | null> {
    const [job] = await this.prisma.$queryRaw<ClaimedJob[]>`
      UPDATE catalog_jobs
      SET run_after = now() + interval '1 minute', attempts = attempts + 1
      WHERE id = (
        SELECT id FROM catalog_jobs
        WHERE status = 'PENDING' AND run_after <= now()
        ORDER BY run_after
        LIMIT 1
        FOR UPDATE SKIP LOCKED
      )
      RETURNING id, type, item_id AS "itemId", attempts`;
    return job ?? null;
  }

  private async run(job: ClaimedJob) {
    try {
      if (job.type === 'IMAGE_MIRROR') await this.mirrorImage(job.itemId);
      else await this.translate(job.itemId);
      await this.prisma.catalogJob.update({
        where: { id: job.id },
        data: { status: 'DONE', lastError: null },
      });
    } catch (error) {
      const failed = job.attempts >= MAX_ATTEMPTS;
      this.logger.warn(
        `${job.type} ${job.itemId} attempt ${job.attempts}: ${errorMessage(error)}`,
      );
      await this.prisma.catalogJob.update({
        where: { id: job.id },
        data: {
          status: failed ? 'FAILED' : 'PENDING',
          lastError: errorMessage(error),
          runAfter: new Date(Date.now() + RETRY_BASE_MS * 2 ** job.attempts),
        },
      });
      if (failed && job.type === 'IMAGE_MIRROR') {
        await this.prisma.catalogItem.update({
          where: { id: job.itemId },
          data: { imageStatus: 'FAILED' },
        });
      }
    }
  }

  private async mirrorImage(itemId: string) {
    const { sourceImageUrl } = await this.prisma.catalogItem.findUniqueOrThrow({
      where: { id: itemId },
    });
    if (!sourceImageUrl) throw new Error('Item has no image');

    const image = await this.scryfall.image(sourceImageUrl);
    await this.prisma.$transaction([
      this.prisma.catalogImage.upsert({
        where: { itemId },
        create: { itemId, ...image },
        update: image,
      }),
      this.prisma.catalogItem.update({
        where: { id: itemId },
        data: { imageStatus: 'MIRRORED' },
      }),
    ]);
  }

  private async translate(itemId: string) {
    const item = await this.prisma.catalogItem.findUniqueOrThrow({
      where: { id: itemId },
      include: { translations: true },
    });
    const missing = LOCALES.filter(
      (locale) => !item.translations.some((t) => t.locale === locale),
    );

    for (const locale of missing) {
      const card = await this.scryfall.translatedCard(item, locale);
      if (card) await this.catalog.addSiblingTranslation(itemId, card);
    }
  }
}
