/**
 * models / elements — fiecare întrebare a hărții, pusă prin toate școlile.
 *
 * Unde literatura și aplicațiile se despart (ordinea reducerii, unde se păstrează
 * masterii, Y vocală sau nu, alfabetul pitagoreic sau caldeean, anul de la
 * 1 ianuarie sau de la aniversare, reducerea peste 22, regula de după 2000),
 * NU alegem o convenție în tăcere. Calculăm fiecare variantă, o arătăm cu
 * pașii ei și măsurăm distanța dintre ele. Diferența e informația.
 *
 * Regula de includere: un model intră doar dacă răspunde literal la aceeași
 * întrebare omenească. Ce e doar o coincidență aritmetică nu intră.
 */

import {
  CHALDEAN, PYTHAGOREAN, type BirthDate, type LetterTable, type YMode,
  digitSum, nameParts, reduce, result, sumLetters, toBirthDate, letters,
} from "@/lib/numerology-plus/core";
import {
  lifePath, expression, attitude, personalYear, essence, ageAt, balance,
  hiddenPassion, karmicLessons, birthday, soulUrge, personality, detectKarmicDebts,
  maturity, rationalThought,
} from "@/lib/numerology-plus/pythagorean";
import {
  bhagyank, mulank, naamank, popularKabbalah, hebrewGematria, kuaNumber,
  VEDIC_RELATIONS, NAVAGRAHA,
} from "@/lib/numerology-plus/systems";
import { destinyMatrix, lifePeriods } from "@/lib/numerology-plus/matrix";
import { psychomatrix } from "@/lib/numerology-plus/psychomatrix";
import { birthCards, yearCard } from "@/lib/numerology-plus/tarot";
import { tropicalSign, siderealSign, chineseAnimalCalendar, chineseAnimalSolar, SIGN_NAMES, ANIMAL_NAMES } from "@/lib/numerology-plus/zodiac";
import { generateLoShuGrid } from "@/lib/loShuGrid";
import { getCompatibleNumbers, getFavorableDays } from "@/lib/chaldean";
import {
  type ModelValue, type Scale, type Verdict, type Group, type PairDistance,
  groupsOf, pairwise, overallVerdict, spread, digitalRoot,
} from "./compare";

export type Lang = "ro" | "en" | "ru";
type T3 = Record<Lang, string>;

export interface ModelResult {
  id: string;
  /** Școala sau convenția. */
  school: string;
  /** Din ce și cum se calculează, într-o propoziție. */
  method: string;
  value: ModelValue;
  display: string;
  /** Calculul, pas cu pas — fiecare afirmație se poate urmări până la cifre. */
  steps: string[];
}

export interface Comparison {
  key: string;
  question: string;
  scale: Scale;
  models: ModelResult[];
  groups: Array<Group & { display: string; schools: string[] }>;
  pairs: PairDistance[];
  verdict: Verdict;
  spread: number;
  says: string;
}

export interface CompareOptions {
  lang?: Lang;
  today?: Date;
  /** Numele folosit azi, dacă diferă de cel din actul de naștere. */
  currentName?: string;
  gender?: "male" | "female";
}

// ─────────────────────────────────────────────────────────────
// Pași de calcul
// ─────────────────────────────────────────────────────────────

/** „49 → 13 → 4", oprit unde se oprește reduce(). */
export function chain(n: number, keepMasters = true): string {
  const out = [n];
  let x = n;
  while (x > 9) {
    if (keepMasters && (x === 11 || x === 22 || x === 33)) break;
    x = digitSum(x);
    out.push(x);
  }
  return out.join(" → ");
}

const plus = (xs: number[]) => xs.join(" + ");

function letterSteps(name: string, table: LetterTable, filter?: (l: { ch: string; vowel: boolean }) => boolean, yMode?: YMode): string[] {
  return nameParts(name).map((part) => {
    const all = letters(part);
    const kept = all
      .map((ch, i) => ({ ch, v: table[ch] ?? 0, vowel: isVowelAt(all, i, yMode) }))
      .filter((l) => !filter || filter(l));
    const total = kept.reduce((a, x) => a + x.v, 0);
    return `${part}: ${kept.map((x) => `${x.ch}${x.v}`).join(" ") || "—"} = ${total}`;
  });
}

const HARD = new Set(["A", "E", "I", "O", "U"]);
function isVowelAt(w: string[], i: number, yMode: YMode = "heuristic"): boolean {
  const ch = w[i];
  if (HARD.has(ch)) return true;
  if (ch !== "Y") return false;
  if (yMode === "always") return true;
  if (yMode === "never") return false;
  return !HARD.has(w[i + 1]);
}

// ─────────────────────────────────────────────────────────────
// Texte
// ─────────────────────────────────────────────────────────────

const Q: Record<string, T3> = {
  lifePath: { ro: "Ce direcție are viața ta?", en: "What direction does your life have?", ru: "Какое направление у вашей жизни?" },
  expression: { ro: "Ce ai de făcut cu ce ți s-a dat?", en: "What are you to do with what you were given?", ru: "Что делать с тем, что вам дано?" },
  soul: { ro: "Ce vrei pe dinăuntru?", en: "What do you want inside?", ru: "Чего вы хотите внутри?" },
  seen: { ro: "Cum te văd oamenii?", en: "How do people see you?", ru: "Каким вас видят люди?" },
  year: { ro: "Despre ce e anul ăsta?", en: "What is this year about?", ru: "О чём этот год?" },
  gift: { ro: "Ce ți s-a dat la naștere?", en: "What were you given at birth?", ru: "Что вам дано при рождении?" },
  missing: { ro: "Ce îți lipsește?", en: "What are you missing?", ru: "Чего вам не хватает?" },
  balance: { ro: "Cum îți revii sub presiune?", en: "How do you recover under pressure?", ru: "Как вы восстанавливаетесь под давлением?" },
  passion: { ro: "Ce talent te obsedează?", en: "Which talent obsesses you?", ru: "Какой талант вас захватывает?" },
  birthArchetype: { ro: "Ce arhetip te descrie?", en: "Which archetype describes you?", ru: "Какой архетип вас описывает?" },
  yearArchetype: { ro: "Ce arhetip are perioada pe care o trăiești?", en: "Which archetype rules the period you are in?", ru: "Какой архетип у нынешнего периода?" },
  firstStage: { ro: "Când se încheie prima etapă a vieții?", en: "When does the first stage of life end?", ru: "Когда заканчивается первый этап жизни?" },
  debts: { ro: "Ce datorii karmice porți?", en: "Which karmic debts do you carry?", ru: "Какие кармические долги вы несёте?" },
  luckyNumbers: { ro: "Ce numere îți sunt prielnice?", en: "Which numbers favour you?", ru: "Какие числа вам благоприятны?" },
  luckyDays: { ro: "În ce zile ai vânt din spate?", en: "On which days is the wind at your back?", ru: "В какие дни вам сопутствует удача?" },
  kua: { ro: "Ce număr Kua ai?", en: "What is your Kua number?", ru: "Какое у вас число Гуа?" },
  sunSign: { ro: "Sub ce semn te-ai născut?", en: "Under which sign were you born?", ru: "Под каким знаком вы родились?" },
  chineseAnimal: { ro: "Ce animal ești în zodiacul chinezesc?", en: "Which animal are you in the Chinese zodiac?", ru: "Какое вы животное по китайскому зодиаку?" },
  capstone: { ro: "Cum închei ce ai început?", en: "How do you finish what you start?", ru: "Как вы доводите начатое до конца?" },
  key: { ro: "Unde crești?", en: "Where do you grow?", ru: "Где вы растёте?" },
  intensity: { ro: "Ce trăsături ai peste medie?", en: "Which traits are above average?", ru: "Какие черты выше среднего?" },
};

