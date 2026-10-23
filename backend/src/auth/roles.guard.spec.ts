import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '../generated/prisma/enums.js';
import { RolesGuard } from './roles.guard.js';

function contextFor(user?: { id: string; role: Role }) {
  return {
    getHandler: () => undefined,
    getClass: () => undefined,
    switchToHttp: () => ({ getRequest: () => ({ user }) }),
  } as unknown as ExecutionContext;
}

describe('RolesGuard', () => {
  const reflector = new Reflector();
  const guard = new RolesGuard(reflector);
  const bidder = { id: '1', role: Role.BIDDER };

  it('allows routes without @Roles', () => {
    vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);
    expect(guard.canActivate(contextFor(bidder))).toBe(true);
  });

  it('allows a user with a required role', () => {
    vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Role.BIDDER]);
    expect(guard.canActivate(contextFor(bidder))).toBe(true);
  });

  it('rejects a user without the required role', () => {
    vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Role.AUCTIONEER]);
    expect(guard.canActivate(contextFor(bidder))).toBe(false);
  });

  it('rejects anonymous requests on role-protected routes', () => {
    vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Role.BIDDER]);
    expect(guard.canActivate(contextFor())).toBe(false);
  });
});
