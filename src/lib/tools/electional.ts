/**
 * tools / electional — alegerea unei zile (nuntă, lansare, contract, mutare).
 *
 * Două convenții care pun aceeași întrebare — „e ziua asta a mea?" — și
 * răspund din locuri diferite:
 *
 * - Pitagoreic: Ziua Personală a fiecărei persoane (An + Lună + Zi personală)
 *   trebuie să cadă pe un număr potrivit scopului; Ziua Universală pe același
 *   număr e un bonus. Scor = 2 × persoanele potrivite + 1 dacă ZU se potrivește.
 * - Caldeean / Cheiro: o zi e „a ta" când ziua lunii se reduce la numărul zilei
 *   tale de naștere. Cheiro, „Cheiro's Book of Numbers": oamenii numărului 1
 *   să-și facă planurile importante „on the 1st, 10th, 19th, or 28th of any
 *   month" (dokumen.pub/cheiros-book-of-numbers.html). Scopul nu contează aici.
 *
 * Zilele de datorie karmică (13, 14, 16, 19 — ziua lunii, sau suma cifrelor
 * datei care trece printr-unul din ele) se marchează și nu intră în top.
 *
 * Numerele potrivite fiecărui scop sunt convenția aplicațiilor (6 și 2 pentru
 * nuntă etc.), nu o regulă cu o sursă unică.
 */

import { type BirthDate, KARMIC_DEBTS, digitSum } from "@/lib/numerology-plus/core";
import { personalDay, personalMonth, personalYear, universalDay } from "@/lib/numerology-plus/pythagorean";
import { mulank } from "@/lib/numerology-plus/systems";
import { root } from "./shared";

export type Purpose = "wedding" | "launch" | "contract" | "move" | "study" | "ending";

export const PURPOSE_NUMBERS: Record<Purpose, number[]> = {
  wedding: [2, 6],
  launch: [1, 8],
  contract: [4, 8],
  move: [3, 5],
  study: [7],
  ending: [9],
};

export interface DayReading {
  date: Date;
  universalDay: number;
  personalDays: number[];
  /** Datoriile karmice găsite în zi (ziua lunii sau suma cifrelor datei). */
  karmic: number[];
  pyth: { hits: number; score: number };
  cheiro: { hits: number; score: number };
}

export interface ElectionalResult {
  purpose: Purpose;
  numbers: number[];
  birthNumbers: number[];
  days: DayReading[];
  top: { pyth: DayReading[]; cheiro: DayReading[] };
  /** Zilele din ambele topuri, doar din unul, doar din celălalt. */
  agreement: { both: DayReading[]; pythOnly: DayReading[]; cheiroOnly: DayReading[] };
}

const TOP = 7;
const DEBTS = KARMIC_DEBTS as readonly number[];

function debtsIn(day: number, digitTotal: number): number[] {
  const out = new Set<number>();
  if (DEBTS.includes(day)) out.add(day);
  let x = digitTotal;
  while (x > 9) {
    if (DEBTS.includes(x)) out.add(x);
    x = digitSum(x);
  }
  return [...out];
}

export function electionalDates(opts: { from: Date; to: Date; people: BirthDate[]; purpose: Purpose }): ElectionalResult {
  const { people, purpose } = opts;
  const from = new Date(opts.from.getFullYear(), opts.from.getMonth(), opts.from.getDate());
  const to = new Date(opts.to.getFullYear(), opts.to.getMonth(), opts.to.getDate());
  const span = Math.round((to.getTime() - from.getTime()) / 86_400_000);
  if (span < 0 || span > 366) throw new RangeError("electionalDates: interval între 0 și 366 de zile");
  if (people.length === 0) throw new RangeError("electionalDates: cel puțin o persoană");

  const numbers = PURPOSE_NUMBERS[purpose];
  const birthNumbers = people.map(mulank);
  const days: DayReading[] = [];

  for (let d = new Date(from); d <= to; d = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1)) {
    const y = d.getFullYear(), m = d.getMonth() + 1, day = d.getDate();
    const ud = universalDay(y, m, day).value;
    const pds = people.map((b) => personalDay(personalMonth(personalYear(b, y), m), day).value);
    const digitTotal = digitSum(y) + digitSum(m) + digitSum(day);
    const pHits = pds.filter((p) => numbers.includes(p)).length;
    const cHits = birthNumbers.filter((n) => root(day) === n).length;
    days.push({
      date: new Date(d),
      universalDay: ud,
      personalDays: pds,
      karmic: debtsIn(day, digitTotal),
      pyth: { hits: pHits, score: 2 * pHits + (numbers.includes(ud) ? 1 : 0) },
      cheiro: { hits: cHits, score: cHits },
    });
  }

  const pick = (key: "pyth" | "cheiro") =>
    days
      .filter((x) => x.karmic.length === 0 && x[key].hits > 0)
      .sort((a, b) => b[key].score - a[key].score || a.date.getTime() - b.date.getTime())
      .slice(0, TOP);
  const top = { pyth: pick("pyth"), cheiro: pick("cheiro") };
  const inC = new Set(top.cheiro), inP = new Set(top.pyth);

  return {
    purpose,
    numbers,
    birthNumbers,
    days,
    top,
    agreement: {
      both: top.pyth.filter((x) => inC.has(x)),
      pythOnly: top.pyth.filter((x) => !inC.has(x)),
      cheiroOnly: top.cheiro.filter((x) => !inP.has(x)),
    },
  };
}
