/**
 * models / compatibility — aceeași pereche, toate metodele din piață.
 *
 * Fiecare metodă de compatibilitate găsită în aplicații și în literatură se
 * calculează separat, cu pașii ei, și dă un verdict pe aceeași scară în trei
 * trepte: armonie / neutru / tensiune. Unde două surse publică tabele diferite
 * pentru aceeași întrebare, fiecare tabel e o metodă a lui.
 *
 * Ce NU face modulul: nu face media verdictelor, nu dă un procent de sinteză,
 * nu alege un câștigător. Numără cine spune ce și măsoară unde se despart.
 * Diferențele dintre metode sunt informația.
 *
 * Surse (verificate 2026-10-12):
 *  - numerologist.com, „Relationship Compatibility Cheat Sheet":
 *    https://numerologist.com/love-and-relationships/relationship-compatibility-cheat-sheet
 *  - numerologist.com, „Your compatibility with others":
 *    https://numerologist.com/numerology/your-compatibility-with-others
 *  - grahai.com, paginile Mulank 1–9: https://www.grahai.com/numerology/mulank/1 … /9
 *  - YourTango (Trenton Wayne), numărul relației 2, 4, 6:
 *    https://www.yourtango.com/love/best-relationship-numbers-numerology-compatibility
 */

import { type BirthDate, PYTHAGOREAN, digitSum, letterFrequency, reduce, toBirthDate } from "@/lib/numerology-plus/core";
import {
  lifePath, expression, soulUrge, personality, birthday, karmicLessons, personalYear,
} from "@/lib/numerology-plus/pythagorean";
import { VEDIC_RELATIONS, chaldeanName, kuaNumber, mulank } from "@/lib/numerology-plus/systems";
import { psychomatrix } from "@/lib/numerology-plus/psychomatrix";
import { generateLoShuGrid } from "@/lib/loShuGrid";
import { getCompatibleNumbers } from "@/lib/chaldean";
import { getCompatibilityScore } from "@/lib/compatibility";
import {
  type Verdict, type PairDistance, groupsOf, pairwise, overallVerdict, spread as spreadOf, digitalRoot,
} from "./compare";

export type Lang = "ro" | "en" | "ru";
export type Gender = "male" | "female";
export type CoupleVerdict = "harmonious" | "neutral" | "challenging";
type T3 = Record<Lang, string>;

export interface CouplePerson {
  name: string;
  birthDate: Date;
}

export interface CoupleOptions {
  lang?: Lang;
  today?: Date;
  /** Folosite doar de metoda Kua. */
  genderA?: Gender;
  genderB?: Gender;
}

export interface MethodVerdict {
  id: string;
  school: string;
  method: string;
  /** Ce intră în metodă, pentru fiecare partener. */
  inputs: { a: string; b: string };
  /** Calculul, pas cu pas. */
  steps: string[];
  verdict: CoupleVerdict;
  reason: string;
  source?: string;
}

export interface CoupleComparison {
  methods: MethodVerdict[];
  /** Metodele grupate după verdict, cel mai numeros grup primul. */
  groups: Array<{ value: CoupleVerdict; ids: string[] }>;
  counts: Record<CoupleVerdict, number>;
  /** Fiecare pereche de metode, pe scara categoriei (0 = de acord, 1 = nu). */
  pairs: PairDistance[];
  /** Câte perechi de metode nu dau același verdict. */
  disagreements: number;
  verdict: Verdict;
  spread: number;
  says: string;
  /** Metode care n-au putut fi calculate, cu motivul. */
  skipped: Array<{ id: string; reason: string }>;
}

// ─────────────────────────────────────────────────────────────
// Tabele
// ─────────────────────────────────────────────────────────────

type Row = Partial<Record<CoupleVerdict, number[]>>;

/** numerologist.com, Cheat Sheet: best / possible / challenging.
 *  Masterii se reduc la rădăcină (11 → 2, 22 → 4), cum cere pagina. */
const CHEAT_SHEET: Record<number, Row> = {
  1: { harmonious: [1, 4, 8, 9], neutral: [2, 3, 5], challenging: [6, 7] },
  2: { harmonious: [2, 7, 8, 9], neutral: [1, 3], challenging: [5] },
  3: { harmonious: [3, 5, 6, 7, 9], neutral: [1, 2], challenging: [4, 8] },
  4: { harmonious: [1, 4, 6, 8], neutral: [2, 7, 9], challenging: [3, 5] },
  5: { harmonious: [3], neutral: [1, 5, 6, 7, 8, 9], challenging: [2, 4] },
  6: { harmonious: [3, 4, 6, 9], neutral: [2, 5, 7], challenging: [1, 8] },
  7: { harmonious: [2, 3, 7], neutral: [4, 5, 6, 8], challenging: [1, 9] },
  8: { harmonious: [1, 2, 4, 8], neutral: [5, 7, 9], challenging: [3, 6] },
  9: { harmonious: [1, 2, 3, 6], neutral: [4, 5, 8, 9], challenging: [7] },
};

/** numerologist.com, „Your compatibility with others": harmonize naturally /
 *  growth-edge. Are rânduri proprii pentru 11 și 22; ce nu e numit e neutru. */
