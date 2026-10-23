import { Controller, Get, Header, Param, ParseUUIDPipe } from '@nestjs/common';
import { ApiOkResponse, ApiProduces } from '@nestjs/swagger';
import { Public } from '../auth/decorators/public.decorator.js';
import { ApiErrors } from '../common/errors/api-errors.decorator.js';
import { ErrorCode } from '../common/errors/error-code.enum.js';
import { AuditService } from './audit.service.js';
import { AuditReportDto } from './dto/audit-report.dto.js';

@Public()
@Controller('audit')
export class AuditController {
  constructor(private readonly audit: AuditService) {}

  /** Recomputes hashes and signatures of the whole bid history; no login required. */
  @Get('lots/:id')
  @ApiErrors({ 400: true, 404: [ErrorCode.LOT_NOT_FOUND] })
  verify(@Param('id', ParseUUIDPipe) id: string): Promise<AuditReportDto> {
    return this.audit.verifyLot(id);
  }

  /** Ed25519 public key (PEM) to check the signatures independently. */
  @Get('public-key')
  @Header('Content-Type', 'text/plain')
  @ApiProduces('text/plain')
  @ApiOkResponse({
    schema: { type: 'string', example: '-----BEGIN PUBLIC KEY-----\n...' },
  })
  publicKey() {
    return this.audit.publicKeyPem();
  }
}