const S = (ro: string, en: string, ru: string): T3 => ({ ro, en, ru });

const WEEKDAYS: Record<Lang, string[]> = {
  ro: ["duminică", "luni", "marți", "miercuri", "joi", "vineri", "sâmbătă"],
  en: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
  ru: ["воскресенье", "понедельник", "вторник", "среда", "четверг", "пятница", "суббота"],
};

const SAYS: Record<Lang, {
  agree: (n: number, v: string) => string;
  octave: (r: number, masters: string, rest: string) => string;
  split: (groups: string, d: number) => string;
  near: string;
  apart: string;
  years: (n: number) => string;
  none: string;
}> = {
  ro: {
    agree: (n, v) => `Toate cele ${n} căi dau ${v}. Aici școlile nu se despart — acordul e un rezultat, nu o lipsă de rezultat.`,
    octave: (r, m, rest) => `Aceeași rădăcină, ${r}. ${m} o citesc ca număr master; ${rest} rămân la ${r}. Nu e o distanță, e un registru: aceeași temă, cu mai multă tensiune.`,
    split: (g, d) => `Școlile se împart: ${g}. Distanța cea mai mare dintre ele: ${d}.`,
    near: "Aceeași temă, din unghiuri apropiate.",
    apart: "Răspunsuri care trag în direcții diferite. Niciunul nu e greșit în sistemul lui — diferența e chiar informația.",
    years: (n) => `${n} ani`,
    none: "nimic",
  },
  en: {
    agree: (n, v) => `All ${n} paths give ${v}. The schools do not part here — agreement is a result, not the absence of one.`,
    octave: (r, m, rest) => `The same root, ${r}. ${m} read it as a master number; ${rest} stay at ${r}. Not a distance but a register: the same theme, with more tension.`,
    split: (g, d) => `The schools split: ${g}. The widest distance between them: ${d}.`,
    near: "The same theme, from nearby angles.",
    apart: "Answers pulling in different directions. None is wrong in its own system — the difference is the information.",
    years: (n) => `${n} years`,
    none: "nothing",
  },
  ru: {
    agree: (n, v) => `Все ${n} пути дают ${v}. Здесь школы не расходятся — согласие тоже результат.`,
    octave: (r, m, rest) => `Один и тот же корень, ${r}. ${m} читают его как мастер-число; ${rest} остаются на ${r}. Это не расстояние, а регистр: та же тема, с бо́льшим напряжением.`,
    split: (g, d) => `Школы расходятся: ${g}. Наибольшее расстояние между ними: ${d}.`,
    near: "Одна тема с близких сторон.",
    apart: "Ответы тянут в разные стороны. Ни один не ошибочен в своей системе — разница и есть информация.",
    years: (n) => `${n} лет`,
    none: "ничего",
  },
};

// ─────────────────────────────────────────────────────────────
// Construcția unei comparații
// ─────────────────────────────────────────────────────────────

interface Def {
  id: string;
  school: T3;
  method: T3;
  value: ModelValue;
  steps: string[];
}

function build(
  key: string,
  scale: Scale,
  defs: Def[],
  lang: Lang,
  fmt: (v: ModelValue) => string,
): Comparison {
  const t = SAYS[lang];
  const models: ModelResult[] = defs.map((d) => ({
    id: d.id,
    school: d.school[lang],
    method: d.method[lang],
    value: d.value,
    display: fmt(d.value),
    steps: d.steps,
  }));
  const named = (ids: string[]) => ids.map((id) => models.find((m) => m.id === id)!.school);
  const groups = groupsOf(models.map((m) => ({ id: m.id, value: m.value }))).map((g) => ({
    ...g,
    display: fmt(g.value),
    schools: named(g.ids),
  }));
  const pairs = pairwise(scale, models);
  const verdict = models.length < 2 ? "agree" : overallVerdict(pairs);
  const d = spread(pairs);

  let says: string;
  if (verdict === "agree") {
    says = t.agree(models.length, groups[0]?.display ?? "");
  } else if (verdict === "octave") {
    const masters = groups.filter((g) => (g.value as number) > 9);
    const rest = groups.filter((g) => (g.value as number) <= 9);
    says = t.octave(
      digitalRoot(groups[0].value as number),
      masters.flatMap((g) => g.schools).join(", "),
      rest.flatMap((g) => g.schools).join(", "),
    );
  } else {
    const list = groups.map((g) => `${g.display} (${g.schools.join(", ")})`).join("; ");
    says = `${t.split(list, d)} ${verdict === "near" ? t.near : t.apart}`;
  }

  return { key, question: Q[key][lang], scale, models, groups, pairs, verdict, spread: d, says };
}

const num = (v: ModelValue) => String(v);
const setFmt = (lang: Lang) => (v: ModelValue) =>
  (v as number[]).length ? [...(v as number[])].sort((a, b) => a - b).join(" · ") : SAYS[lang].none;

// ─────────────────────────────────────────────────────────────
// Elementele
// ─────────────────────────────────────────────────────────────

const parts3 = (b: BirthDate, keep: boolean) => ({
  m: reduce(b.month, keep),
  d: reduce(b.day, keep),
  y: reduce(digitSum(b.year), keep),
});

