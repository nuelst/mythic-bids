import { Injectable } from '@nestjs/common';
import { Prisma } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { PublicUser, publicUserSelect } from './user.select.js';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  create(data: Prisma.UserCreateInput): Promise<PublicUser> {
    return this.prisma.user.create({ data, select: publicUserSelect });
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
