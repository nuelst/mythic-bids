import {
  CallHandler,
  ExecutionContext,
  HttpStatus,
  Injectable,
  NestInterceptor,
  UnauthorizedException,
} from '@nestjs/common';
import { createHash } from 'node:crypto';
import type { Request, Response } from 'express';
import { catchError, mergeMap, Observable, of } from 'rxjs';
import { AppException } from '../errors/app.exception.js';
import { ErrorCode } from '../errors/error-code.enum.js';
import { IdempotencyService } from './idempotency.service.js';

@Injectable()
export class IdempotencyInterceptor implements NestInterceptor {
  constructor(private readonly idempotency: IdempotencyService) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<unknown>> {
    const http = context.switchToHttp();
    const request = http.getRequest<Request & { user?: { id: string } }>();
    const response = http.getResponse<Response>();

    const key = request.header('idempotency-key');
    if (!key) {
      throw new AppException(
        ErrorCode.IDEMPOTENCY_KEY_REQUIRED,
        HttpStatus.BAD_REQUEST,
        'Idempotency-Key header is required',
      );
    }
    const userId = request.user?.id;
    if (!userId) throw new UnauthorizedException();

    const fingerprint = createHash('sha256')
      .update(
        `${request.method} ${request.originalUrl} ${JSON.stringify(request.body)}`,
      )
      .digest('hex');

    const stored = await this.idempotency.claim(userId, key, fingerprint);
    if (stored) {
      response.status(stored.statusCode);
      return of(stored.body);
    }

    return next.handle().pipe(
      mergeMap(async (body: unknown) => {
        await this.idempotency.complete(userId, key, {
          statusCode: response.statusCode,
          body,
        });
        return body;
      }),
      catchError(async (error: unknown) => {
        await this.idempotency.release(userId, key);
        throw error;
      }),
    );
  }
}