function lifePathDefs(b: BirthDate): Def[] {
  const lp = lifePath(b);
  const p = parts3(b, false);
  const pm = parts3(b, true);
  const segMaster = result(pm.m + pm.d + pm.y);
  const flatSum = `${b.day}${b.month}${b.year}`.split("").reduce((a, x) => a + Number(x), 0);
  const horiz = b.month + b.day + b.year;

  return [
    {
      id: "segments",
      school: S("Pitagoreic, părți reduse", "Pythagorean, parts reduced", "Пифагорейская, части сведены"),
      method: S("luna, ziua și anul reduse la o cifră, apoi adunate", "month, day and year reduced to one digit, then added", "месяц, день и год сводятся к цифре, затем складываются"),
      value: lp.value,
      steps: [`${b.month} → ${p.m}`, `${chain(b.day, false)}`, `${b.year} → ${chain(digitSum(b.year), false)}`, `${plus([p.m, p.d, p.y])} = ${chain(lp.raw)}`],
    },
    {
      id: "segmentsMaster",
      school: S("Decoz clasic, masterii păstrați în părți", "Classic Decoz, masters kept in parts", "Классический Декоз, мастер-числа в частях"),
      method: S("ca mai sus, dar o zi de 11 sau 22 rămâne master", "as above, but a day of 11 or 22 stays a master", "как выше, но день 11 или 22 остаётся мастером"),
      value: segMaster.value,
      steps: [`${plus([pm.m, pm.d, pm.y])} = ${chain(segMaster.raw)}`],
    },
    {
      id: "flat",
      school: S("Toate cifrele deodată", "All digits at once", "Все цифры сразу"),
      method: S("fiecare cifră a datei adunată, masterii păstrați", "every digit of the date added, masters kept", "все цифры даты, мастер-числа сохраняются"),
      value: reduce(flatSum, true),
      steps: [`${`${b.day}${b.month}${b.year}`.split("").join(" + ")} = ${chain(flatSum)}`],
    },
    {
      id: "bhagyank",
      school: S("Vedic (Bhagyank)", "Vedic (Bhagyank)", "Ведическая (Бхагьянк)"),
      method: S("toate cifrele deodată, fără numere master", "all digits at once, no master numbers", "все цифры сразу, без мастер-чисел"),
      value: bhagyank(b),
      steps: [`${flatSum} → ${chain(flatSum, false).split(" → ").slice(1).join(" → ") || flatSum}`],
    },
    {
      id: "horizontal",
      school: S("Adunare pe orizontală", "Horizontal addition", "Горизонтальное сложение"),
      method: S("luna + ziua + anul întreg, ca numere", "month + day + the whole year, as numbers", "месяц + день + год целиком, как числа"),
      value: reduce(horiz, true),
      steps: [`${b.month} + ${b.day} + ${b.year} = ${chain(horiz)}`],
    },
  ];
}

function expressionDefs(name: string): Def[] {
  const whole = expression(name);
  const partTotals = nameParts(name).map((p) => sumLetters(p, PYTHAGOREAN));
  const partReduced = partTotals.map((x) => reduce(x, true));
  const byParts = result(partReduced.reduce((a, x) => a + x, 0));
  const nk = naamank(name);
  const kab = popularKabbalah(name);
  const heb = hebrewGematria(name);

  return [
    {
      id: "pythWhole",
      school: S("Pitagoreic, tot numele", "Pythagorean, whole name", "Пифагорейская, всё имя"),
      method: S("toate literele adunate, apoi reduse", "all letters added, then reduced", "все буквы сложены, затем сведены"),
      value: whole.value,
      steps: [...letterSteps(name, PYTHAGOREAN), `Σ = ${chain(whole.raw)}`],
    },
    {
      id: "pythParts",
      school: S("Decoz, nume cu nume", "Decoz, name by name", "Декоз, имя за именем"),
      method: S("fiecare nume redus separat, apoi adunate", "each name reduced on its own, then added", "каждое имя сводится отдельно, затем складывается"),
      value: byParts.value,
      steps: [
        ...nameParts(name).map((p, i) => `${p}: ${chain(partTotals[i])}`),
        `${plus(partReduced)} = ${chain(byParts.raw)}`,
      ],
    },
    {
      id: "chaldean",
      school: S("Caldeean (Cheiro)", "Chaldean (Cheiro)", "Халдейская (Хейро)"),
      method: S("alfabet după sunet, 1–8, fără 9", "letters by sound, 1–8, no 9", "буквы по звучанию, 1–8, без 9"),
      value: nk.root,
      steps: [...letterSteps(name, CHALDEAN), `Σ = ${chain(nk.compound, false)}`],
    },
    {
      id: "kabbalah",
      school: S("„Kabbalah” populară", "Popular “Kabbalah”", "Популярная «каббала»"),
      method: S("valori ciclice, restul împărțirii la 9", "cyclic values, remainder after dividing by 9", "циклические значения, остаток от деления на 9"),
      value: kab.value,
      steps: [`${kab.total} mod 9 = ${kab.value}`],
    },
    ...(heb.total > 0
      ? [{
          id: "gematria",
          school: S("Gematria ebraică", "Hebrew gematria", "Еврейская гематрия"),
          method: S("transliterat în ebraică, valori 1–400", "transliterated into Hebrew, values 1–400", "транслитерация на иврит, значения 1–400"),
          value: heb.reduced,
          steps: [`${heb.hebrew} = ${chain(heb.total, false)}`],
        }]
      : []),
  ];
}

const hasY = (name: string) => letters(name).includes("Y");

