import { PublicUserDto } from '../../users/dto/public-user.dto.js';

export class AuthSessionDto {
  /** JWT to send as `Authorization: Bearer <token>` (or `?token=` on SSE). */
  accessToken: string;
  user: PublicUserDto;
}
