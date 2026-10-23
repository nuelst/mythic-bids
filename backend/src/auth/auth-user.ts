import { Role } from '../generated/prisma/enums.js';

export interface AuthUser {
  id: string;
  role: Role;
}

export interface JwtPayload {
  sub: string;
  role: Role;
}
