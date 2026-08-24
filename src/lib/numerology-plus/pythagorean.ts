/**
 * numerology-plus / pythagorean
 * Faza A completă: cele 14 numere care ne lipseau + Planurile de Expresie,
 * Ciclurile de Viață și sistemul Esență/Tranzite (Decoz „Dualities").
 */

import {
  PYTHAGOREAN, type BirthDate, type NumResult, type LetterTable,
  classifyFullName, letters, letterFrequency, nameParts, digitSum,
  reduce, result, sumLetters, KARMIC_DEBTS,
} from './core.js';

// ── Numere de bază (re-expuse cu `raw`) ─────────────────────

/** Life Path — metoda segmentată (lună, zi, an reduse separat, apoi însumate).
 *  Aceasta e convenția occidentală standard; varianta vedică (sumă plată) e în vedic.ts. */
export function lifePath(b: BirthDate): NumResult {
  const m = reduce(b.month), d = reduce(b.day), y = reduce(digitSum(b.year));
  return result(m + d + y);
}

export function expression(name: string, table: LetterTable = PYTHAGOREAN): NumResult {
  return result(sumLetters(name, table));
}

export function soulUrge(name: string, table: LetterTable = PYTHAGOREAN): NumResult {
  return result(sumLetters(name, table, (l) => l.vowel));
}

export function personality(name: string, table: LetterTable = PYTHAGOREAN): NumResult {
  return result(sumLetters(name, table, (l) => !l.vowel));
}

/** Numărul zilei de naștere. Se interpretează pe ziua BRUTĂ (1–31), nu doar redusă. */
export function birthday(b: BirthDate): NumResult & { dayOfMonth: number } {
  return { ...result(b.day), dayOfMonth: b.day };
}

// ── Numere noi ───────────────────────────────────────────────

/** A2.1 Attitude / Sun Number. Luna se ia BRUTĂ (nov = 11). Master NU se păstrează. */
export function attitude(b: BirthDate): NumResult {
  return result(b.month + b.day, false);
}

/** A2.2 Maturitate / Realizare. Life Path + Expression la valoare plină. */
export function maturity(lp: NumResult, exp: NumResult): NumResult {
  return result(lp.value + exp.value);
}

/** A2.3 Echilibru. Inițialele celor trei nume. Master NU se păstrează (explicit la Decoz). */
export function balance(name: string, table: LetterTable = PYTHAGOREAN): NumResult {
  const initials = nameParts(name).map((p) => p[0]).filter(Boolean);
  return result(initials.reduce((a, c) => a + (table[c] ?? 0), 0), false);
}

/** A2.4 Pasiune Ascunsă — cifra cea mai frecventă din nume.
 *  La egalitate, parcurge numerele de bază în ordine fixă și alege prima potrivire. */
export function hiddenPassion(
  name: string,
  tiebreakOrder: number[] = [],
  table: LetterTable = PYTHAGOREAN,
): { value: number; frequency: number; tied: number[] } {
  const freq = letterFrequency(name, table);
  const max = Math.max(...Object.values(freq));
  const tied = Object.entries(freq).filter(([, c]) => c === max).map(([d]) => Number(d));
  if (tied.length === 1) return { value: tied[0], frequency: max, tied };
  const pick = tiebreakOrder.find((n) => tied.includes(n));
  return { value: pick ?? Math.min(...tied), frequency: max, tied };
}

/** A2.5 Tabel de Incluziune — frecvența completă a cifrelor 1–9. */
export function inclusionTable(name: string, table: LetterTable = PYTHAGOREAN): Record<number, number> {
  return letterFrequency(name, table);
}

/** Lecții Karmice — cifrele 1–9 care lipsesc complet din nume. */
export function karmicLessons(name: string, table: LetterTable = PYTHAGOREAN): number[] {
  const freq = letterFrequency(name, table);
  return Object.entries(freq).filter(([, c]) => c === 0).map(([d]) => Number(d));
}

/** A2.6 Subconștient = 9 − numărul de lecții karmice. */
export function subconsciousSelf(name: string, table: LetterTable = PYTHAGOREAN): number {
  return 9 - karmicLessons(name, table).length;
}

