import {
  Controller,
  MessageEvent,
  Param,
  ParseUUIDPipe,
  Sse,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiProduces } from '@nestjs/swagger';
import { filter, interval, map, merge, Observable } from 'rxjs';
import type { AuthUser } from '../auth/auth-user.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { Public } from '../auth/decorators/public.decorator.js';
import { ApiErrors } from '../common/errors/api-errors.decorator.js';
import { OutboxMessage, OutboxRelay } from './outbox-relay.service.js';

// Keeps idle connections open through proxies that drop silent streams.
const HEARTBEAT_MS = 25_000;

@Controller()
export class EventsController {
  constructor(private readonly relay: OutboxRelay) {}

  /** Server-Sent Events of a lot. Reload GET /lots/{id} on (re)connect: only new events are streamed. */
  @Public()
  @Sse('lots/:id/events')
  @ApiProduces('text/event-stream')
  @ApiOkResponse({
    schema: { type: 'string', example: 'event: bid.placed\ndata: {...}' },
    description:
      'Events: `bid.placed` { bid, currentPriceCents, nextMinimumCents, bidCount, endsAt, extended }, ' +
      '`lot.closed` { sold, winnerAlias?, finalPriceCents? }, `lot.cancelled`, `ping` (heartbeat). ' +
      'Every payload includes `lotId`.',
  })
  lotEvents(@Param('id', ParseUUIDPipe) lotId: string) {
    return this.stream((event) => event.lotId === lotId && !event.userId);
  }

  /** Private Server-Sent Events of the current user. EventSource cannot send headers: pass the JWT as ?token=. */
  @ApiBearerAuth()
  @Sse('me/events')
  @ApiProduces('text/event-stream')
  @ApiOkResponse({
    schema: { type: 'string', example: 'event: wallet.changed\ndata: {...}' },
    description:
      'Events: `bid.outbid` { bid } (someone covered your bid), `lot.won` { receiptToken, amountCents }, ' +
      '`wallet.changed` (reload GET /wallet), `ping` (heartbeat). Every payload includes `lotId`.',
  })
  @ApiErrors({ 401: true })
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
