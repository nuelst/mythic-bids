import { HttpStatus, Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Prisma } from '../../generated/prisma/client.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import { AppException } from '../errors/app.exception.js';
import { ErrorCode } from '../errors/error-code.enum.js';

const TTL_MS = 24 * 60 * 60 * 1000;

export interface StoredResponse {
  statusCode: number;
  body: unknown;
}

@Injectable()
export class IdempotencyService {
  constructor(private readonly prisma: PrismaService) {}

  /** Returns the stored response when the key was already used, or null when this request owns it. */
  async claim(
    userId: string,
    key: string,
    fingerprint: string,
  ): Promise<StoredResponse | null> {
    const { count } = await this.prisma.idempotencyKey.createMany({
      data: { userId, key, fingerprint },
      skipDuplicates: true,
    });
    if (count === 1) return null;

    const saved = await this.prisma.idempotencyKey.findUniqueOrThrow({
      where: { userId_key: { userId, key } },
    });
    if (saved.fingerprint !== fingerprint) {
      throw new AppException(
        ErrorCode.IDEMPOTENCY_KEY_REUSED,
        HttpStatus.UNPROCESSABLE_ENTITY,
        'Idempotency-Key was already used with a different request',
      );
    }
    if (saved.statusCode === null) {
      throw new AppException(
        ErrorCode.REQUEST_IN_PROGRESS,
        HttpStatus.CONFLICT,
        'A request with this Idempotency-Key is still in progress',
      );
    }
    return { statusCode: saved.statusCode, body: saved.response };
  }

  async complete(userId: string, key: string, response: StoredResponse) {
    await this.prisma.idempotencyKey.update({
      where: { userId_key: { userId, key } },
      data: {
        statusCode: response.statusCode,
        response: (response.body ?? Prisma.JsonNull) as Prisma.InputJsonValue,
      },
    });
  }

  /** Failed requests release the key so the client can retry. */
  async release(userId: string, key: string) {
    await this.prisma.idempotencyKey.deleteMany({ where: { userId, key } });
  }

  @Cron(CronExpression.EVERY_HOUR)
  async purgeExpired() {
    await this.prisma.idempotencyKey.deleteMany({
      where: { createdAt: { lt: new Date(Date.now() - TTL_MS) } },
    });
  }
}
