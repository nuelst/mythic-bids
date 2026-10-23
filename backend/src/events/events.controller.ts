import {
  Controller,
  MessageEvent,
  Param,
  ParseUUIDPipe,
  Sse,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { filter, interval, map, merge, Observable } from 'rxjs';
import type { AuthUser } from '../auth/auth-user.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { Public } from '../auth/decorators/public.decorator.js';
import { OutboxMessage, OutboxRelay } from './outbox-relay.service.js';

// Keeps idle connections open through proxies that drop silent streams.
const HEARTBEAT_MS = 25_000;

@Controller()
export class EventsController {
  constructor(private readonly relay: OutboxRelay) {}

  /** Public lot events: bid.placed, lot.closed, lot.cancelled. */
  @Public()
  @Sse('lots/:id/events')
  lotEvents(@Param('id', ParseUUIDPipe) lotId: string) {
    return this.stream((event) => event.lotId === lotId && !event.userId);
  }

  /** Private events of the current user: bid.outbid, lot.won, wallet.changed. Pass the JWT as ?token=. */
  @ApiBearerAuth()
  @Sse('me/events')
  myEvents(@CurrentUser() user: AuthUser) {
    return this.stream((event) => event.userId === user.id);
  }

  private stream(
    belongs: (event: OutboxMessage) => boolean,
  ): Observable<MessageEvent> {
    return merge(
      this.relay.messages$.pipe(
        filter(belongs),
        map((event) => ({
          id: event.id.toString(),
          type: event.type,
          data: { ...event.payload, lotId: event.lotId },
        })),
      ),
      interval(HEARTBEAT_MS).pipe(map(() => ({ type: 'ping', data: {} }))),
    );
  }
}
