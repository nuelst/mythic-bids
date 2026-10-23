import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiErrors } from '../common/errors/api-errors.decorator.js';
import { ErrorCode } from '../common/errors/error-code.enum.js';
import { AuthService } from './auth.service.js';
import { Public } from './decorators/public.decorator.js';
import { AuthSessionDto } from './dto/auth-session.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { RegisterDto } from './dto/register.dto.js';

@Public()
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  /** Creates an auctioneer or bidder account and signs in. */
  @Post('register')
  @ApiErrors({ 400: true, 409: [ErrorCode.EMAIL_TAKEN] })
  register(@Body() dto: RegisterDto): Promise<AuthSessionDto> {
    return this.auth.register(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiErrors({ 400: true, 401: [ErrorCode.INVALID_CREDENTIALS] })
  login(@Body() dto: LoginDto): Promise<AuthSessionDto> {
    return this.auth.login(dto);
  }
}