const HARMONY: Record<number, Row> = {
  1: { harmonious: [3, 5, 9], challenging: [4, 6, 8] },
  2: { harmonious: [4, 6, 8, 11], challenging: [5, 9] },
  3: { harmonious: [1, 5, 9], challenging: [4, 7] },
  4: { harmonious: [2, 6, 7, 8], challenging: [3, 5] },
  5: { harmonious: [1, 3, 7], challenging: [2, 4, 6] },
  6: { harmonious: [2, 4, 8, 9], challenging: [5, 7] },
  7: { harmonious: [4, 5, 9], challenging: [3, 6] },
  8: { harmonious: [2, 4, 6], challenging: [3, 5] },
  9: { harmonious: [1, 3, 6, 7], challenging: [4, 8] },
  11: { harmonious: [2, 6, 7, 22], challenging: [5, 8] },
  22: { harmonious: [4, 6, 8, 11], challenging: [3, 5] },
};

type Rel = "friend" | "neutral" | "enemy";
type RelTable = Record<number, { friends: number[]; neutral: number[]; enemies: number[] }>;

/** grahai.com, Mulank 1–9 (Graha Maitri). „—" la dușmani = niciunul. */
const GRAHAI: RelTable = {
  1: { friends: [1, 2, 3, 9], neutral: [5], enemies: [4, 6, 7, 8] },
  2: { friends: [1, 2], neutral: [3, 5, 6, 8, 9], enemies: [4, 7] },
  3: { friends: [1, 3, 9], neutral: [2, 4, 5, 6, 7, 8], enemies: [] },
  4: { friends: [4, 5, 6, 8], neutral: [3, 7, 9], enemies: [1, 2] },
  5: { friends: [4, 5, 6], neutral: [1, 2, 3, 7, 8, 9], enemies: [] },
  6: { friends: [4, 5, 6, 7, 8], neutral: [2, 3, 9], enemies: [1] },
  7: { friends: [6, 7, 8, 9], neutral: [3, 4, 5], enemies: [1, 2] },
  8: { friends: [4, 6, 7, 8], neutral: [2, 3, 5, 9], enemies: [1] },
  9: { friends: [1, 3, 7, 9], neutral: [2, 4, 5, 6, 8], enemies: [] },
};

/** Graha Maitri din Ashtakoot: punctele pentru cele două direcții. */
const MAITRI: Record<string, number> = {
  "friend-friend": 5, "friend-neutral": 4, "neutral-friend": 4, "neutral-neutral": 3,
  "friend-enemy": 1, "enemy-friend": 1, "neutral-enemy": 0.5, "enemy-neutral": 0.5, "enemy-enemy": 0,
};

/** Numărul relației: 2, 4 și 6 sunt numite „meant to be"; sursa nu numește
 *  niciun număr dificil, deci restul rămân neutre. */
const RELATIONSHIP_FAVOURED = [2, 4, 6];

// ─────────────────────────────────────────────────────────────
// Texte
// ─────────────────────────────────────────────────────────────

const S = (ro: string, en: string, ru: string): T3 => ({ ro, en, ru });

const SCHOOL: Record<string, T3> = {
  "lp-cheatsheet": S("Drumul Vieții · numerologist.com (fișa de compatibilitate)", "Life Path · numerologist.com (cheat sheet)", "Жизненный путь · numerologist.com (шпаргалка)"),
  "lp-harmony": S("Drumul Vieții · numerologist.com (armonie / prag de creștere)", "Life Path · numerologist.com (harmony / growth edge)", "Жизненный путь · numerologist.com (гармония / зона роста)"),
  "lp-app-matrix": S("Drumul Vieții · matricea acestei aplicații", "Life Path · this app's matrix", "Жизненный путь · матрица этого приложения"),
  "odd-even": S("Regula par / impar", "Odd / even rule", "Правило чёт / нечет"),
  "core-five": S("Cele cinci numere de bază, pereche cu pereche", "The five core numbers, pair by pair", "Пять основных чисел, попарно"),
  "relationship-lp": S("Numărul relației (din Drumuri)", "Relationship number (from Life Paths)", "Число отношений (из Путей)"),
  "relationship-expression": S("Numărul relației (din Expresii)", "Relationship number (from Expressions)", "Число отношений (из Выражений)"),
  "soul-a-personality-b": S("Sufletul primului ↔ Personalitatea celuilalt", "First one's Soul ↔ the other's Personality", "Душа первого ↔ Личность второго"),
  "soul-b-personality-a": S("Sufletul celui de-al doilea ↔ Personalitatea primului", "Second one's Soul ↔ the first's Personality", "Душа второго ↔ Личность первого"),
  "karmic-lessons": S("Lecțiile karmice, acoperite de celălalt", "Karmic lessons, covered by the other", "Кармические уроки, закрытые другим"),
  "lo-shu": S("Grila Lo Shu, acoperită de celălalt", "Lo Shu grid, covered by the other", "Сетка Ло Шу, закрытая другим"),
  "psychomatrix": S("Psihomatricea (Alexandrov), acoperită de celălalt", "Psychomatrix (Alexandrov), covered by the other", "Психоматрица (Александров), закрытая другим"),
  "vedic-app": S("Vedic · Mulank, tabelul acestei aplicații", "Vedic · Mulank, this app's table", "Ведическая · Муланк, таблица этого приложения"),
  "vedic-grahai": S("Vedic · Mulank, tabelul grahai.com", "Vedic · Mulank, grahai.com table", "Ведическая · Муланк, таблица grahai.com"),
  "chaldean-cheiro": S("Caldeean · numere compatibile (Cheiro)", "Chaldean · compatible numbers (Cheiro)", "Халдейская · совместимые числа (Хейро)"),
  "kua": S("Feng Shui · grupul Kua (Est / Vest)", "Feng Shui · Kua group (East / West)", "Фэн-шуй · группа Гуа (Восток / Запад)"),
  "personal-year": S("Anul personal, anul acesta", "Personal year, this year", "Личный год, в этом году"),
};

