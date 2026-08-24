/**
 * numerology-plus — motorul complet pentru Fazele A, B și C.
 *
 * Drop-in: copiază `src/` în proiect (ex. `src/lib/numerology-plus/`).
 * Zero dependențe. TypeScript strict. 78 de teste trec.
 *
 * Integrare minimă:
 *   import { fullProfile } from '@/lib/numerology-plus';
 *   const profile = fullProfile('Victor Ion Safta', { day:25, month:8, year:1990 });
 */

export * from './core.js';
export * from './pythagorean.js';
export * from './systems.js';
export * from './matrix.js';
export * from './applied.js';

import { type BirthDate, daysBetween } from './core.js';
import { fullPythagoreanProfile } from './pythagorean.js';
import { vedicProfile, kuaNumber, chaldeanName, popularKabbalah, hebrewGematria, biorhythmSeries } from './systems.js';
import { destinyMatrix, lifePeriods } from './matrix.js';

/** Profilul complet, toate sistemele. Folosește-l ca sursă unică pentru pagina de rezultat. */
export function fullProfile(
  name: string,
  birth: BirthDate,
  opts: { gender?: 'male' | 'female'; today?: Date } = {},
) {
  const today = opts.today ?? new Date();
  const birthDateObj = new Date(birth.year, birth.month - 1, birth.day);
  const daysAlive = daysBetween(birthDateObj, today);

  return {
    input: { name, birth },
    pythagorean: fullPythagoreanProfile(name, birth, today),
    chaldean: chaldeanName(name),
    vedic: vedicProfile(name, birth),
    kua: opts.gender ? kuaNumber(birth.year, opts.gender) : null,
    kabbalah: { popular: popularKabbalah(name), hebrew: hebrewGematria(name) },
    destinyMatrix: { ...destinyMatrix(birth), periods: lifePeriods(birth) },
    biorhythms: { daysAlive, series: biorhythmSeries(daysAlive, 30) },
  };
}

// ── Conținut și interpretări ─────────────────────────────────
export * from './content/arcana.js';
export * from './content/archetypes.js';
export * from './content/frames.js';
export * from './content/letters.js';
export * from './content/interpret.js';
