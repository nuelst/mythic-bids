import { ApiProperty } from '@nestjs/swagger';
import { LotDto } from '../../lots/dto/lot.dto.js';

export class ReceiptDto {
  token: string;
  lot: LotDto;
  winnerAlias: string;

  @ApiProperty({ type: 'integer' })
  amountCents: bigint;

  bidCount: number;

  /** Last hash of the bid chain when the lot closed. */
  finalHash: string;

  /** Ed25519 signature (base64) of the receipt's fields. */
  sealSignature: string;
  issuedAt: Date;

  /** Seal checked against the audit public key. */
  sealValid: boolean;
}
