import { ApiProperty } from '@nestjs/swagger';
import { Role } from '../../generated/prisma/enums.js';

export class PublicUserDto {
  id: string;
  name: string;
  email: string;

  @ApiProperty({ enum: Role, enumName: 'Role' })
  role: Role;

  createdAt: Date;
}
