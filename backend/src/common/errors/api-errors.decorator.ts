import { applyDecorators } from '@nestjs/common';
import { ApiProperty, ApiResponse } from '@nestjs/swagger';
import { ErrorCode } from './error-code.enum.js';

export class ErrorResponseDto {
  statusCode: number;

  @ApiProperty({ enum: ErrorCode, enumName: 'ErrorCode', required: false })
  code?: ErrorCode;

  /** A message, or the list of validation messages for 400 responses. */
  @ApiProperty({
    oneOf: [{ type: 'string' }, { type: 'array', items: { type: 'string' } }],
  })
  message: string | string[];

  /** Present on BELOW_MINIMUM: the lowest bid currently accepted. */
  @ApiProperty({ type: 'integer', required: false })
  minimumCents?: number;
}

const DESCRIPTIONS: Record<number, string> = {
  400: 'Invalid request',
  401: 'Missing or invalid token',
  403: 'Not allowed for this role',
  404: 'Not found',
  409: 'Conflict',
  422: 'Business rule rejected the request',
};

/** Documents error responses: `@ApiErrors({ 422: [ErrorCode.BELOW_MINIMUM] })`. */
export const ApiErrors = (errors: Record<number, ErrorCode[] | true>) =>
  applyDecorators(
    ...Object.entries(errors).map(([status, codes]) =>
      ApiResponse({
        status: Number(status),
        type: ErrorResponseDto,
        description:
          codes === true
            ? DESCRIPTIONS[Number(status)]
            : `${DESCRIPTIONS[Number(status)]}: ${codes.join(', ')}`,
      }),
    ),
  );