const METHOD: Record<string, T3> = {
  "lp-cheatsheet": S("Drumul fiecăruia, redus la o cifră, căutat în tabelul best / possible / challenging", "Each Life Path, reduced to one digit, looked up in the best / possible / challenging table", "Путь каждого, сведённый к цифре, ищется в таблице best / possible / challenging"),
  "lp-harmony": S("Drumurile căutate în tabelul care numește perechile armonioase și pe cele de creștere; ce nu e numit e neutru", "Life Paths looked up in the table naming harmonious and growth-edge pairs; anything unnamed is neutral", "Пути ищутся в таблице гармоничных пар и пар роста; не названное — нейтрально"),
  "lp-app-matrix": S("Scorul din matricea pe care aplicația o folosea pentru procent: 70+ armonie, sub 55 tensiune", "The score from the matrix this app used for its percentage: 70+ harmony, under 55 tension", "Оценка из матрицы, которую приложение использовало для процента: 70+ гармония, ниже 55 напряжение"),
  "odd-even": S("Drumurile reduse la rădăcină: aceeași paritate e armonie, parități diferite sunt tensiune", "Life Paths reduced to their root: same parity is harmony, different parity is tension", "Пути, сведённые к корню: одинаковая чётность — гармония, разная — напряжение"),
  "core-five": S("Drum, Expresie, Suflet, Personalitate, Zi — fiecare cu perechea lui, prin fișa numerologist.com; verdictul e cel mai des întâlnit", "Life Path, Expression, Soul, Personality, Birthday — each with its counterpart, via the numerologist.com cheat sheet; the verdict is the most frequent one", "Путь, Выражение, Душа, Личность, День — каждое со своей парой по шпаргалке numerologist.com; вердикт — самый частый"),
  "relationship-lp": S("Suma celor două Drumuri, redusă; 2, 4 și 6 sunt numite favorabile, restul neutre", "Sum of both Life Paths, reduced; 2, 4 and 6 are named favourable, the rest neutral", "Сумма двух Путей, сведённая; 2, 4 и 6 названы благоприятными, остальные нейтральны"),
  "relationship-expression": S("Aceeași regulă, pe suma celor două Expresii", "The same rule, on the sum of both Expressions", "То же правило для суммы двух Выражений"),
  "soul-a-personality-b": S("Ce vrea primul pe dinăuntru, față de ce arată celălalt, prin fișa numerologist.com", "What the first wants inside against what the other shows, via the numerologist.com cheat sheet", "Чего первый хочет внутри против того, что показывает второй, по шпаргалке numerologist.com"),
  "soul-b-personality-a": S("Aceeași întrebare, în sens invers", "The same question, the other way round", "Тот же вопрос в обратную сторону"),
  "karmic-lessons": S("Cifrele care lipsesc din numele fiecăruia, căutate în numele celuilalt", "The digits missing from each name, looked for in the other's name", "Цифры, отсутствующие в каждом имени, ищутся в имени другого"),
  "lo-shu": S("Celulele goale ale grilei Lo Shu a fiecăruia, căutate în data celuilalt", "The empty cells of each Lo Shu grid, looked for in the other's date", "Пустые клетки сетки Ло Шу каждого ищутся в дате другого"),
  "psychomatrix": S("Celulele goale ale psihomatricei fiecăruia (cu numerele de lucru), căutate în a celuilalt", "The empty cells of each psychomatrix (with working numbers), looked for in the other's", "Пустые клетки психоматрицы каждого (с рабочими числами) ищутся у другого"),
  "vedic-app": S("Prieten / neutru / dușman în ambele direcții, punctat ca Graha Maitri (4–5 armonie, 3 neutru, 0–1 tensiune)", "Friend / neutral / enemy both ways, scored as Graha Maitri (4–5 harmony, 3 neutral, 0–1 tension)", "Друг / нейтрал / враг в обе стороны, по баллам Граха Майтри (4–5 гармония, 3 нейтрально, 0–1 напряжение)"),
  "vedic-grahai": S("Același punctaj, pe tabelul publicat de grahai.com", "The same scoring, on the table published by grahai.com", "Те же баллы по таблице grahai.com"),
  "chaldean-cheiro": S("Rădăcina numelui caldeean a fiecăruia, căutată în lista de numere compatibile a celuilalt", "Each Chaldean name root, looked for in the other's list of compatible numbers", "Корень халдейского имени каждого ищется в списке совместимых чисел другого"),
  "kua": S("Numărul Kua din anul nașterii și gen; același grup (Est sau Vest) e armonie", "Kua number from birth year and gender; the same group (East or West) is harmony", "Число Гуа из года рождения и пола; одна группа (Восток или Запад) — гармония"),
  "personal-year": S("Anul personal al fiecăruia acum: același e armonie, vecin e neutru, departe e tensiune", "Each one's personal year now: the same is harmony, adjacent is neutral, far apart is tension", "Личный год каждого сейчас: одинаковый — гармония, соседний — нейтрально, далёкий — напряжение"),
};

