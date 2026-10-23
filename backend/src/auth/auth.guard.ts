import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';
import type { AuthUser, JwtPayload } from './auth-user.js';
import { IS_PUBLIC_KEY } from './decorators/public.decorator.js';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwt: JwtService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    const request = context
      .switchToHttp()
      .getRequest<Request & { user?: AuthUser }>();

    // Public routes still resolve the user when a valid token is sent (e.g. the lot room).
    const user = await this.authenticate(request);
    if (user) request.user = user;

    if (isPublic || user) return true;
    throw new UnauthorizedException();
  }

  private async authenticate(request: Request): Promise<AuthUser | null> {
    const token = this.extractToken(request);
    if (!token) return null;

    try {
      const payload = await this.jwt.verifyAsync<JwtPayload>(token);
      return { id: payload.sub, role: payload.role };
    } catch {
      return null;
    }
  }

  // EventSource cannot send headers, so SSE clients pass the token as ?token=.
  private extractToken(request: Request): string | undefined {
    const [type, token] = request.header('authorization')?.split(' ') ?? [];
    if (type === 'Bearer' && token) return token;

    const query = request.query.token;
    return typeof query === 'string' ? query : undefined;
  }
}