/** A2.7 Gândire Rațională = reduce(reduce(suma literelor prenumelui) + numărul zilei). */
export function rationalThought(name: string, b: BirthDate, table: LetterTable = PYTHAGOREAN): NumResult {
  const first = nameParts(name)[0] ?? '';
  const firstSum = reduce(sumLetters(first, table));
  return result(firstSum + b.day);
}

/** A2.8–A2.10 Litere de poziție. */
export function positionLetters(name: string, table: LetterTable = PYTHAGOREAN) {
  const parts = nameParts(name);
  const first = parts[0] ?? '';
  const last = parts[parts.length - 1] ?? '';
  const cornerstone = first[0] ?? null;
  const capstone = last[last.length - 1] ?? null;
  const firstVowel = classifyFullName(first).find((l) => l.vowel)?.ch ?? null;
  return {
    cornerstone: cornerstone ? { letter: cornerstone, value: table[cornerstone] ?? 0 } : null,
    capstone: capstone ? { letter: capstone, value: table[capstone] ?? 0 } : null,
    firstVowel: firstVowel ? { letter: firstVowel, value: table[firstVowel] ?? 0 } : null,
  };
}

/** A2.11–A2.12 Numere-Punte. Diferență absolută, master NU se păstrează. */
export function bridges(lp: NumResult, exp: NumResult, su: NumResult, pers: NumResult) {
  return {
    lifePathExpression: Math.abs(exp.value - lp.value),
    soulUrgePersonality: Math.abs(su.value - pers.value),
    soulUrgeExpression: Math.abs(su.value - exp.value),
  };
}

// ── Cicluri temporale ────────────────────────────────────────

/** Pinacle — 4 numere + intervale de vârstă dependente de Life Path. */
export function pinnacles(b: BirthDate, lp: NumResult) {
  const m = reduce(b.month), d = reduce(b.day), y = reduce(digitSum(b.year));
  const p1 = result(m + d), p2 = result(d + y);
  const p3 = result(p1.value + p2.value), p4 = result(m + y);
  const end1 = 36 - lp.value;
  return [
    { index: 1, ...p1, fromAge: 0,        toAge: end1 },
    { index: 2, ...p2, fromAge: end1 + 1, toAge: end1 + 9 },
    { index: 3, ...p3, fromAge: end1 + 10, toAge: end1 + 18 },
    { index: 4, ...p4, fromAge: end1 + 19, toAge: null as number | null },
  ];
}

/** Provocări — diferențe absolute. Master NU se păstrează. Interval 0–8. */
export function challenges(b: BirthDate, lp: NumResult) {
  const m = reduce(b.month, false), d = reduce(b.day, false), y = reduce(digitSum(b.year), false);
  const c1 = Math.abs(m - d), c2 = Math.abs(d - y);
  const c3 = Math.abs(c1 - c2), c4 = Math.abs(m - y);
  const end1 = 36 - lp.value;
  return [
    { index: 1, value: c1, fromAge: 0,         toAge: end1 },
    { index: 2, value: c2, fromAge: end1 + 1,  toAge: end1 + 9 },
    { index: 3, value: c3, fromAge: end1 + 10, toAge: end1 + 18, main: true },
    { index: 4, value: c4, fromAge: end1 + 19, toAge: null as number | null },
  ];
}

/** A4 Cicluri de Viață. Formative păstrează doar 11 (22 imposibil pentru lună). */
export function lifeCycles(b: BirthDate, lp: NumResult) {
  const end1 = 36 - lp.value;
  return [
    { name: 'formative',  ...result(b.month),           fromAge: 0,        toAge: end1 },
    { name: 'productive', ...result(b.day),             fromAge: end1 + 1, toAge: end1 + 27 },
    { name: 'harvest',    ...result(digitSum(b.year)),  fromAge: end1 + 28, toAge: null as number | null },
  ];
}

/** An / Lună / Zi personală. Master NU se păstrează. */
export function personalYear(b: BirthDate, year: number): NumResult {
  return result(reduce(b.month, false) + reduce(b.day, false) + reduce(digitSum(year), false), false);
}
export function personalMonth(py: NumResult, month: number): NumResult {
  return result(py.value + month, false);
}
export function personalDay(pm: NumResult, day: number): NumResult {
  return result(pm.value + day, false);
}

