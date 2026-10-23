import { HttpStatus, Injectable } from '@nestjs/common';
import { AuditService } from '../audit/audit.service.js';
import { Clock } from '../common/clock/clock.js';
import { AppException } from '../common/errors/app.exception.js';
import { ErrorCode } from '../common/errors/error-code.enum.js';
import { Locale } from '../common/locale/locale.js';
import { lotInclude, toLotView } from '../lots/lot.view.js';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class ReceiptsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly clock: Clock,
  ) {}

  /** Public receipt behind the share link; identifies the winner only by their alias. */
  async findByToken(token: string, locale: Locale) {
    const receipt = await this.prisma.receipt.findUnique({
      where: { publicToken: token },
      include: { lot: { include: lotInclude } },
    });
    if (!receipt) {
      throw new AppException(
        ErrorCode.RECEIPT_NOT_FOUND,
        HttpStatus.NOT_FOUND,
        'Receipt not found',
      );
    }

    return {
      token: receipt.publicToken,
      lot: toLotView(receipt.lot, locale, this.clock.now()),
      winnerAlias: receipt.winnerAlias,
      amountCents: receipt.amountCents,
      bidCount: receipt.bidCount,
      finalHash: receipt.finalHash,
      sealSignature: receipt.sealSignature,
      issuedAt: receipt.issuedAt,
      sealValid: this.audit.isSealValid(receipt),
    };
  }
}
