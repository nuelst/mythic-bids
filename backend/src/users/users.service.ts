import { Injectable } from '@nestjs/common';
import { Prisma } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { PublicUser, publicUserSelect } from './user.select.js';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  /** Every user gets a wallet: bidders deposit into it, auctioneers receive payouts. */
  create(data: Prisma.UserCreateInput): Promise<PublicUser> {
    return this.prisma.user.create({
      data: { ...data, wallet: { create: {} } },
      select: publicUserSelect,
    });
  }

  findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  findById(id: string): Promise<PublicUser> {
    return this.prisma.user.findUniqueOrThrow({
      where: { id },
      select: publicUserSelect,
    });
  }
}
