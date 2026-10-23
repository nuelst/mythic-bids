import { applyDecorators, UseInterceptors } from '@nestjs/common';
import { ApiHeader } from '@nestjs/swagger';
import { IdempotencyInterceptor } from './idempotency.interceptor.js';

export const Idempotent = () =>
  applyDecorators(
    UseInterceptors(IdempotencyInterceptor),
    ApiHeader({
      name: 'Idempotency-Key',
      required: true,
      description: 'Unique key per operation (e.g. a UUID); retries reuse it.',
    }),
  );
