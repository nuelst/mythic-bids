import { plainToInstance } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsString,
  IsUrl,
  validateSync,
} from 'class-validator';

export class Env {
  @IsInt()
  PORT: number = 3000;

  @IsString()
  @IsNotEmpty()
  DATABASE_URL: string;

  @IsUrl({ require_tld: false })
  PUBLIC_URL: string;

  @IsString()
  CORS_ORIGIN: string;

  @IsString()
  @IsNotEmpty()
  JWT_SECRET: string;

  @IsInt()
  JWT_TTL_SECONDS: number = 86400;

  @IsString()
  @IsNotEmpty()
  ALIAS_SECRET: string;

  @IsString()
  @IsNotEmpty()
  AUDIT_PRIVATE_KEY: string;

  @IsUrl()
  SCRYFALL_URL = 'https://api.scryfall.com';
}

export function validateEnv(config: Record<string, unknown>): Env {
  const env = plainToInstance(Env, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(env, { skipMissingProperties: false });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }
  return env;
}