function yDefs(name: string, kind: "vowels" | "consonants"): Def[] {
  const filter = kind === "vowels" ? (l: { vowel: boolean }) => l.vowel : (l: { vowel: boolean }) => !l.vowel;
  const mk = (id: string, mode: YMode, school: T3, method: T3): Def => {
    const raw = sumLetters(name, PYTHAGOREAN, filter, mode);
    return { id, school, method, value: reduce(raw, true), steps: [...letterSteps(name, PYTHAGOREAN, filter, mode), `Σ = ${chain(raw)}`] };
  };
  const out: Def[] = [
    mk("pyth", "heuristic",
      S("Pitagoreic, Y după silabă", "Pythagorean, Y by syllable", "Пифагорейская, Y по слогу"),
      S("Y e vocală când poartă sunetul vocalei", "Y is a vowel when it carries the vowel sound", "Y — гласная, когда несёт гласный звук")),
  ];
  if (hasY(name)) {
    out.push(
      mk("yAlways", "always", S("Y mereu vocală", "Y always a vowel", "Y всегда гласная"), S("convenția unor calculatoare populare", "the convention of some popular calculators", "соглашение части калькуляторов")),
      mk("yNever", "never", S("Y niciodată vocală", "Y never a vowel", "Y никогда не гласная"), S("doar A, E, I, O, U", "only A, E, I, O, U", "только A, E, I, O, U")),
    );
  }
  const chRaw = sumLetters(name, CHALDEAN, filter);
  out.push({
    id: "chaldean",
    school: S("Caldeean", "Chaldean", "Халдейская"),
    method: kind === "vowels"
      ? S("vocalele, prin alfabetul caldeean", "the vowels, through the Chaldean alphabet", "гласные по халдейскому алфавиту")
      : S("consoanele, prin alfabetul caldeean", "the consonants, through the Chaldean alphabet", "согласные по халдейскому алфавиту"),
    value: reduce(chRaw, false),
    steps: [...letterSteps(name, CHALDEAN, filter), `Σ = ${chain(chRaw, false)}`],
  });
  return out;
}

function yearDefs(name: string, b: BirthDate, today: Date): Def[] {
  const y = today.getFullYear();
  const passed = today.getMonth() + 1 > b.month || (today.getMonth() + 1 === b.month && today.getDate() >= b.day);
  const yb = passed ? y : y - 1;
  const p = parts3(b, false);
  const yr = reduce(digitSum(y), false);
  const ybr = reduce(digitSum(yb), false);
  const pyJan = personalYear(b, y);
  const pyMaster = result(p.m + p.d + yr, true);
  const pyBirth = personalYear(b, yb);
  const age = ageAt(b, today);
  const ess = essence(name, age);

  return [
    {
      id: "pyJan",
      school: S("Anul de la 1 ianuarie (Decoz)", "Year from 1 January (Decoz)", "Год с 1 января (Декоз)"),
      method: S("luna și ziua nașterii + anul calendaristic", "birth month and day + the calendar year", "месяц и день рождения + календарный год"),
      value: pyJan.value,
      steps: [`${plus([p.m, p.d, yr])} = ${chain(pyJan.raw, false)}`],
    },
    {
      id: "pyMaster",
      school: S("Anul cu master păstrat", "Year with master kept", "Год с мастер-числом"),
      method: S("ca mai sus, dar 11 și 22 nu se reduc", "as above, but 11 and 22 are not reduced", "как выше, но 11 и 22 не сводятся"),
      value: pyMaster.value,
      steps: [`${plus([p.m, p.d, yr])} = ${chain(pyMaster.raw)}`],
    },
    {
      id: "pyBirthday",
      school: S("Anul de la aniversare (școala kabbalistică)", "Year from the birthday (Kabbalistic school)", "Год со дня рождения (каббалистическая школа)"),
      method: S(`anul începe de ziua ta; acum numără ${yb}`, `the year begins on your birthday; it now counts ${yb}`, `год начинается в день рождения; сейчас считается ${yb}`),
      value: pyBirth.value,
      steps: [`${plus([p.m, p.d, ybr])} = ${chain(pyBirth.raw, false)}`],
    },
    {
      id: "essence",
      school: S("Esența (Decoz, Avery)", "Essence (Decoz, Avery)", "Сущность (Декоз, Эйвери)"),
      method: S(`literele numelui active la ${age} ani`, `the letters of your name active at age ${age}`, `буквы имени, активные в ${age} лет`),
      value: ess.value,
      steps: [`Σ = ${chain(ess.raw)}`],
    },
  ];
}

function missingDefs(name: string, birthDate: Date, b: BirthDate): Def[] {
  const loShu = generateLoShuGrid(birthDate).missingNumbers;
  const dateDigits = `${b.day}${b.month}${b.year}`.split("").map(Number).filter((x) => x > 0);
  const vedicDigits = [...dateDigits, mulank(b), bhagyank(b)];
  const vedicMissing = [1, 2, 3, 4, 5, 6, 7, 8, 9].filter((d) => !vedicDigits.includes(d));
  const chaldeanPresent = new Set(letters(name).map((ch) => CHALDEAN[ch]).filter(Boolean));
  const chaldeanMissing = [1, 2, 3, 4, 5, 6, 7, 8, 9].filter((d) => !chaldeanPresent.has(d));
  const pm = psychomatrix(b, "absolute");

  const defs: Def[] = [
    {
      id: "karmicPyth",
      school: S("Lecții karmice (pitagoreic)", "Karmic lessons (Pythagorean)", "Кармические уроки (пифагор.)"),
      method: S("cifrele absente din literele numelui", "digits absent from the letters of the name", "цифры, которых нет в буквах имени"),
      value: karmicLessons(name),
      steps: [],
    },
    {
      id: "karmicChaldean",
      school: S("Lecții karmice (caldeean)", "Karmic lessons (Chaldean)", "Кармические уроки (халд.)"),
      method: S("cifrele absente prin alfabetul caldeean, care n-are 9", "digits absent through the Chaldean alphabet, which has no 9", "цифры, которых нет по халдейскому алфавиту (в нём нет 9)"),
      value: chaldeanMissing,
      steps: [],
    },
    {
      id: "loShu",
      school: S("Grila Lo Shu", "Lo Shu grid", "Сетка Ло Шу"),
      method: S("cifrele absente din data nașterii", "digits absent from the birth date", "цифры, которых нет в дате рождения"),
      value: loShu,
      steps: [`${dateDigits.join(" ")}`],
    },
    {
      id: "loShuVedic",
      school: S("Lo Shu vedic", "Vedic Lo Shu", "Ведическая Ло Шу"),
      method: S("data + Mulank + Bhagyank", "the date + Mulank + Bhagyank", "дата + Мулянк + Бхагьянк"),
      value: vedicMissing,
      steps: [`${dateDigits.join(" ")} + ${mulank(b)} + ${bhagyank(b)}`],
    },
    {
      id: "psychomatrix",
      school: S("Psihomatricea (Alexandrov)", "Psychomatrix (Alexandrov)", "Психоматрица (Александров)"),
      method: S("data + cele patru numere de lucru", "the date + the four working numbers", "дата + четыре рабочих числа"),
      value: pm.missing,
      steps: [`${dateDigits.join(" ")} + ${pm.working.join(", ")}`],
    },
  ];
  if (b.year >= 2000) {
    const p19 = psychomatrix(b, "plus19");
    defs.push({
      id: "psychomatrix19",
      school: S("Psihomatricea, regula 2000+", "Psychomatrix, the 2000+ rule", "Психоматрица, правило 2000+"),
      method: S("al treilea număr de lucru = primul + 19", "the third working number = the first + 19", "третье рабочее число = первое + 19"),
      value: p19.missing,
      steps: [`${dateDigits.join(" ")} + ${p19.working.join(", ")}`],
    });
  }
  return defs;
}

