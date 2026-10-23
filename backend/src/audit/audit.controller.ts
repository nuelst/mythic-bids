import { Controller, Get, Header, Param, ParseUUIDPipe } from '@nestjs/common';
import { Public } from '../auth/decorators/public.decorator.js';
import { AuditService } from './audit.service.js';

@Public()
@Controller('audit')
export class AuditController {
  constructor(private readonly audit: AuditService) {}

  /** Recomputes hashes and signatures of the whole bid history; no login required. */
  @Get('lots/:id')
  verify(@Param('id', ParseUUIDPipe) id: string) {
    return this.audit.verifyLot(id);
  }

  /** Ed25519 public key (PEM) to check the signatures independently. */
  @Get('public-key')
  @Header('Content-Type', 'text/plain')
  publicKey() {
    return this.audit.publicKeyPem();
  }
}
