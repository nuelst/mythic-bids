import { Injectable } from '@nestjs/common';
import { Prisma } from '../generated/prisma/client.js';

export type EventType =
  | 'bid.placed'
  | 'bid.outbid'
  | 'lot.closed'
  | 'lot.cancelled'
  | 'lot.won'
  | 'wallet.changed';

export interface DomainEvent {
  type: EventType;
  lotId?: string;
  /** Private events go only to this user's stream. */
  userId?: string;
  payload?: Record<string, unknown>;
}

@Injectable()
export class EventsService {
  /** Must run inside the transaction that makes the change, so events and state commit together. */
  async emit(tx: Prisma.TransactionClient, events: DomainEvent[]) {
    await tx.outboxEvent.createMany({
      data: events.map(({ payload = {}, ...event }) => ({
        ...event,
        // Round-trips through JSON so BigInt amounts become plain numbers.
        payload: JSON.parse(JSON.stringify(payload)) as Prisma.InputJsonValue,
      })),
    });
  }
}
