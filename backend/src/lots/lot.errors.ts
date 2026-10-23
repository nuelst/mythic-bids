import { HttpStatus } from '@nestjs/common';
import { AppException } from '../common/errors/app.exception.js';
import { ErrorCode } from '../common/errors/error-code.enum.js';

export const lotNotFound = () =>
  new AppException(
    ErrorCode.LOT_NOT_FOUND,
    HttpStatus.NOT_FOUND,
    'Lot not found',
  );