const SOURCE: Record<string, string> = {
  "lp-cheatsheet": "https://numerologist.com/love-and-relationships/relationship-compatibility-cheat-sheet",
  "lp-harmony": "https://numerologist.com/numerology/your-compatibility-with-others",
  "core-five": "https://numerologist.com/love-and-relationships/relationship-compatibility-cheat-sheet",
  "soul-a-personality-b": "https://numerologist.com/love-and-relationships/relationship-compatibility-cheat-sheet",
  "soul-b-personality-a": "https://numerologist.com/love-and-relationships/relationship-compatibility-cheat-sheet",
  "relationship-lp": "https://www.yourtango.com/love/best-relationship-numbers-numerology-compatibility",
  "vedic-grahai": "https://www.grahai.com/numerology/mulank/1",
};

const VERDICT_WORD: Record<Lang, Record<CoupleVerdict, string>> = {
  ro: { harmonious: "armonie", neutral: "neutru", challenging: "tensiune" },
  en: { harmonious: "harmony", neutral: "neutral", challenging: "tension" },
  ru: { harmonious: "гармония", neutral: "нейтрально", challenging: "напряжение" },
};

const W: Record<Lang, {
  lp: string; exp: string; soul: string; pers: string; day: string; mulank: string; chaldean: string;
  py: string; kua: string; east: string; west: string; odd: string; even: string;
  listed: (a: number, b: number, w: string) => string;
  unlisted: (a: number, b: number) => string;
  conflict: (a: number, b: number) => string;
  score: (s: number) => string;
  parity: (same: boolean) => string;
  plurality: (h: number, n: number, c: number) => string;
  relNum: (n: number, fav: boolean) => string;
  covered: (c: number, t: number) => string;
  nothingMissing: string;
  maitri: (ab: string, ba: string, p: number) => string;
  rel: Record<Rel, string>;
  cheiro: (ab: boolean, ba: boolean) => string;
  kuaSays: (same: boolean) => string;
  kuaInvalid: string;
  pySays: (d: number) => string;
  kuaSkipped: string;
  missing: string;
  none: string;
}> = {
  ro: {
    lp: "Drum", exp: "Expresie", soul: "Suflet", pers: "Personalitate", day: "Zi", mulank: "Mulank", chaldean: "Nume caldeean",
    py: "An personal", kua: "Kua", east: "Est", west: "Vest", odd: "impar", even: "par",
    listed: (a, b, w) => `Tabelul pune ${a} și ${b} la „${w}".`,
    unlisted: (a, b) => `Tabelul nu numește perechea ${a} și ${b}; rămâne neutră.`,
    conflict: (a, b) => `Tabelul se contrazice: rândul lui ${a} și rândul lui ${b} spun lucruri diferite.`,
    score: (s) => `Matricea dă ${s} din 100.`,
    parity: (same) => (same ? "Aceeași paritate." : "Parități diferite."),
    plurality: (h, n, c) => `Din cinci perechi: ${h} armonie, ${n} neutre, ${c} tensiune.`,
    relNum: (n, fav) => (fav ? `Numărul relației e ${n}, unul dintre cele numite favorabile.` : `Numărul relației e ${n}; sursa nu-l numește nici favorabil, nici dificil.`),
    covered: (c, t) => `${c} din ${t} lipsuri sunt acoperite de celălalt.`,
    nothingMissing: "Nimănui nu-i lipsește nimic; nu e nimic de acoperit.",
    maitri: (ab, ba, p) => `Primul îl vede pe al doilea ${ab}, al doilea pe primul ${ba}: ${p} puncte din 5.`,
    rel: { friend: "prieten", neutral: "neutru", enemy: "dușman" },
    cheiro: (ab, ba) => (ab && ba ? "Fiecare e în lista celuilalt." : ab || ba ? "Doar unul e în lista celuilalt." : "Niciunul nu e în lista celuilalt."),
    kuaSays: (same) => (same ? "Același grup." : "Grupuri diferite."),
    kuaInvalid: "Formula motorului nu dă un Kua valid pentru unul dintre ani.",
    pySays: (d) => (d === 0 ? "Sunteți în același an personal." : d === 1 ? "Ani personali vecini." : `Ani personali la ${d} pași unul de altul.`),
    kuaSkipped: "Kua cere genul amândurora.",
    missing: "lipsesc", none: "nimic",
  },
  en: {
    lp: "Life Path", exp: "Expression", soul: "Soul", pers: "Personality", day: "Birthday", mulank: "Mulank", chaldean: "Chaldean name",
    py: "Personal year", kua: "Kua", east: "East", west: "West", odd: "odd", even: "even",
    listed: (a, b, w) => `The table puts ${a} and ${b} at "${w}".`,
    unlisted: (a, b) => `The table does not name the pair ${a} and ${b}; it stays neutral.`,
    conflict: (a, b) => `The table contradicts itself: the rows for ${a} and ${b} say different things.`,
    score: (s) => `The matrix gives ${s} out of 100.`,
    parity: (same) => (same ? "Same parity." : "Different parity."),
    plurality: (h, n, c) => `Of five pairs: ${h} harmony, ${n} neutral, ${c} tension.`,
    relNum: (n, fav) => (fav ? `The relationship number is ${n}, one of those named favourable.` : `The relationship number is ${n}; the source names it neither favourable nor difficult.`),
    covered: (c, t) => `${c} of ${t} gaps are covered by the other.`,
    nothingMissing: "Neither is missing anything; there is nothing to cover.",
    maitri: (ab, ba, p) => `The first sees the second as ${ab}, the second sees the first as ${ba}: ${p} points of 5.`,
    rel: { friend: "friend", neutral: "neutral", enemy: "enemy" },
    cheiro: (ab, ba) => (ab && ba ? "Each is on the other's list." : ab || ba ? "Only one is on the other's list." : "Neither is on the other's list."),
    kuaSays: (same) => (same ? "The same group." : "Different groups."),
    kuaInvalid: "The engine's formula gives no valid Kua for one of the years.",
    pySays: (d) => (d === 0 ? "You are in the same personal year." : d === 1 ? "Adjacent personal years." : `Personal years ${d} steps apart.`),
    kuaSkipped: "Kua needs both genders.",
    missing: "missing", none: "none",
  },
  ru: {
    lp: "Путь", exp: "Выражение", soul: "Душа", pers: "Личность", day: "День", mulank: "Муланк", chaldean: "Халдейское имя",
    py: "Личный год", kua: "Гуа", east: "Восток", west: "Запад", odd: "нечётное", even: "чётное",
    listed: (a, b, w) => `Таблица ставит ${a} и ${b} на «${w}».`,
    unlisted: (a, b) => `Таблица не называет пару ${a} и ${b}; она остаётся нейтральной.`,
    conflict: (a, b) => `Таблица противоречит себе: строки ${a} и ${b} говорят разное.`,
    score: (s) => `Матрица даёт ${s} из 100.`,
    parity: (same) => (same ? "Одинаковая чётность." : "Разная чётность."),
    plurality: (h, n, c) => `Из пяти пар: ${h} гармония, ${n} нейтрально, ${c} напряжение.`,
    relNum: (n, fav) => (fav ? `Число отношений ${n} — одно из названных благоприятными.` : `Число отношений ${n}; источник не называет его ни благоприятным, ни трудным.`),
    covered: (c, t) => `${c} из ${t} пробелов закрыты другим.`,
    nothingMissing: "Ни у кого ничего не отсутствует; закрывать нечего.",
    maitri: (ab, ba, p) => `Первый видит второго как «${ab}», второй первого — как «${ba}»: ${p} балла из 5.`,
    rel: { friend: "друг", neutral: "нейтрал", enemy: "враг" },
    cheiro: (ab, ba) => (ab && ba ? "Каждый в списке другого." : ab || ba ? "Только один в списке другого." : "Ни один не в списке другого."),
    kuaSays: (same) => (same ? "Одна группа." : "Разные группы."),
    kuaInvalid: "Формула движка не даёт допустимого Гуа для одного из лет.",
    pySays: (d) => (d === 0 ? "Вы в одном личном году." : d === 1 ? "Соседние личные годы." : `Личные годы в ${d} шагах друг от друга.`),
    kuaSkipped: "Для Гуа нужен пол обоих.",
    missing: "отсутствуют", none: "нет",
  },
};

