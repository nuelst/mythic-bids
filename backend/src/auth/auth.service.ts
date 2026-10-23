import { HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AppException } from '../common/errors/app.exception.js';
import { ErrorCode } from '../common/errors/error-code.enum.js';
import { PublicUser } from '../users/user.select.js';
import { UsersService } from '../users/users.service.js';
import type { JwtPayload } from './auth-user.js';
import { LoginDto } from './dto/login.dto.js';
import { RegisterDto } from './dto/register.dto.js';

const SALT_ROUNDS = 10;

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UsersService,
    private readonly jwt: JwtService,
  ) {}

  async register({ password, ...data }: RegisterDto) {
    if (await this.users.findByEmail(data.email)) {
      throw new AppException(
        ErrorCode.EMAIL_TAKEN,
        HttpStatus.CONFLICT,
        'Email is already registered',
      );
    }
    const user = await this.users.create({
      ...data,
      passwordHash: await bcrypt.hash(password, SALT_ROUNDS),
    });
    return this.session(user);
  }

  async login({ email, password }: LoginDto) {
    const user = await this.users.findByEmail(email);
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      throw new AppException(
        ErrorCode.INVALID_CREDENTIALS,
        HttpStatus.UNAUTHORIZED,
        'Invalid email or password',
      );
    }
    const { passwordHash: _, ...publicUser } = user;
    return this.session(publicUser);
  }

  private async session(user: PublicUser) {
    const payload: JwtPayload = { sub: user.id, role: user.role };
    return { accessToken: await this.jwt.signAsync(payload), user };
  }
}