/** A2.13 An / Lună / Zi universală — fără date personale. */
export function universalYear(year: number): NumResult { return result(digitSum(year), false); }
export function universalMonth(year: number, month: number): NumResult {
  return result(universalYear(year).value + month, false);
}
export function universalDay(year: number, month: number, day: number): NumResult {
  return result(universalMonth(year, month).value + day, false);
}

// ── A3 Planurile de Expresie ─────────────────────────────────

/**
 * ⚠ VALIDEAZĂ ÎNAINTE DE PRODUCȚIE.
 * Tabelul original Decoz e proprietar; acesta e reconstruit din charturi publicate.
 * Rulează `npm run validate:planes` cu 3–5 nume verificate pe worldnumerology.com.
 */
export const PLANE_OF_LETTER: Record<string, 'physical'|'mental'|'emotional'|'intuitive'> = {
  E:'physical', W:'physical', D:'physical', M:'physical',
  A:'mental', H:'mental', J:'mental', N:'mental', P:'mental', G:'mental', L:'mental',
  I:'emotional', O:'emotional', R:'emotional', S:'emotional', B:'emotional', T:'emotional', X:'emotional', Z:'emotional',
  K:'intuitive', F:'intuitive', Q:'intuitive', U:'intuitive', Y:'intuitive', C:'intuitive', V:'intuitive',
};

export const NATURE_OF_LETTER: Record<string, 'creative'|'vacillating'|'grounded'> = {
  A:'creative', I:'creative', J:'creative', Q:'creative', Y:'creative', C:'creative', G:'creative', L:'creative', S:'creative',
  B:'vacillating', K:'vacillating', R:'vacillating', H:'vacillating', N:'vacillating', T:'vacillating', F:'vacillating', P:'vacillating', W:'vacillating',
  E:'grounded', M:'grounded', O:'grounded', X:'grounded', D:'grounded', U:'grounded', V:'grounded', Z:'grounded',
};

export type PlaneKey = 'physical' | 'mental' | 'emotional' | 'intuitive';
export type NatureKey = 'creative' | 'vacillating' | 'grounded';

export function planesOfExpression(name: string, table: LetterTable = PYTHAGOREAN) {
  const planes: PlaneKey[] = ['physical', 'mental', 'emotional', 'intuitive'];
  const natures: NatureKey[] = ['creative', 'vacillating', 'grounded'];

  const grid: Record<PlaneKey, Record<NatureKey, { count: number; sum: number }>> = {} as never;
  for (const p of planes) {
    grid[p] = { creative: { count: 0, sum: 0 }, vacillating: { count: 0, sum: 0 }, grounded: { count: 0, sum: 0 } };
  }

  for (const ch of letters(name)) {
    const p = PLANE_OF_LETTER[ch], n = NATURE_OF_LETTER[ch];
    if (!p || !n) continue;
    grid[p][n].count++;
    grid[p][n].sum += table[ch] ?? 0;
  }

  const planeTotals = Object.fromEntries(
    planes.map((p) => {
      const sum = natures.reduce((a, n) => a + grid[p][n].sum, 0);
      const count = natures.reduce((a, n) => a + grid[p][n].count, 0);
      return [p, { count, sum, value: reduce(sum) }];
    }),
  ) as Record<PlaneKey, { count: number; sum: number; value: number }>;

  const natureTotals = Object.fromEntries(
    natures.map((n) => {
      const sum = planes.reduce((a, p) => a + grid[p][n].sum, 0);
      const count = planes.reduce((a, p) => a + grid[p][n].count, 0);
      return [n, { count, sum, value: reduce(sum) }];
    }),
  ) as Record<NatureKey, { count: number; sum: number; value: number }>;

  return { grid, planeTotals, natureTotals };
}

// ── A5 Tranzite + Esență (sistemul Decoz „Dualities") ────────

/** O literă e activă un număr de ani egal cu valoarea ei. Segmentul se reia ciclic. */
function transitAt(part: string, age: number, table: LetterTable): { letter: string; value: number; yearInLetter: number } | null {
  const chars = part.split('').filter((c) => table[c] !== undefined);
  if (!chars.length) return null;
  const cycle = chars.reduce((a, c) => a + (table[c] ?? 0), 0);
  if (cycle <= 0) return null;
  let t = age % cycle;
  for (const ch of chars) {
    const span = table[ch] ?? 0;
    if (t < span) return { letter: ch, value: span, yearInLetter: t + 1 };
    t -= span;
  }
  return null;
}

