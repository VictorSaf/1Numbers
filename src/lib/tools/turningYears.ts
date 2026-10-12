/**
 * tools / turningYears — anii de cotitură, după fiecare metodă care îi numește.
 *
 * - Pitagoreic, pinacolele: trecerile de la un pinacol la altul. Primul se
 *   încheie la 36 − Drumul Vieții, apoi la fiecare 9 ani (horoscopes.rambler.ru
 *   — 44347849). Anul de cotitură = anul în care împlinești vârsta de început
 *   a pinacolului următor.
 * - Pitagoreic, ciclul de nouă ani: anii personali 1 (început) și 9 (încheiere).
 * - „Год-донор" (limon.postimees.ee/4232233): ultima cifră a anului + cifrele
 *   zilei și lunii se adună la an; se repetă de la anul obținut. Excepție: dacă
 *   cifrele zilei și lunii dau sub 6, intervalul se calculează o dată (cu ultima
 *   cifră a anului NAȘTERII) și se adaugă mereu același.
 * - Produsul (tvrus.eu, „коды жизни"): ZZLL (fără zeroul din fața zilei) ×
 *   AAAA; cifra k a produsului + 10·k dă o vârstă; după ultima cifră se reia de
 *   la prima, cu +80, +90… Articolul greșește înmulțirea din propriul exemplu
 *   (1508 × 2001 = 3 017 508, nu 3 016 508); noi înmulțim corect.
 * - Matricea Destinului: schimbarea decadei (lifePeriods) — la fiecare 10 ani.
 *
 * Ce nu inventăm: nicio metodă nu e „cea rusească" în exclusivitate; am găsit
 * cel puțin cinci, cu formule diferite. Le dăm pe cele două cu formulă și
 * exemplu publicat.
 */

import { type BirthDate, digitSum } from "@/lib/numerology-plus/core";
import { lifePath, personalYear, pinnacles } from "@/lib/numerology-plus/pythagorean";
import { lifePeriods } from "@/lib/numerology-plus/matrix";

export type TurningMethodId = "pinnacles" | "py1" | "py9" | "year-donor" | "product" | "matrix";

export interface TurningMethod {
  id: TurningMethodId;
  years: number[];
  steps: string[];
}

export interface TurningYears {
  methods: TurningMethod[];
  /** Anii pe care îi numesc cel puțin două metode. */
  coincidences: Array<{ year: number; methods: TurningMethodId[] }>;
}

const lastDigit = (y: number) => y % 10;

export function yearDonorYears(b: BirthDate, untilYear: number): number[] {
  const dm = digitSum(b.day) + digitSum(b.month);
  const out: number[] = [];
  if (dm < 6) {
    const step = dm + lastDigit(b.year);
    for (let y = b.year + step; y <= untilYear; y += step) out.push(y);
    return out;
  }
  for (let y = b.year + lastDigit(b.year) + dm; y <= untilYear; y = y + lastDigit(y) + dm) out.push(y);
  return out;
}

export function productAges(b: BirthDate, maxAge: number) {
  const base = Number(`${b.day}${String(b.month).padStart(2, "0")}`);
  const product = base * b.year;
  const digits = String(product).split("").map(Number);
  const ages: number[] = [];
  for (let k = 0; 10 * (k + 1) <= maxAge; k++) {
    const age = digits[k % digits.length] + 10 * (k + 1);
    if (age <= maxAge) ages.push(age);
  }
  return { base, product, digits, ages };
}

export function turningYears(b: BirthDate, maxAge = 90): TurningYears {
  const until = b.year + maxAge;
  const lp = lifePath(b);
  const pins = pinnacles(b, lp).slice(1);

  const pyYears = (n: number) => {
    const out: number[] = [];
    for (let y = b.year + 1; y <= until; y++) if (personalYear(b, y).value === n) out.push(y);
    return out;
  };

  const prod = productAges(b, maxAge);
  const donorDm = digitSum(b.day) + digitSum(b.month);
  const periods = lifePeriods(b).filter((p) => p.fromAge > 0);

  const methods: TurningMethod[] = [
    {
      id: "pinnacles",
      years: pins.map((p) => b.year + p.fromAge),
      steps: [`36 − ${lp.value} = ${36 - lp.value}`, ...pins.map((p) => `${p.fromAge} → ${b.year + p.fromAge}`)],
    },
    { id: "py1", years: pyYears(1), steps: [] },
    { id: "py9", years: pyYears(9), steps: [] },
    {
      id: "year-donor",
      years: yearDonorYears(b, until),
      steps: [
        donorDm < 6
          ? `${donorDm} < 6 → ${donorDm} + ${lastDigit(b.year)} = ${donorDm + lastDigit(b.year)}`
          : `${b.year} + ${lastDigit(b.year)} + ${donorDm} = ${b.year + lastDigit(b.year) + donorDm}`,
      ],
    },
    {
      id: "product",
      years: prod.ages.map((a) => b.year + a),
      steps: [`${prod.base} × ${b.year} = ${prod.product}`, prod.ages.join(", ")],
    },
    {
      id: "matrix",
      years: periods.map((p) => b.year + p.fromAge),
      steps: periods.map((p) => `${p.fromAge}: ${p.from}–${p.to} = ${p.arcana}`),
    },
  ];

  const byYear = new Map<number, TurningMethodId[]>();
  for (const m of methods) for (const y of m.years) byYear.set(y, [...(byYear.get(y) ?? []), m.id]);
  const coincidences = [...byYear.entries()]
    .filter(([, ms]) => ms.length >= 2)
    .sort(([a], [b2]) => a - b2)
    .map(([year, ms]) => ({ year, methods: ms }));

  return { methods, coincidences };
}
