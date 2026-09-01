/**
 * Cât de departe se poate citi o zi.
 *
 * Nouăzeci de zile în fiecare direcție. În față, pentru că atât oferă
 * referința din piață. În spate, pentru că `/jurnal` există și cine scrie
 * despre o zi trăită are nevoie de numerele ei. Simetric, pentru că nu există
 * niciun argument care să facă o direcție mai lungă decât cealaltă.
 *
 * Marginea e reală, nu decorativă: butonul de navigare se dezactivează la
 * capăt și un `?zi=` venit din afară se încadrează, în loc să fie crezut.
 *
 * Toate comparațiile se fac pe zi calendaristică. `today` vine din `new Date()`
 * și poartă ora curentă; fără normalizare, o zi la exact +90 ar cădea înăuntru
 * dimineața și în afară seara.
 */

export const DAY_HORIZON_DAYS = 90;

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** Miezul nopții local al zilei din care face parte data primită. */
const startOfDay = (date: Date): Date =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

/** O dată nouă, mutată cu `delta` zile. Data primită rămâne neatinsă. */
export const shiftDay = (date: Date, delta: number): Date =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate() + delta);

/** Câte zile calendaristice sunt de la `today` până la `date`, cu semn. */
const daysBetween = (date: Date, today: Date): number =>
  Math.round((startOfDay(date).getTime() - startOfDay(today).getTime()) / MS_PER_DAY);

export const isWithinHorizon = (date: Date, today: Date): boolean =>
  Math.abs(daysBetween(date, today)) <= DAY_HORIZON_DAYS;

export const clampToHorizon = (date: Date, today: Date): Date => {
  const delta = daysBetween(date, today);
  if (delta > DAY_HORIZON_DAYS) return shiftDay(today, DAY_HORIZON_DAYS);
  if (delta < -DAY_HORIZON_DAYS) return shiftDay(today, -DAY_HORIZON_DAYS);
  return startOfDay(date);
};
