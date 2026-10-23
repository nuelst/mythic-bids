import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { Cron, CronExpression, Interval } from '@nestjs/schedule';
import { Subject } from 'rxjs';
import { PrismaService } from '../prisma/prisma.service.js';
import { EventType } from './events.service.js';

export interface OutboxMessage {
  id: bigint;
  txId: string;
  type: EventType;
  lotId: string | null;
  userId: string | null;
  payload: Record<string, unknown>;
}

const RETENTION_MS = 24 * 60 * 60 * 1000;

/**
 * Streams committed outbox events to this instance's SSE clients. Every instance reads
 * the whole outbox with its own cursor, so it also works with several API replicas.
 */
@Injectable()
export class OutboxRelay implements OnApplicationBootstrap {
  private readonly messages = new Subject<OutboxMessage>();
  readonly messages$ = this.messages.asObservable();
  private cursor = { txId: '0', id: 0n };
  private polling = false;

  constructor(private readonly prisma: PrismaService) {}

  /** New connections only need events from now on; clients load the current state over HTTP. */
  async onApplicationBootstrap() {
    const [last] = await this.prisma.$queryRaw<OutboxMessage[]>`
      SELECT id, tx_id::text AS "txId" FROM outbox_events
      WHERE tx_id < pg_snapshot_xmin(pg_current_snapshot())
      ORDER BY tx_id DESC, id DESC LIMIT 1`;
    if (last) this.cursor = { txId: last.txId, id: last.id };
  }

  @Interval(250)
  async poll() {
    if (this.polling) return;
    this.polling = true;
    try {
      // Sequence ids are not assigned in commit order, so the cursor follows the transaction id and
      // only reads transactions older than every one still running: nothing can show up behind it later.
      const events = await this.prisma.$queryRaw<OutboxMessage[]>`
        SELECT id, tx_id::text AS "txId", type, lot_id AS "lotId", user_id AS "userId", payload
        FROM outbox_events
        WHERE (tx_id, id) > (${this.cursor.txId}::xid8, ${this.cursor.id})
          AND tx_id < pg_snapshot_xmin(pg_current_snapshot())
        ORDER BY tx_id, id
        LIMIT 500`;
      for (const event of events) {
        this.cursor = { txId: event.txId, id: event.id };
        this.messages.next(event);
      }
    } finally {
      this.polling = false;
    }
  }

  @Cron(CronExpression.EVERY_HOUR)
  async purge() {
    await this.prisma.outboxEvent.deleteMany({
      where: { createdAt: { lt: new Date(Date.now() - RETENTION_MS) } },
    });
  }
}
