import { Transform } from 'class-transformer';

// Non-strings pass through untouched so the validators reject them with a 400 instead of a 500.
const mapString = (fn: (value: string) => string) =>
  Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? fn(value) : value,
  );

export const Trim = () => mapString((value) => value.trim());

export const NormalizeEmail = () =>
  mapString((value) => value.trim().toLowerCase());
