import { Global, Module } from '@nestjs/common';
import { EventsController } from './events.controller.js';
import { EventsService } from './events.service.js';
import { OutboxRelay } from './outbox-relay.service.js';

@Global()
@Module({
  controllers: [EventsController],
  providers: [EventsService, OutboxRelay],
  exports: [EventsService],
})
export class EventsModule {}