function balanceDefs(name: string): Def[] {
  const initials = nameParts(name).map((p) => p[0]).filter(Boolean);
  const pyth = balance(name);
  const ch = initials.reduce((a, c) => a + (CHALDEAN[c] ?? 0), 0);
  return [
    {
      id: "pyth",
      school: S("Pitagoreic (Decoz)", "Pythagorean (Decoz)", "Пифагорейская (Декоз)"),
      method: S("inițialele numelui", "the initials of the name", "инициалы имени"),
      value: pyth.value,
      steps: [`${initials.map((c) => `${c}${PYTHAGOREAN[c] ?? 0}`).join(" + ")} = ${chain(pyth.raw, false)}`],
    },
    {
      id: "chaldean",
      school: S("Caldeean", "Chaldean", "Халдейская"),
      method: S("inițialele, prin alfabetul caldeean", "the initials, through the Chaldean alphabet", "инициалы по халдейскому алфавиту"),
      value: reduce(ch, false),
      steps: [`${initials.map((c) => `${c}${CHALDEAN[c] ?? 0}`).join(" + ")} = ${chain(ch, false)}`],
    },
  ];
}

function maxFrequency(name: string, table: LetterTable): number[] {
  const freq: Record<number, number> = {};
  for (const ch of letters(name)) {
    const v = table[ch];
    if (v) freq[v] = (freq[v] ?? 0) + 1;
  }
  const max = Math.max(0, ...Object.values(freq));
  return max ? Object.keys(freq).map(Number).filter((d) => freq[d] === max) : [];
}

function passionDefs(name: string, b: BirthDate): Def[] {
  const lp = lifePath(b);
  const hp = hiddenPassion(name, [expression(name).value, lp.value]);
  return [
    {
      id: "pythTies",
      school: S("Pitagoreic, toate egalitățile", "Pythagorean, all ties", "Пифагорейская, все равные"),
      method: S("cifra cea mai frecventă; la egalitate, toate", "the most frequent digit; on a tie, all of them", "самая частая цифра; при равенстве — все"),
      value: maxFrequency(name, PYTHAGOREAN),
      steps: [],
    },
    {
      id: "pythDecoz",
      school: S("Decoz, o singură cifră", "Decoz, a single digit", "Декоз, одна цифра"),
      method: S("la egalitate, decide numerele de bază", "on a tie, the core numbers decide", "при равенстве решают основные числа"),
      value: [hp.value],
      steps: [],
    },
    {
      id: "chaldean",
      school: S("Caldeean", "Chaldean", "Халдейская"),
      method: S("cifra cea mai frecventă prin alfabetul caldeean", "the most frequent digit through the Chaldean alphabet", "самая частая цифра по халдейскому алфавиту"),
      value: maxFrequency(name, CHALDEAN),
      steps: [],
    },
  ];
}

function giftDefs(name: string, b: BirthDate): Def[] {
  const first = letters(nameParts(name)[0] ?? "")[0] ?? "";
  return [
    {
      id: "mulank",
      school: S("Vedic (Mulank)", "Vedic (Mulank)", "Ведическая (Мулянк)"),
      method: S("ziua nașterii, redusă", "the day of birth, reduced", "день рождения, сведённый"),
      value: mulank(b),
      steps: [chain(b.day, false)],
    },
    {
      id: "cornerstone",
      school: S("Piatra de temelie (pitagoreic)", "Cornerstone (Pythagorean)", "Краеугольный камень (пифагор.)"),
      method: S("prima literă a prenumelui", "the first letter of the first name", "первая буква имени"),
      value: PYTHAGOREAN[first] ?? 0,
      steps: [`${first} = ${PYTHAGOREAN[first] ?? 0}`],
    },
    {
      id: "cornerstoneChaldean",
      school: S("Piatra de temelie (caldeean)", "Cornerstone (Chaldean)", "Краеугольный камень (халд.)"),
      method: S("prima literă, prin alfabetul caldeean", "the first letter, through the Chaldean alphabet", "первая буква по халдейскому алфавиту"),
      value: CHALDEAN[first] ?? 0,
      steps: [`${first} = ${CHALDEAN[first] ?? 0}`],
    },
  ];
}

function birthArchetypeDefs(b: BirthDate): Def[] {
  const cards = birthCards(b);
  const md = destinyMatrix(b, "digitsum").byKey;
  const mm = destinyMatrix(b, "mod22").byKey;
  return [
    {
      id: "greer",
      school: S("Tarot, cartea Personalității (Arrien, Greer)", "Tarot Personality card (Arrien, Greer)", "Таро, карта Личности (Арриен, Грир)"),
      method: S("luna + ziua + anul, redus până la cel mult 22", "month + day + year, reduced to 22 or less", "месяц + день + год, сводится до 22"),
      value: cards.personality,
      steps: [`${b.month} + ${b.day} + ${b.year} = ${cards.sum} → ${cards.personality}`],
    },
    {
      id: "matrixDigit",
      school: S("Matricea destinului, suma cifrelor", "Destiny Matrix, digit sum", "Матрица судьбы, сумма цифр"),
      method: S("punctul personalității (ziua); peste 22 se adună cifrele", "the personality point (the day); above 22, digits are added", "точка личности (день); больше 22 — сумма цифр"),
      value: md.A,
      steps: [`${b.day} → ${md.A}`],
    },
    {
      id: "matrixMod",
      school: S("Matricea destinului, minus 22", "Destiny Matrix, minus 22", "Матрица судьбы, минус 22"),
      method: S("același punct; peste 22 se scade 22", "the same point; above 22, subtract 22", "та же точка; больше 22 — вычесть 22"),
      value: mm.A,
      steps: [`${b.day} → ${mm.A}`],
    },
  ];
}