const SAYS: Record<Lang, (n: number, h: number, ne: number, c: number, d: number, p: number) => string> = {
  ro: (n, h, ne, c, d, p) =>
    `Din ${n} metode, ${h} spun armonie, ${ne} neutru și ${c} tensiune. ${d} din ${p} perechi de metode nu dau același verdict — aici nu se face nicio medie: fiecare metodă citește altceva, iar distanța dintre ele e informația.`,
  en: (n, h, ne, c, d, p) =>
    `Of ${n} methods, ${h} say harmony, ${ne} neutral and ${c} tension. ${d} of ${p} pairs of methods do not give the same verdict — nothing is averaged here: each method reads something else, and the distance between them is the information.`,
  ru: (n, h, ne, c, d, p) =>
    `Из ${n} методов ${h} говорят «гармония», ${ne} — «нейтрально» и ${c} — «напряжение». ${d} из ${p} пар методов не дают одного вердикта — здесь ничего не усредняется: каждый метод читает своё, а расстояние между ними и есть информация.`,
};

// ─────────────────────────────────────────────────────────────
// Ajutoare
// ─────────────────────────────────────────────────────────────

const isMasterNum = (n: number) => n === 11 || n === 22 || n === 33;

function rowSays(row: Row | undefined, x: number): CoupleVerdict | null {
  if (!row) return null;
  for (const k of ["harmonious", "neutral", "challenging"] as CoupleVerdict[])
    if (row[k]?.includes(x)) return k;
  return null;
}

