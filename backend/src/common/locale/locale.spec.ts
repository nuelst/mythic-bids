import { resolveLocale } from './locale.js';

describe('resolveLocale', () => {
  it.each([
    ['pt-BR,pt;q=0.9,en;q=0.8', 'pt'],
    ['pt', 'pt'],
    ['en-US', 'en'],
    ['fr-FR', 'en'],
    [undefined, 'en'],
    ['', 'en'],
  ])('%s -> %s', (input, expected) => {
    expect(resolveLocale(input)).toBe(expected);
  });
});