function yearArchetypeDefs(b: BirthDate, today: Date): Def[] {
  const age = ageAt(b, today);
  const yc = yearCard(b, today.getFullYear());
  const decade = (mode: "digitsum" | "mod22") =>
    lifePeriods(b, mode).find((p) => age >= p.fromAge && age < p.toAge) ?? lifePeriods(b, mode)[7];
  const dd = decade("digitsum");
  const dm = decade("mod22");
  return [
    {
      id: "greerYear",
      school: S("Tarot, cartea anului (Greer)", "Tarot year card (Greer)", "Таро, карта года (Грир)"),
      method: S("luna + ziua + anul curent", "month + day + the current year", "месяц + день + текущий год"),
      value: yc.arcana,
      steps: [`${b.month} + ${b.day} + ${today.getFullYear()} = ${yc.sum} → ${yc.arcana}`],
    },
    {
      id: "matrixDecadeDigit",
      school: S("Matricea, decada vârstei (suma cifrelor)", "Matrix, the decade of your age (digit sum)", "Матрица, десятилетие возраста (сумма цифр)"),
      method: S(`arcul ${dd.from}–${dd.to}, ${dd.fromAge}–${dd.toAge} ani`, `the ${dd.from}–${dd.to} arc, ages ${dd.fromAge}–${dd.toAge}`, `дуга ${dd.from}–${dd.to}, ${dd.fromAge}–${dd.toAge} лет`),
      value: dd.arcana,
      steps: [],
    },
    {
      id: "matrixDecadeMod",
      school: S("Matricea, decada vârstei (minus 22)", "Matrix, the decade of your age (minus 22)", "Матрица, десятилетие возраста (минус 22)"),
      method: S(`arcul ${dm.from}–${dm.to}`, `the ${dm.from}–${dm.to} arc`, `дуга ${dm.from}–${dm.to}`),
      value: dm.arcana,
      steps: [],
    },
  ];
}

function firstStageDefs(b: BirthDate): Def[] {
  const lp = lifePath(b);
  const r = reduce(lp.value, false);
  let goodwin = 0;
  for (let a = 27; a <= 35; a++) if (personalYear(b, b.year + a).value === 1) { goodwin = a; break; }
  return [
    {
      id: "rootLP",
      school: S("Pinaclele, cu rădăcina Drumului", "Pinnacles, with the Path's root", "Вершины, по корню Пути"),
      method: S("36 minus cifra Drumului Vieții", "36 minus the Life Path digit", "36 минус цифра Пути"),
      value: 36 - r,
      steps: [`36 − ${r} = ${36 - r}`],
    },
    {
      id: "masterLP",
      school: S("Pinaclele, cu masterul întreg", "Pinnacles, with the whole master", "Вершины, с мастер-числом целиком"),
      method: S("36 minus Drumul, fără să reduci un master", "36 minus the Path, without reducing a master", "36 минус Путь, не сводя мастер-число"),
      value: 36 - lp.value,
      steps: [`36 − ${lp.value} = ${36 - lp.value}`],
    },
    ...(goodwin
      ? [{
          id: "goodwin",
          school: S("Ciclurile de perioadă (Goodwin)", "Period cycles (Goodwin)", "Периодические циклы (Гудвин)"),
          method: S("primul an personal 1 între 27 și 35 de ani", "the first personal year 1 between ages 27 and 35", "первый личный год 1 между 27 и 35 годами"),
          value: goodwin,
          steps: [`${b.year} + ${goodwin} = ${b.year + goodwin} → PY 1`],
        }]
      : []),
  ];
}

function debtDefs(name: string, b: BirthDate): Def[] {
  const parts = {
    lifePath: lifePath(b), expression: expression(name), soulUrge: soulUrge(name),
    personality: personality(name), birthday: birthday(b),
  };
  const chainDebts = [...new Set(detectKarmicDebts(parts).map((d) => d.debt))];
  const totalOnly = [...new Set(Object.values(parts).map((p) => p.raw).filter((r) => [13, 14, 16, 19].includes(r)))];
  const dayOnly = [13, 14, 16, 19].includes(b.day) ? [b.day] : [];
  // Unele afișaje (și harta noastră, la Maturitate și Echilibru) caută datoria
  // în ORICE număr al hărții, nu doar în cele cinci de bază.
  const lp = parts.lifePath, ex = parts.expression;
  const extra = {
    maturity: maturity(lp, ex), balance: balance(name), attitude: attitude(b),
    rationalThought: rationalThought(name, b),
  };
  const anywhere = [...new Set(detectKarmicDebts({ ...parts, ...extra }).map((d) => d.debt))];
  return [
    {
      id: "chain",
      school: S("Tot lanțul de reducere", "The whole reduction chain", "Вся цепочка сведения"),
      method: S("13, 14, 16 sau 19 oriunde pe drum, în cinci numere", "13, 14, 16 or 19 anywhere on the way, in five numbers", "13, 14, 16 или 19 на любом шаге, в пяти числах"),
      value: chainDebts,
      steps: Object.entries(parts).map(([k, p]) => `${k}: ${chain(p.raw)}`),
    },
    {
      id: "totalOnly",
      school: S("Doar totalul dinaintea reducerii", "Only the total before reduction", "Только итог до сведения"),
      method: S("convenția calculatoarelor simple", "the convention of simple calculators", "соглашение простых калькуляторов"),
      value: totalOnly,
      steps: [],
    },
    {
      id: "anywhere",
      school: S("În orice număr al hărții", "In any number of the map", "В любом числе карты"),
      method: S("și în Maturitate, Echilibru, Atitudine, Gândire", "also in Maturity, Balance, Attitude, Rational Thought", "также в Зрелости, Равновесии, Отношении, Мышлении"),
      value: anywhere,
      steps: Object.entries(extra).map(([k, p]) => `${k}: ${chain(p.raw)}`),
    },
    {
      id: "dayOnly",
      school: S("Doar ziua nașterii", "Only the birth day", "Только день рождения"),
      method: S("ziua de 13, 14, 16 sau 19", "a day of 13, 14, 16 or 19", "день 13, 14, 16 или 19"),
      value: dayOnly,
      steps: [String(b.day)],
    },
  ];
}

function luckyNumberDefs(name: string, b: BirthDate): Def[] {
  const m = mulank(b);
  const pythSet = [...new Set([lifePath(b).value, expression(name).value, birthday(b).value].map((x) => reduce(x, false)))];
  return [
    {
      id: "vedic",
      school: S("Vedic, planetele prietene", "Vedic, friendly planets", "Ведическая, дружественные планеты"),
      method: S(`prietenii lui ${m} (${NAVAGRAHA[m]?.planet ?? ""})`, `the friends of ${m}`, `друзья числа ${m}`),
      value: VEDIC_RELATIONS[m]?.friends ?? [],
      steps: [],
    },
    {
      id: "chaldean",
      school: S("Caldeean (Cheiro)", "Chaldean (Cheiro)", "Халдейская (Хейро)"),
      method: S(`numerele compatibile cu ${m}`, `the numbers compatible with ${m}`, `числа, совместимые с ${m}`),
      value: getCompatibleNumbers(m),
      steps: [],
    },
    {
      id: "pythagorean",
      school: S("Pitagoreic, numerele de bază", "Pythagorean, the core numbers", "Пифагорейская, основные числа"),
      method: S("Drumul, Destinul și ziua, la rădăcină", "Path, Expression and the day, at the root", "Путь, Судьба и день, по корню"),
      value: pythSet,
      steps: [],
    },
  ];
}

