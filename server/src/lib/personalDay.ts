/**
 * Ziua personală, pe server.
 *
 * Oglinda lui src/lib/numerology-plus/pythagorean.ts (personalYear/Month/Day)
 * și a lui core.ts (digitSum/reduce). Nu e un import fiindcă nu poate fi:
 * server/tsconfig.json are rootDir "src" și refuză orice fișier din afara lui.
 *
 * Masterii NU se păstrează -- exact ca în motor, unde cele trei funcții
 * cheamă result(..., false). Rezultatul e mereu în 1..9.
 *
 * Dacă modifici ceva aici, testul cu tabel fix din
 * server/src/__tests__/personalDay.test.ts e ce te oprește să diverjezi.
 */

export interface CalendarParts {
  year: number;
  month: number;
  day: number;
}

function digitSum(n: number): number {
  return Math.abs(n)
    .toString()
    .split('')
    .reduce((sum, digit) => sum + Number(digit), 0);
}

function reduceToDigit(n: number): number {
  let x = Math.abs(n);
  while (x > 9) x = digitSum(x);
  return x;
}

/**
 * Un YYYY-MM-DD e o dată de calendar, nu un instant. db.ts dezactivează deja
 * parserul de DATE al lui node-postgres tocmai ca să ajungă aici ca șir; a-l
 * trece printr-un Date ar reintroduce fusul orar în ceva ce nu are unul.
 */
export function parseCalendarDate(iso: string): CalendarParts {
  const [year, month, day] = iso.slice(0, 10).split('-').map(Number);
  return { year, month, day };
}

export function personalDayNumber(birth: CalendarParts, on: CalendarParts): number {
  const personalYear = reduceToDigit(
    reduceToDigit(birth.month) + reduceToDigit(birth.day) + reduceToDigit(digitSum(on.year)),
  );
  const personalMonth = reduceToDigit(personalYear + on.month);
  return reduceToDigit(personalMonth + on.day);
}
