import { describe, it, expect } from 'vitest';
import { getTranslation } from '../translations';

/**
 * The three languages have to carry the same keys.
 *
 * `export.*` and `sharing.*` existed in EN and RU and not in RO -- twenty-three
 * keys missing from the app's own default language. Nothing read them yet, so
 * the gap was dead in the direction that hides it: a key added for one language
 * and forgotten in another shows up as `undefined` on screen the day someone
 * wires it in.
 */

const LANGS = ['ro', 'en', 'ru'] as const;

/** Every leaf path in the translation object, as dotted keys. */
function keyPaths(value: unknown, prefix = ''): string[] {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return [prefix];
  return Object.entries(value as Record<string, unknown>)
    .flatMap(([k, v]) => keyPaths(v, prefix ? `${prefix}.${k}` : k));
}

describe('translations', () => {
  const sets = Object.fromEntries(
    LANGS.map((lang) => [lang, new Set(keyPaths(getTranslation(lang)))]),
  ) as Record<(typeof LANGS)[number], Set<string>>;

  it.each(LANGS)('%s has every key the other two have', (lang) => {
    const others = LANGS.filter((l) => l !== lang);
    const missing = others.flatMap((other) =>
      [...sets[other]].filter((key) => !sets[lang].has(key)).map((key) => `${key} (in ${other})`),
    );
    expect([...new Set(missing)].sort()).toEqual([]);
  });

  it.each(LANGS)('%s leaves no value empty', (lang) => {
    const t = getTranslation(lang) as unknown as Record<string, unknown>;
    const empty: string[] = [];
    const walk = (value: unknown, path: string) => {
      if (typeof value === 'string') {
        if (!value.trim()) empty.push(path);
        return;
      }
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        for (const [k, v] of Object.entries(value)) walk(v, path ? `${path}.${k}` : k);
      }
    };
    walk(t, '');
    expect(empty).toEqual([]);
  });
});