const RO_DAY = ["duminică", "luni", "marți", "miercuri", "joi", "vineri", "sâmbătă"];
const EN_DAY = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function luckyDayDefs(b: BirthDate): Def[] {
  const m = mulank(b);
  const vedicDay = RO_DAY.indexOf(NAVAGRAHA[m]?.day ?? "");
  return [
    {
      id: "vedic",
      school: S("Vedic (Navagraha)", "Vedic (Navagraha)", "Ведическая (Наваграха)"),
      method: S(`ziua planetei lui ${m}; Rahu și Ketu n-au zi`, `the day of ${m}'s planet; Rahu and Ketu have none`, `день планеты ${m}; у Раху и Кету его нет`),
      value: vedicDay >= 0 ? [vedicDay] : [],
      steps: [],
    },
    {
      id: "chaldean",
      school: S("Caldeean (Cheiro)", "Chaldean (Cheiro)", "Халдейская (Хейро)"),
      method: S(`zilele prielnice lui ${m}`, `the favourable days of ${m}`, `благоприятные дни ${m}`),
      value: getFavorableDays(m).map((d) => EN_DAY.indexOf(d)).filter((x) => x >= 0),
      steps: [],
    },
  ];
}

function kuaDefs(b: BirthDate, gender: "male" | "female"): Def[] {
  const solarYear = b.month === 1 || (b.month === 2 && b.day < 4) ? b.year - 1 : b.year;
  const classic = kuaNumber(b.year, gender, "classic");
  const century = kuaNumber(b.year, gender, "century");
  const solar = kuaNumber(solarYear, gender, "classic");
  return [
    { id: "classic", school: S("Formula clasică", "Classic formula", "Классическая формула"), method: S("10 − / 5 + pentru toți anii", "10 − / 5 + for every year", "10 − / 5 + для всех лет"), value: classic.kua, steps: [String(b.year)] },
    { id: "century", school: S("Formula după 2000", "Post-2000 formula", "Формула после 2000"), method: S("9 − / 6 + pentru născuții după 2000", "9 − / 6 + for births from 2000", "9 − / 6 + для рождённых после 2000"), value: century.kua, steps: [String(b.year)] },
    { id: "solar", school: S("Anul solar chinezesc", "Chinese solar year", "Китайский солнечный год"), method: S("anul începe pe 4 februarie, nu pe 1 ianuarie", "the year begins on 4 February, not 1 January", "год начинается 4 февраля, а не 1 января"), value: solar.kua, steps: [String(solarYear)] },
  ];
}

function capstoneDefs(name: string): Def[] {
  const parts = nameParts(name);
  const first = parts[0] ?? "";
  const last = parts[parts.length - 1] ?? "";
  const lf = letters(first).at(-1) ?? "";
  const ll = letters(last).at(-1) ?? "";
  return [
    {
      id: "firstName",
      school: S("Ultima literă a prenumelui (Spiritwalk, Decoz)", "Last letter of the first name (Spiritwalk, Decoz)", "Последняя буква имени (Spiritwalk, Декоз)"),
      method: S("piatra de vârf a prenumelui", "the capstone of the first name", "замковый камень имени"),
      value: PYTHAGOREAN[lf] ?? 0,
      steps: [`${first}: ${lf} = ${PYTHAGOREAN[lf] ?? 0}`],
    },
    {
      id: "lastName",
      school: S("Ultima literă a numelui de familie", "Last letter of the surname", "Последняя буква фамилии"),
      method: S("ultima literă a numelui întreg", "the last letter of the whole name", "последняя буква полного имени"),
      value: PYTHAGOREAN[ll] ?? 0,
      steps: [`${last}: ${ll} = ${PYTHAGOREAN[ll] ?? 0}`],
    },
  ];
}

function keyDefs(name: string): Def[] {
  const first = nameParts(name)[0] ?? "";
  const p = sumLetters(first, PYTHAGOREAN);
  const c = sumLetters(first, CHALDEAN);
  return [
    {
      id: "pyth",
      school: S("Key / Growth Number (Goodwin)", "Key / Growth Number (Goodwin)", "Ключевое число (Гудвин)"),
      method: S("prenumele, pitagoreic", "the first name, Pythagorean", "имя, пифагорейская"),
      value: reduce(p, true),
      steps: [...letterSteps(first, PYTHAGOREAN), chain(p)],
    },
    {
      id: "chaldean",
      school: S("Prenumele, caldeean", "The first name, Chaldean", "Имя, халдейская"),
      method: S("prenumele, prin alfabetul caldeean", "the first name, through the Chaldean alphabet", "имя по халдейскому алфавиту"),
      value: reduce(c, false),
      steps: [...letterSteps(first, CHALDEAN), chain(c, false)],
    },
  ];
}

/**
 * Media așteptată a tabelului de incluziune. Două convenții:
 * - tabelul fix al lui Goodwin pentru un nume de ~18 litere [K — de verificat în
 *   carte], scalat la lungimea numelui;
 * - proporția literelor din alfabet care cad pe fiecare cifră, × lungimea numelui.
 * O cifră e „peste medie" când apare de cel puțin două ori mai des decât media.
 */
const GOODWIN_AVG: Record<number, number> = { 1: 3.5, 2: 1.5, 3: 1.5, 4: 1, 5: 3.5, 6: 1.5, 7: 0.5, 8: 1, 9: 3 };

