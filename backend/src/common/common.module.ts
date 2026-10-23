import { Global, Module } from '@nestjs/common';
import { Clock } from './clock/clock.js';
import { IdempotencyInterceptor } from './idempotency/idempotency.interceptor.js';
import { IdempotencyService } from './idempotency/idempotency.service.js';

@Global()
@Module({
  providers: [Clock, IdempotencyService, IdempotencyInterceptor],
  exports: [Clock, IdempotencyService, IdempotencyInterceptor],
})
export class CommonModule {}
