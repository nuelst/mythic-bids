import { IsEnum, IsString, Length } from 'class-validator';
import { Role } from '../../generated/prisma/enums.js';
import { LoginDto } from './login.dto.js';

export class RegisterDto extends LoginDto {
  @IsString()
  @Length(2, 80)
  name: string;

  @IsEnum(Role)
  role: Role;
}