export function transits(name: string, age: number, table: LetterTable = PYTHAGOREAN) {
  const parts = nameParts(name);
  const first = parts[0] ?? '';
  const middle = parts.length > 2 ? parts.slice(1, -1).join('') : '';
  const last = parts.length > 1 ? parts[parts.length - 1] : '';
  return {
    physical:  transitAt(first, age, table),
    mental:    middle ? transitAt(middle, age, table) : null,
    spiritual: last ? transitAt(last, age, table) : null,
  };
}

/** Esența anuală = suma literelor de tranzit active, redusă. */
export function essence(name: string, age: number, table: LetterTable = PYTHAGOREAN): NumResult {
  const t = transits(name, age, table);
  const sum = (t.physical?.value ?? 0) + (t.mental?.value ?? 0) + (t.spiritual?.value ?? 0);
  return result(sum);
}

/** Timeline pe ani: tranzite + esență + an personal. `duality: true` = an de intensitate
 *  maximă în sistemul Decoz (Esența coincide cu Anul Personal). */
export function dualitiesTimeline(name: string, b: BirthDate, fromAge: number, toAge: number) {
  const rows = [];
  for (let age = fromAge; age <= toAge; age++) {
    const calendarYear = b.year + age;
    const t = transits(name, age);
    const e = essence(name, age);
    const py = personalYear(b, calendarYear);
    rows.push({
      age, calendarYear,
      physical: t.physical, mental: t.mental, spiritual: t.spiritual,
      essence: e.value, personalYear: py.value,
      duality: e.value === py.value,
    });
  }
  return rows;
}

// ── Datorii karmice pe toate pozițiile ───────────────────────

export function detectKarmicDebts(parts: Record<string, NumResult>): Array<{ source: string; debt: number; reduced: number }> {
  return Object.entries(parts)
    .filter(([, r]) => (KARMIC_DEBTS as readonly number[]).includes(r.raw))
    .map(([source, r]) => ({ source, debt: r.raw, reduced: r.value }));
}

// ── Profil complet ───────────────────────────────────────────

export function fullPythagoreanProfile(name: string, b: BirthDate, today = new Date()) {
  const lp = lifePath(b);
  const exp = expression(name);
  const su = soulUrge(name);
  const pers = personality(name);
  const bday = birthday(b);
  const py = personalYear(b, today.getFullYear());

  const tiebreak = [exp.value, su.value, pers.value, lp.value, bday.value];
  const age = today.getFullYear() - b.year -
    (today.getMonth() + 1 < b.month || (today.getMonth() + 1 === b.month && today.getDate() < b.day) ? 1 : 0);

  const pm = personalMonth(py, today.getMonth() + 1);

  return {
    core: { lifePath: lp, expression: exp, soulUrge: su, personality: pers, birthday: bday },
    extended: {
      attitude: attitude(b),
      maturity: maturity(lp, exp),
      balance: balance(name),
      hiddenPassion: hiddenPassion(name, tiebreak),
      subconsciousSelf: subconsciousSelf(name),
      rationalThought: rationalThought(name, b),
      ...positionLetters(name),
      bridges: bridges(lp, exp, su, pers),
      inclusionTable: inclusionTable(name),
      karmicLessons: karmicLessons(name),
    },
    cycles: {
      pinnacles: pinnacles(b, lp),
      challenges: challenges(b, lp),
      lifeCycles: lifeCycles(b, lp),
      personalYear: py,
      personalMonth: pm,
      personalDay: personalDay(pm, today.getDate()),
      universalYear: universalYear(today.getFullYear()),
      universalMonth: universalMonth(today.getFullYear(), today.getMonth() + 1),
      universalDay: universalDay(today.getFullYear(), today.getMonth() + 1, today.getDate()),
    },
    planes: planesOfExpression(name),
    transits: { age, current: transits(name, age), essence: essence(name, age) },
    karmicDebts: detectKarmicDebts({
      lifePath: lp, expression: exp, soulUrge: su, personality: pers, birthday: bday, personalYear: py,
    }),
  };
}
