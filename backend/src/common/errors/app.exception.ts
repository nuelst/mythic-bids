import { HttpException, HttpStatus } from '@nestjs/common';
import { ErrorCode } from './error-code.enum.js';

export class AppException extends HttpException {
  constructor(
    readonly code: ErrorCode,
    status: HttpStatus,
    message: string,
    details: Record<string, unknown> = {},
  ) {
    super({ statusCode: status, code, message, ...details }, status);
  }
}
