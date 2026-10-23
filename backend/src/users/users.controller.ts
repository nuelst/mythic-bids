import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import type { AuthUser } from '../auth/auth-user.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { ApiErrors } from '../common/errors/api-errors.decorator.js';
import { PublicUserDto } from './dto/public-user.dto.js';
import { UsersService } from './users.service.js';

@ApiBearerAuth()
@ApiErrors({ 401: true })
@Controller('me')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get()
  me(@CurrentUser() user: AuthUser): Promise<PublicUserDto> {
    return this.users.findById(user.id);
  }
}