function intensityDefs(name: string): Def[] {
  const ls = letters(name);
  const n = ls.length || 1;
  const count: Record<number, number> = {};
  for (const ch of ls) { const v = PYTHAGOREAN[ch]; if (v) count[v] = (count[v] ?? 0) + 1; }
  const alpha: Record<number, number> = {};
  for (const ch of "ABCDEFGHIJKLMNOPQRSTUVWXYZ") alpha[PYTHAGOREAN[ch]] = (alpha[PYTHAGOREAN[ch]] ?? 0) + 1;
  const goodwinTotal = Object.values(GOODWIN_AVG).reduce((a, x) => a + x, 0);
  const digits = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  const over = (exp: (d: number) => number) => digits.filter((d) => (count[d] ?? 0) >= Math.max(2, 2 * exp(d)));
  const g = (d: number) => (GOODWIN_AVG[d] * n) / goodwinTotal;
  const a = (d: number) => (alpha[d] * n) / 26;
  const fmt = (exp: (d: number) => number) => digits.map((d) => `${d}: ${count[d] ?? 0}/${exp(d).toFixed(1)}`).join("  ");
  return [
    {
      id: "goodwin",
      school: S("Media lui Goodwin", "Goodwin's average", "Среднее по Гудвину"),
      method: S("tabelul fix al unui nume obișnuit, scalat la numele tău", "the fixed table of an ordinary name, scaled to yours", "фиксированная таблица обычного имени, масштаб под ваше"),
      value: over(g),
      steps: [fmt(g)],
    },
    {
      id: "alphabet",
      school: S("Proporția alfabetului", "The alphabet's proportion", "Пропорция алфавита"),
      method: S("câte litere din alfabet cad pe fiecare cifră", "how many letters of the alphabet land on each digit", "сколько букв алфавита приходится на каждую цифру"),
      value: over(a),
      steps: [fmt(a)],
    },
  ];
}

function sunSignDefs(b: BirthDate): Def[] {
  return [
    { id: "tropical", school: S("Zodiac tropical (Occident)", "Tropical zodiac (Western)", "Тропический зодиак (Запад)"), method: S("legat de echinocțiul de primăvară", "tied to the spring equinox", "привязан к весеннему равноденствию"), value: tropicalSign(b), steps: [] },
    { id: "sidereal", school: S("Zodiac sideral (vedic, Lahiri)", "Sidereal zodiac (Vedic, Lahiri)", "Сидерический зодиак (ведич., Лахири)"), method: S("legat de stele; granițe aproximative, ~24 de zile mai târziu", "tied to the stars; approximate borders, ~24 days later", "привязан к звёздам; границы приблизительны, ~24 дня позже"), value: siderealSign(b), steps: [] },
  ];
}

function chineseDefs(b: BirthDate): Def[] {
  return [
    { id: "calendar", school: S("An calendaristic", "Calendar year", "Календарный год"), method: S("anul începe pe 1 ianuarie", "the year begins on 1 January", "год начинается 1 января"), value: chineseAnimalCalendar(b), steps: [String(b.year)] },
    { id: "solar", school: S("An solar (Lichun, Ba Zi)", "Solar year (Lichun, Ba Zi)", "Солнечный год (Личунь, Ба Цзы)"), method: S("anul începe pe 4 februarie", "the year begins on 4 February", "год начинается 4 февраля"), value: chineseAnimalSolar(b), steps: [] },
  ];
}

// ─────────────────────────────────────────────────────────────
// Punctul de intrare
// ─────────────────────────────────────────────────────────────

export function compareAll(fullName: string, birthDate: Date, opts: CompareOptions = {}): Comparison[] {
  const lang = opts.lang ?? "ro";
  const today = opts.today ?? new Date();
  const b = toBirthDate(birthDate);
  const sf = setFmt(lang);
  const dayFmt = (v: ModelValue) =>
    (v as number[]).length ? (v as number[]).map((i) => WEEKDAYS[lang][i]).join(" · ") : SAYS[lang].none;
  const ageFmt = (v: ModelValue) => SAYS[lang].years(v as number);

  const expressionModels = expressionDefs(fullName);
  if (opts.currentName && opts.currentName.trim() && opts.currentName.trim() !== fullName.trim()) {
    const cur = expression(opts.currentName);
    expressionModels.push({
      id: "currentName",
      school: S("Numele de azi (Minor Expression)", "Today's name (Minor Expression)", "Нынешнее имя (Малое выражение)"),
      method: S("același calcul, pe numele pe care îl folosești", "the same calculation, on the name you use", "тот же расчёт по имени, которым вы пользуетесь"),
      value: cur.value,
      steps: [...letterSteps(opts.currentName, PYTHAGOREAN), `Σ = ${chain(cur.raw)}`],
    });
  }

  const seen = yDefs(fullName, "consonants");
  const att = attitude(b);
  seen.push({
    id: "attitude",
    school: S("Atitudinea (din dată)", "Attitude (from the date)", "Отношение (из даты)"),
    method: S("luna + ziua nașterii", "birth month + day", "месяц + день рождения"),
    value: att.value,
    steps: [`${b.month} + ${b.day} = ${chain(att.raw, false)}`],
  });

  const list: Comparison[] = [
    build("lifePath", "digit", lifePathDefs(b), lang, num),
    build("expression", "digit", expressionModels, lang, num),
    build("soul", "digit", yDefs(fullName, "vowels"), lang, num),
    build("seen", "digit", seen, lang, num),
    build("year", "digit", yearDefs(fullName, b, today), lang, num),
    build("gift", "digit", giftDefs(fullName, b), lang, num),
    build("missing", "set", missingDefs(fullName, birthDate, b), lang, sf),
    build("balance", "digit", balanceDefs(fullName), lang, num),
    build("capstone", "digit", capstoneDefs(fullName), lang, num),
    build("key", "digit", keyDefs(fullName), lang, num),
    build("intensity", "set", intensityDefs(fullName), lang, sf),
    build("passion", "set", passionDefs(fullName, b), lang, sf),
    build("debts", "set", debtDefs(fullName, b), lang, sf),
    build("birthArchetype", "arcana", birthArchetypeDefs(b), lang, num),
    build("yearArchetype", "arcana", yearArchetypeDefs(b, today), lang, num),
    build("firstStage", "age", firstStageDefs(b), lang, ageFmt),
    build("luckyNumbers", "set", luckyNumberDefs(fullName, b), lang, sf),
    build("luckyDays", "set", luckyDayDefs(b), lang, dayFmt),
  ];
  list.push(
    build("sunSign", "category", sunSignDefs(b), lang, (v) => SIGN_NAMES[lang][v as keyof (typeof SIGN_NAMES)["ro"]]),
    build("chineseAnimal", "category", chineseDefs(b), lang, (v) => ANIMAL_NAMES[lang][v as keyof (typeof ANIMAL_NAMES)["ro"]]),
  );
  if (opts.gender) list.push(build("kua", "digit", kuaDefs(b, opts.gender), lang, num));
  return list;
}
