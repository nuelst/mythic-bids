import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';

export const LOCALES = ['en', 'pt'] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'en';

export const isLocale = (value: string): value is Locale =>
  (LOCALES as readonly string[]).includes(value);

export function resolveLocale(value?: string): Locale {
  const tag = value?.split(',')[0]?.trim().toLowerCase() ?? '';
  return LOCALES.find((locale) => tag.startsWith(locale)) ?? DEFAULT_LOCALE;
}

export const RequestLocale = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): Locale => {
    const request = ctx.switchToHttp().getRequest<Request>();
    const query = request.query.locale;
    return resolveLocale(
      typeof query === 'string' ? query : request.header('accept-language'),
    );
  },
);
