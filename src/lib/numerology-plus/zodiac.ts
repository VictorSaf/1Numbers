/**
 * numerology-plus / zodiac — semnul solar și animalul chinezesc, pe mai multe convenții.
 *
 * Multe aplicații de numerologie pun lângă cifre semnul solar și zodia chinezească,
 * fiecare pe o singură convenție. Două dezacorduri reale:
 *
 * - Semnul solar tropical (Occident, legat de echinocțiu) contra sideral (vedic,
 *   legat de stele). Diferă cu ~24 de zile (ayanamsa Lahiri). Granițele siderale
 *   de aici sunt APROXIMATIVE, pentru epoca actuală; variază cu o zi de la an la an.
 * - Animalul chinezesc după anul calendaristic (1 ianuarie, ce fac calculatoarele
 *   simple) contra anul solar (Lichun, ~4 februarie, ce folosește Ba Zi).
 *   Anul lunar (Anul Nou chinezesc, ian.–feb.) ar fi a treia convenție; cere un
 *   tabel de date și nu e inclus.
 */

import type { BirthDate } from "./core.js";

export const SIGNS = [
  "aries", "taurus", "gemini", "cancer", "leo", "virgo",
  "libra", "scorpio", "sagittarius", "capricorn", "aquarius", "pisces",
] as const;
export type Sign = (typeof SIGNS)[number];

/** Ziua (lună, zi) în care începe fiecare semn, în ordinea SIGNS. */
const TROPICAL_START: Array<[number, number]> = [
  [3, 21], [4, 20], [5, 21], [6, 21], [7, 23], [8, 23],
  [9, 23], [10, 23], [11, 22], [12, 22], [1, 20], [2, 19],
];
const SIDEREAL_START: Array<[number, number]> = [
  [4, 14], [5, 15], [6, 15], [7, 16], [8, 17], [9, 17],
  [10, 17], [11, 16], [12, 16], [1, 14], [2, 13], [3, 14],
];

function signFrom(starts: Array<[number, number]>, b: BirthDate): Sign {
  const key = b.month * 100 + b.day;
  // Semnul e ultimul al cărui început e ≤ data; dacă niciunul, e cel care a
  // început în decembrie anul trecut.
  let best = -1, bestKey = -1;
  starts.forEach(([m, d], i) => {
    const k = m * 100 + d;
    if (k <= key && k > bestKey) { best = i; bestKey = k; }
  });
  if (best === -1) {
    starts.forEach(([m, d], i) => {
      const k = m * 100 + d;
      if (k > bestKey) { best = i; bestKey = k; }
    });
  }
  return SIGNS[best];
}

export const tropicalSign = (b: BirthDate) => signFrom(TROPICAL_START, b);
export const siderealSign = (b: BirthDate) => signFrom(SIDEREAL_START, b);

export const ANIMALS = [
  "rat", "ox", "tiger", "rabbit", "dragon", "snake",
  "horse", "goat", "monkey", "rooster", "dog", "pig",
] as const;
export type Animal = (typeof ANIMALS)[number];

const animalOf = (year: number): Animal => ANIMALS[(((year - 4) % 12) + 12) % 12];

export const chineseAnimalCalendar = (b: BirthDate) => animalOf(b.year);
export const chineseAnimalSolar = (b: BirthDate) =>
  animalOf(b.month === 1 || (b.month === 2 && b.day < 4) ? b.year - 1 : b.year);

export const SIGN_NAMES: Record<"ro" | "en" | "ru", Record<Sign, string>> = {
  ro: { aries: "Berbec", taurus: "Taur", gemini: "Gemeni", cancer: "Rac", leo: "Leu", virgo: "Fecioară", libra: "Balanță", scorpio: "Scorpion", sagittarius: "Săgetător", capricorn: "Capricorn", aquarius: "Vărsător", pisces: "Pești" },
  en: { aries: "Aries", taurus: "Taurus", gemini: "Gemini", cancer: "Cancer", leo: "Leo", virgo: "Virgo", libra: "Libra", scorpio: "Scorpio", sagittarius: "Sagittarius", capricorn: "Capricorn", aquarius: "Aquarius", pisces: "Pisces" },
  ru: { aries: "Овен", taurus: "Телец", gemini: "Близнецы", cancer: "Рак", leo: "Лев", virgo: "Дева", libra: "Весы", scorpio: "Скорпион", sagittarius: "Стрелец", capricorn: "Козерог", aquarius: "Водолей", pisces: "Рыбы" },
};

export const ANIMAL_NAMES: Record<"ro" | "en" | "ru", Record<Animal, string>> = {
  ro: { rat: "Șobolan", ox: "Bivol", tiger: "Tigru", rabbit: "Iepure", dragon: "Dragon", snake: "Șarpe", horse: "Cal", goat: "Capră", monkey: "Maimuță", rooster: "Cocoș", dog: "Câine", pig: "Mistreț" },
  en: { rat: "Rat", ox: "Ox", tiger: "Tiger", rabbit: "Rabbit", dragon: "Dragon", snake: "Snake", horse: "Horse", goat: "Goat", monkey: "Monkey", rooster: "Rooster", dog: "Dog", pig: "Pig" },
  ru: { rat: "Крыса", ox: "Бык", tiger: "Тигр", rabbit: "Кролик", dragon: "Дракон", snake: "Змея", horse: "Лошадь", goat: "Коза", monkey: "Обезьяна", rooster: "Петух", dog: "Собака", pig: "Свинья" },
};
