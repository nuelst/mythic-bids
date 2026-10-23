import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { AuthUser } from '../auth-user.js';

export const CurrentUser = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): AuthUser | undefined =>
    ctx.switchToHttp().getRequest<{ user?: AuthUser }>().user,
);