/** Caută perechea în ambele rânduri. Un rând care tace e completat de celălalt;
 *  două rânduri care se contrazic dau neutru și o spun. */
function lookupPair(table: Record<number, Row>, a: number, b: number, lang: Lang) {
  const keyOf = (x: number) => (table[x] ? x : digitalRoot(x));
  const look = (row: number, x: number) => {
    const r = table[keyOf(row)];
    // Un master se citește prin rădăcină doar dacă tabelul nu-i dă rând propriu:
    // unde are (11, 22), tabelul îl tratează ca pe alt număr.
    return rowSays(r, x) ?? (isMasterNum(x) && !table[x] ? rowSays(r, digitalRoot(x)) : null);
  };
  const ab = look(a, b), ba = look(b, a);
  const w = W[lang];
  if (ab && ba && ab !== ba) return { verdict: "neutral" as CoupleVerdict, reason: w.conflict(a, b) };
  const v = ab ?? ba;
  if (!v) return { verdict: "neutral" as CoupleVerdict, reason: w.unlisted(a, b) };
  return { verdict: v, reason: w.listed(a, b, VERDICT_WORD[lang][v]) };
}

const cheat = (a: number, b: number, lang: Lang) => lookupPair(CHEAT_SHEET, digitalRoot(a), digitalRoot(b), lang);

/** „49 → 13 → 4" */
function chain(n: number, keepMasters = true): string {
  const out = [n];
  let x = n;
  while (x > 9 && !(keepMasters && isMasterNum(x))) {
    x = digitSum(x);
    out.push(x);
  }
  return out.join(" → ");
}

function lpSteps(name: string, b: BirthDate, lang: Lang): string {
  const m = reduce(b.month, false), d = reduce(b.day, false), y = reduce(digitSum(b.year), false);
  return `${name}: ${W[lang].lp} = ${m} + ${d} + ${y} = ${chain(m + d + y)}`;
}

function coverage(missA: number[], hasB: (d: number) => boolean, missB: number[], hasA: (d: number) => boolean) {
  const coveredA = missA.filter(hasB);
  const coveredB = missB.filter(hasA);
  const total = missA.length + missB.length;
  const covered = coveredA.length + coveredB.length;
  const verdict: CoupleVerdict =
    total === 0 ? "neutral" : covered === total ? "harmonious" : covered / total >= 0.5 ? "neutral" : "challenging";
  return { coveredA, coveredB, total, covered, verdict };
}

const set = (xs: number[], lang: Lang) => (xs.length ? xs.join(", ") : W[lang].none);

// ─────────────────────────────────────────────────────────────
// Punctul de intrare
// ─────────────────────────────────────────────────────────────

