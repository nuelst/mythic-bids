import { IsEmail, IsString, Length, MaxLength } from 'class-validator';
import { NormalizeEmail } from '../../common/validation/transforms.js';

export class LoginDto {
  @NormalizeEmail()
  @IsEmail()
  @MaxLength(254)
  email: string;

  /** 8 to 72 characters: bcrypt ignores anything after 72 bytes. */
  @IsString()
  @Length(8, 72)
  password: string;
}
