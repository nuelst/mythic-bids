import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  circuitBreaker,
  ConsecutiveBreaker,
  ExponentialBackoff,
  handleAll,
  retry,
  timeout,
  TimeoutStrategy,
  wrap,
} from 'cockatiel';
import { Env } from '../../config/env.validation.js';
import { ScryfallCard, ScryfallList } from './scryfall.types.js';

// Scryfall asks for at most ~10 requests per second and these headers on every request.
const MIN_INTERVAL_MS = 100;
const HEADERS = { 'User-Agent': 'elite-dev-auction/1.0', Accept: '*/*' };

@Injectable()
export class ScryfallClient {
  private readonly logger = new Logger(ScryfallClient.name);
  private readonly baseUrl: string;
  private queue: Promise<unknown> = Promise.resolve();

  // Outer to inner: stop calling after 5 consecutive failures, retry once, give up after 3s.
  private readonly policy = wrap(
    circuitBreaker(handleAll, {
      halfOpenAfter: 30_000,
      breaker: new ConsecutiveBreaker(5),
    }),
    retry(handleAll, { maxAttempts: 1, backoff: new ExponentialBackoff() }),
    timeout(3_000, TimeoutStrategy.Aggressive),
  );

  constructor(config: ConfigService<Env, true>) {
    this.baseUrl = config.get('SCRYFALL_URL', { infer: true });
  }

  async search(query: string, page = 1) {
    const params = new URLSearchParams({
      q: query,
      page: String(page),
      include_multilingual: 'true',
    });
    const list = await this.get<ScryfallList>(`/cards/search?${params}`);
    return { cards: list?.data ?? [], hasMore: list?.has_more ?? false };
  }

  card(id: string) {
    return this.get<ScryfallCard>(`/cards/${id}`);
  }

  /** The same printing in another language, falling back to any printing of that card in the language. */
  async translatedCard(
    item: { setCode: string; collectorNumber: string; oracleId: string | null },
    lang: string,
  ) {
    const print = await this.get<ScryfallCard>(
      `/cards/${item.setCode}/${encodeURIComponent(item.collectorNumber)}/${lang}`,
    );
    if (print || !item.oracleId) return print;

    const { cards } = await this.search(
      `oracleid:${item.oracleId} lang:${lang}`,
    );
    return cards[0] ?? null;
  }

  /** Card images come from Scryfall's CDN, which is not rate limited. */
  async image(url: string) {
    const response = await fetch(url, {
      headers: HEADERS,
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) throw new Error(`Image responded ${response.status}`);

    return {
      contentType: response.headers.get('content-type') ?? 'image/jpeg',
      data: new Uint8Array(await response.arrayBuffer()),
    };
  }

  /** Returns null on 404 (Scryfall answers "no results" with a 404). */
  private get<T>(path: string): Promise<T | null> {
    return this.throttle(() =>
      this.policy.execute(async ({ signal }) => {
        const response = await fetch(`${this.baseUrl}${path}`, {
          signal,
          headers: { ...HEADERS, Accept: 'application/json' },
        });
        if (response.status === 404) return null;
        if (!response.ok) {
          this.logger.warn(`Scryfall ${path} -> ${response.status}`);
          throw new Error(`Scryfall responded ${response.status}`);
        }
        return (await response.json()) as T;
      }),
    );
  }

  private throttle<T>(task: () => Promise<T>): Promise<T> {
    const run = this.queue.then(task);
    this.queue = run
      .catch(() => undefined)
      .then(
        () => new Promise((resolve) => setTimeout(resolve, MIN_INTERVAL_MS)),
      );
    return run;
  }
}