export function compareCouple(personA: CouplePerson, personB: CouplePerson, opts: CoupleOptions = {}): CoupleComparison {
  const lang = opts.lang ?? "ro";
  const today = opts.today ?? new Date();
  const w = W[lang];
  const nA = personA.name.trim(), nB = personB.name.trim();
  const bA = toBirthDate(personA.birthDate), bB = toBirthDate(personB.birthDate);

  const lpA = lifePath(bA).value, lpB = lifePath(bB).value;
  const exA = expression(nA), exB = expression(nB);
  const suA = soulUrge(nA).value, suB = soulUrge(nB).value;
  const peA = personality(nA).value, peB = personality(nB).value;
  const daA = birthday(bA).value, daB = birthday(bB).value;
  const lpIn = { a: `${w.lp} ${lpA}`, b: `${w.lp} ${lpB}` };
  const lpStepsBoth = [lpSteps(nA, bA, lang), lpSteps(nB, bB, lang)];

  const methods: MethodVerdict[] = [];
  const add = (id: string, inputs: { a: string; b: string }, steps: string[], verdict: CoupleVerdict, reason: string) =>
    methods.push({
      id, school: SCHOOL[id][lang], method: METHOD[id][lang], inputs, steps, verdict, reason,
      ...(SOURCE[id] ? { source: SOURCE[id] } : {}),
    });

  // 1a. Fișa numerologist.com
  {
    const r = cheat(lpA, lpB, lang);
    const steps = [...lpStepsBoth];
    if (isMasterNum(lpA) || isMasterNum(lpB)) steps.push(`${lpA} · ${lpB} → ${digitalRoot(lpA)} · ${digitalRoot(lpB)}`);
    add("lp-cheatsheet", lpIn, steps, r.verdict, r.reason);
  }
  // 1b. Armonie / prag de creștere
  {
    const r = lookupPair(HARMONY, lpA, lpB, lang);
    add("lp-harmony", lpIn, [...lpStepsBoth], r.verdict, r.reason);
  }
  // 1c. Matricea aplicației
  {
    const s = getCompatibilityScore(lpA, lpB);
    const verdict: CoupleVerdict = s >= 70 ? "harmonious" : s >= 55 ? "neutral" : "challenging";
    add("lp-app-matrix", lpIn, [...lpStepsBoth, `${lpA} × ${lpB} = ${s}`], verdict, w.score(s));
  }
  // 2. Par / impar
  {
    const rA = digitalRoot(lpA), rB = digitalRoot(lpB);
    const par = (x: number) => (x % 2 === 0 ? w.even : w.odd);
    const same = rA % 2 === rB % 2;
    add("odd-even", lpIn, [...lpStepsBoth, `${rA} ${par(rA)} · ${rB} ${par(rB)}`],
      same ? "harmonious" : "challenging", w.parity(same));
  }
  // 3. Cele cinci numere de bază
  {
    const pairs: Array<[string, number, number]> = [
      [w.lp, lpA, lpB], [w.exp, exA.value, exB.value], [w.soul, suA, suB], [w.pers, peA, peB], [w.day, daA, daB],
    ];
    const tally: Record<CoupleVerdict, number> = { harmonious: 0, neutral: 0, challenging: 0 };
    const steps = pairs.map(([label, x, y]) => {
      const v = cheat(x, y, lang).verdict;
      tally[v]++;
      return `${label}: ${x} · ${y} → ${VERDICT_WORD[lang][v]}`;
    });
    const top = Math.max(tally.harmonious, tally.neutral, tally.challenging);
    const leaders = (Object.keys(tally) as CoupleVerdict[]).filter((k) => tally[k] === top);
    add("core-five",
      { a: pairs.map((p) => p[1]).join(" · "), b: pairs.map((p) => p[2]).join(" · ") },
      steps, leaders.length === 1 ? leaders[0] : "neutral",
      w.plurality(tally.harmonious, tally.neutral, tally.challenging));
  }
  // 4. Numărul relației
  {
    const sum = lpA + lpB, n = reduce(sum);
    const fav = RELATIONSHIP_FAVOURED.includes(digitalRoot(n));
    add("relationship-lp", lpIn, [...lpStepsBoth, `${lpA} + ${lpB} = ${chain(sum)}`],
      fav ? "harmonious" : "neutral", w.relNum(n, fav));
  }
  {
    const sum = exA.value + exB.value, n = reduce(sum);
    const fav = RELATIONSHIP_FAVOURED.includes(digitalRoot(n));
    add("relationship-expression", { a: `${w.exp} ${exA.value}`, b: `${w.exp} ${exB.value}` },
      [`${nA}: ${w.exp} ${chain(exA.raw)}`, `${nB}: ${w.exp} ${chain(exB.raw)}`, `${exA.value} + ${exB.value} = ${chain(sum)}`],
      fav ? "harmonious" : "neutral", w.relNum(n, fav));
  }
  // 5. Suflet ↔ Personalitate, în ambele sensuri
  {
    const r = cheat(suA, peB, lang);
    add("soul-a-personality-b", { a: `${w.soul} ${suA}`, b: `${w.pers} ${peB}` },
      [`${nA}: ${w.soul} ${suA}`, `${nB}: ${w.pers} ${peB}`], r.verdict, r.reason);
  }
  {
    const r = cheat(suB, peA, lang);
    add("soul-b-personality-a", { a: `${w.pers} ${peA}`, b: `${w.soul} ${suB}` },
      [`${nB}: ${w.soul} ${suB}`, `${nA}: ${w.pers} ${peA}`], r.verdict, r.reason);
  }
  // 6. Lecții karmice
  {
    const kA = karmicLessons(nA), kB = karmicLessons(nB);
    const fA = letterFrequency(nA, PYTHAGOREAN), fB = letterFrequency(nB, PYTHAGOREAN);
    const c = coverage(kA, (d) => fB[d] > 0, kB, (d) => fA[d] > 0);
    add("karmic-lessons", { a: `${w.missing}: ${set(kA, lang)}`, b: `${w.missing}: ${set(kB, lang)}` },
      [`${nA}: ${w.missing} ${set(kA, lang)} → ${nB}: ${set(c.coveredA, lang)}`,
       `${nB}: ${w.missing} ${set(kB, lang)} → ${nA}: ${set(c.coveredB, lang)}`],
      c.verdict, c.total === 0 ? w.nothingMissing : w.covered(c.covered, c.total));
  }
  // 7a. Lo Shu
  {
    const gA = generateLoShuGrid(personA.birthDate), gB = generateLoShuGrid(personB.birthDate);
    const c = coverage(gA.missingNumbers, (d) => gB.presentNumbers.includes(d), gB.missingNumbers, (d) => gA.presentNumbers.includes(d));
    add("lo-shu", { a: `${w.missing}: ${set(gA.missingNumbers, lang)}`, b: `${w.missing}: ${set(gB.missingNumbers, lang)}` },
      [`${nA}: ${w.missing} ${set(gA.missingNumbers, lang)} → ${nB}: ${set(c.coveredA, lang)}`,
       `${nB}: ${w.missing} ${set(gB.missingNumbers, lang)} → ${nA}: ${set(c.coveredB, lang)}`],
      c.verdict, c.total === 0 ? w.nothingMissing : w.covered(c.covered, c.total));
  }
  // 7b. Psihomatrice
  {
    const pA = psychomatrix(bA), pB = psychomatrix(bB);
    const c = coverage(pA.missing, (d) => pB.counts[d] > 0, pB.missing, (d) => pA.counts[d] > 0);
    add("psychomatrix", { a: `${w.missing}: ${set(pA.missing, lang)}`, b: `${w.missing}: ${set(pB.missing, lang)}` },
      [`${nA}: ${pA.working.join(", ")} · ${w.missing} ${set(pA.missing, lang)} → ${nB}: ${set(c.coveredA, lang)}`,
       `${nB}: ${pB.working.join(", ")} · ${w.missing} ${set(pB.missing, lang)} → ${nA}: ${set(c.coveredB, lang)}`],
      c.verdict, c.total === 0 ? w.nothingMissing : w.covered(c.covered, c.total));
  }
  // 8. Vedic, două tabele
  {
    const mA = mulank(bA), mB = mulank(bB);
    const relOf = (t: RelTable, x: number, y: number): Rel =>
      t[x]?.friends.includes(y) ? "friend" : t[x]?.enemies.includes(y) ? "enemy" : "neutral";
    for (const [id, table] of [["vedic-app", VEDIC_RELATIONS], ["vedic-grahai", GRAHAI]] as const) {
      const ab = relOf(table, mA, mB), ba = relOf(table, mB, mA);
      const p = MAITRI[`${ab}-${ba}`];
      const verdict: CoupleVerdict = p >= 4 ? "harmonious" : p >= 3 ? "neutral" : "challenging";
      add(id, { a: `${w.mulank} ${mA}`, b: `${w.mulank} ${mB}` },
        [`${nA}: ${w.mulank} = ${chain(bA.day, false)}`, `${nB}: ${w.mulank} = ${chain(bB.day, false)}`,
         `${mA} → ${mB}: ${w.rel[ab]} · ${mB} → ${mA}: ${w.rel[ba]} = ${p}`],
        verdict, w.maitri(w.rel[ab], w.rel[ba], p));
    }
  }
  // 9. Caldeean (Cheiro)
  {
    const cA = chaldeanName(nA), cB = chaldeanName(nB);
    const listA = getCompatibleNumbers(cA.root), listB = getCompatibleNumbers(cB.root);
    const ab = listA.includes(cB.root), ba = listB.includes(cA.root);
    add("chaldean-cheiro", { a: `${w.chaldean} ${cA.display}`, b: `${w.chaldean} ${cB.display}` },
      [`${nA}: ${chain(cA.compound, false)} · [${listA.join(", ")}]`, `${nB}: ${chain(cB.compound, false)} · [${listB.join(", ")}]`],
      ab && ba ? "harmonious" : ab || ba ? "neutral" : "challenging", w.cheiro(ab, ba));
  }
  // 10. Kua
  const skipped: Array<{ id: string; reason: string }> = [];
  if (opts.genderA && opts.genderB) {
    const kA = kuaNumber(bA.year, opts.genderA), kB = kuaNumber(bB.year, opts.genderB);
    const valid = (k: number) => k >= 1 && k <= 9;
    const grp = (g: string) => (g === "east" ? w.east : w.west);
    const ok = valid(kA.kua) && valid(kB.kua);
    const same = kA.group === kB.group;
    add("kua", { a: `${w.kua} ${kA.kua} · ${grp(kA.group)}`, b: `${w.kua} ${kB.kua} · ${grp(kB.group)}` },
      [`${nA}: ${bA.year} → ${w.kua} ${kA.kua} (${grp(kA.group)})`, `${nB}: ${bB.year} → ${w.kua} ${kB.kua} (${grp(kB.group)})`],
      !ok ? "neutral" : same ? "harmonious" : "challenging", ok ? w.kuaSays(same) : w.kuaInvalid);
  } else {
    skipped.push({ id: "kua", reason: w.kuaSkipped });
  }
  // 11. Anul personal
  {
    const year = today.getFullYear();
    const pA = personalYear(bA, year).value, pB = personalYear(bB, year).value;
    const raw = Math.abs(pA - pB), d = Math.min(raw, 9 - raw);
    add("personal-year", { a: `${w.py} ${pA}`, b: `${w.py} ${pB}` },
      [`${nA}: ${bA.month} + ${bA.day} + ${year} → ${pA}`, `${nB}: ${bB.month} + ${bB.day} + ${year} → ${pB}`],
      d === 0 ? "harmonious" : d === 1 ? "neutral" : "challenging", w.pySays(d));
  }

  // ── Întregul: cine spune ce, și unde se despart ─────────────
  const values = methods.map((m) => ({ id: m.id, value: m.verdict }));
  const groups = groupsOf(values) as Array<{ value: CoupleVerdict; ids: string[] }>;
  const counts: Record<CoupleVerdict, number> = { harmonious: 0, neutral: 0, challenging: 0 };
  for (const m of methods) counts[m.verdict]++;
  const pairs = pairwise("category", values);
  const disagreements = pairs.filter((p) => p.distance > 0).length;

  return {
    methods,
    groups,
    counts,
    pairs,
    disagreements,
    verdict: overallVerdict(pairs),
    spread: spreadOf(pairs),
    says: SAYS[lang](methods.length, counts.harmonious, counts.neutral, counts.challenging, disagreements, pairs.length),
    skipped,
  };
}
