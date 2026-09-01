import { fullPythagoreanProfile } from "@/lib/numerology-plus/pythagorean";
import { toBirthDate } from "@/lib/numerology-plus/core";
import { ARCHETYPES } from "@/lib/numerology-plus/content/archetypes";
import { contradictions } from "@/lib/numerology-plus/content/contradiction";
import { interpretLetters } from "@/lib/numerology-plus/content/interpret";
import { calculatePersonalYearNumber } from "@/lib/numerology";

export type ThreadLang = "ro" | "en" | "ru";

export interface ThreadStep {
  key: string;
  /** Eticheta mică de deasupra: ce fel de lucru urmează. */
  kicker: string;
  /** Propoziția mare. E conținutul, nu un subtitlu. */
  say: string;
  /** Semnătura: cifra sau cifrele, mici, sub text. */
  figures: string;
  /** Cum se numește lucrul. */
  name: string;
  /** De unde vine cifra, pentru cine n-a auzit niciodată de ea. */
  plain: string;
  /** Numele arhetipului: Protectorul, Liderul. Cifra capătă chip. */
  title?: string;
  /** Patru cuvinte care o încadrează dintr-o privire. */
  keywords?: string[];
  /** Cum arată când funcționează. */
  works?: string;
  /** Cum arată același lucru când se strică. Partea căutată. */
  breaks?: string;
  /** Câte o linie pentru fiecare cifră, când pasul poartă mai multe. */
  details?: string[];
  /** Ce urmează. Fără el, „continuă" nu e o invitație. */
  teaser?: string;
  /** Cât de departe de obișnuit e faptul ăsta. Ancora nu concurează. */
  rank: number;
}

/**
 * Firul: harta spusă pe rând, în ordinea în care te distinge.
 *
 * De ce o ordine și nu un panou: unsprezece blocuri deodată, fiecare o cifră
 * fără propoziție, nu se citesc -- se privesc și se abandonează. Un lucru pe
 * rând se citește.
 *
 * De ce ordinea diferă de la om la om: un Drum al Vieții 6 fără nimic în jur e
 * banal. O datorie karmică nu e. O punte de 6 între Suflet și Personalitate nu
 * e. Rangul măsoară exact asta -- cât de departe de obișnuit e faptul -- și
 * folosește semnale pe care motorul le calcula deja, fără să adauge vreunul.
 *
 * De ce textele nu se scriu aici: vin din arhetipuri, contradicții și
 * interpretări, adică din aceeași sursă ca pagina de rezultat. Dacă s-ar scrie
 * separat, harta și firul ar ajunge să spună lucruri diferite despre același
 * număr, iar divergența n-ar cădea niciun test.
 */

const KICKERS: Record<string, Record<ThreadLang, string>> = {
  anchor: { ro: "unde începe totul", en: "where it all starts", ru: "с чего всё начинается" },
  tension: {
    ro: "două lucruri care nu se potrivesc",
    en: "two things that do not fit",
    ru: "два несовпадающих начала",
  },
  now: { ro: "ce e viu anul ăsta", en: "what is live this year", ru: "что живо в этом году" },
  missing: { ro: "ce lipsește din hartă", en: "what the map is missing", ru: "чего нет на карте" },
  repeat: { ro: "ce se repetă", en: "what repeats", ru: "что повторяется" },
  letters: { ro: "cele trei litere", en: "the three letters", ru: "три буквы" },
};

/** Explicațiile. Spun DE UNDE vine cifra, nu cum se calculează -- aia e Learn. */
const PLAIN: Record<string, Record<ThreadLang, string>> = {
  lifePath: {
    ro: "Vine din data nașterii. Spune ce fel de drum ți se repetă, orice meserie ai avea. E numărul din care se citesc toate celelalte.",
    en: "It comes from your birth date. It says what kind of road keeps repeating for you, whatever work you do. Every other number is read against it.",
    ru: "Происходит из даты рождения. Говорит, какая дорога повторяется у вас, кем бы вы ни работали. Все остальные числа читаются через него.",
  },
  bridgeSoulPersonality: {
    ro: "Sufletul vine din vocalele numelui: ce vrei când nu te vede nimeni. Personalitatea vine din consoane: cum te văd ceilalți. Când cele două nu spun același lucru, distanța se simte zilnic.",
    en: "The Soul Urge comes from the vowels of your name: what you want when no one is watching. The Personality comes from the consonants: how others read you. When the two disagree, you feel the distance daily.",
    ru: "Душа — из гласных имени: чего вы хотите, когда вас никто не видит. Личность — из согласных: какими вас видят. Когда они расходятся, разрыв ощущается ежедневно.",
  },
  bridgeLifePathExpression: {
    ro: "Drumul vine din data nașterii, Destinul din toate literele numelui. Unul spune ce ți se întâmplă, celălalt ce ai de făcut. Când se bat cap în cap, munca pare mereu pe lângă.",
    en: "The Life Path comes from your birth date, the Expression from every letter of your name. One says what happens to you, the other what you are to do. When they pull apart, the work always feels slightly beside the point.",
    ru: "Путь — из даты рождения, Судьба — из всех букв имени. Одно говорит, что с вами происходит, другое — что вам делать. Когда они расходятся, работа всегда кажется не вполне своей.",
  },
  personalYear: {
    ro: "Se schimbă în fiecare an și merge de la 1 la 9. Spune în ce parte a unui ciclu de nouă ani ești: 1 e semănatul, 9 e încheierea.",
    en: "It changes every year and runs from 1 to 9. It says where in a nine-year cycle you stand: 1 is sowing, 9 is closing.",
    ru: "Меняется каждый год и идёт от 1 до 9. Говорит, в какой части девятилетнего цикла вы находитесь: 1 — посев, 9 — завершение.",
  },
  karmicLessons: {
    ro: "Fiecare literă din nume are o cifră. Cele care nu apar deloc sunt lucrurile care nu ți-au venit natural — se învață, nu se primesc.",
    en: "Every letter in your name carries a digit. The ones that never appear are what did not come to you naturally — they are learned, not given.",
    ru: "Каждая буква имени несёт цифру. Те, что не появляются вовсе, — это то, что не далось само: этому учатся, а не получают.",
  },
  hiddenPassion: {
    ro: "Cifra care apare cel mai des în numele tău. Nu o alegi — e felul în care funcționezi când nu te gândești la asta.",
    en: "The digit that appears most often in your name. You do not choose it — it is how you work when you are not thinking about it.",
    ru: "Цифра, которая чаще всего встречается в вашем имени. Вы её не выбираете — так вы действуете, не задумываясь.",
  },
  letters: {
    ro: "Prima literă a prenumelui, ultima a numelui, și prima vocală. Cum intri într-un lucru, cum îl închei, și ce simți înainte să gândești.",
    en: "The first letter of your first name, the last of your surname, and the first vowel. How you enter something, how you finish it, and what you feel before you think.",
    ru: "Первая буква имени, последняя фамилии и первая гласная. Как вы входите в дело, как его завершаете и что чувствуете до мысли.",
  },
};

const NAMES: Record<string, Record<ThreadLang, string>> = {
  lifePath: { ro: "Drumul Vieții", en: "Life Path", ru: "Жизненный путь" },
  personalYear: { ro: "Anul personal", en: "Personal Year", ru: "Личный год" },
  karmicLessons: { ro: "Lecții karmice", en: "Karmic lessons", ru: "Кармические уроки" },
  hiddenPassion: { ro: "Pasiunea ascunsă", en: "Hidden Passion", ru: "Скрытая страсть" },
  letters: { ro: "Piatra de Temelie, de Vârf, Prima Vocală", en: "Cornerstone, Capstone, First Vowel", ru: "Краеугольный, Замковый, Первая гласная" },
};

const YEAR_LEAD: Record<ThreadLang, (n: number, essence: string) => string> = {
  ro: (n, e) => `Ești într-un an de ${n}: ${e}. Ce alegi acum ține până la capătul ciclului.`,
  en: (n, e) => `You are in a year of ${n}: ${e}. What you choose now lasts to the end of the cycle.`,
  ru: (n, e) => `Вы в году ${n}: ${e}. То, что вы выбираете сейчас, действует до конца цикла.`,
};

const MISSING_LEAD: Record<ThreadLang, (list: string) => string> = {
  ro: (l) => `Numele tău nu conține ${l}. Sunt lucrurile pe care nu le primești de-a gata — le înveți, sau te ocolesc toată viața.`,
  en: (l) => `Your name contains no ${l}. These are what you are not handed — you learn them, or they keep going around you.`,
  ru: (l) => `В вашем имени нет ${l}. Это то, что не даётся само — либо вы этому учитесь, либо оно обходит вас стороной.`,
};

const REPEAT_LEAD: Record<ThreadLang, (n: number, times: number, essence: string) => string> = {
  ro: (n, t, e) => `${n} apare de ${t} ori în numele tău, mai des decât orice altă cifră. E ${e} — și nu ai ales-o.`,
  en: (n, t, e) => `${n} appears ${t} times in your name, more than any other digit. It is ${e} — and you did not choose it.`,
  ru: (n, t, e) => `${n} встречается в вашем имени ${t} раза — чаще любой другой цифры. Это ${e} — и вы её не выбирали.`,
};

const JOIN: Record<ThreadLang, string> = { ro: " și ", en: " and ", ru: " и " };

/** Ce urmează, spus în trei cuvinte. Un buton fără destinație nu se apasă. */
const TEASERS: Record<string, Record<ThreadLang, string>> = {
  bridgeSoulPersonality: { ro: "ce nu se potrivește", en: "what does not fit", ru: "что не совпадает" },
  bridgeLifePathExpression: { ro: "ce nu se potrivește", en: "what does not fit", ru: "что не совпадает" },
  personalYear: { ro: "unde ești acum", en: "where you are now", ru: "где вы сейчас" },
  karmicLessons: { ro: "ce lipsește", en: "what is missing", ru: "чего не хватает" },
  hiddenPassion: { ro: "ce se repetă", en: "what repeats", ru: "что повторяется" },
  letters: { ro: "cele trei litere", en: "the three letters", ru: "три буквы" },
};

const MISSING_ONE: Record<ThreadLang, (n: number, essence: string) => string> = {
  ro: (n, e) => `Fără ${n}: ${e}. Nu-ți vine de la sine.`,
  en: (n, e) => `No ${n}: ${e}. It does not come to you on its own.`,
  ru: (n, e) => `Нет ${n}: ${e}. Само это к вам не приходит.`,
};

const archetype = (n: number) => ARCHETYPES.find((a) => a.n === n) ?? ARCHETYPES[0];

const capitalise = (t: string) => t.charAt(0).toUpperCase() + t.slice(1);

/** Esența plus umbra, compuse: ce ești, și cum se strică același lucru. */
const essenceAndShadow = (n: number, lang: ThreadLang): string => {
  const a = archetype(n);
  const essence = a.essence[lang];
  const shadow = a.shadow[lang].split(",")[0].trim();
  const cap = essence.charAt(0).toUpperCase() + essence.slice(1);
  return lang === "ro"
    ? `${cap}. Tot ea devine ${shadow}, când nu te uiți.`
    : lang === "en"
      ? `${cap}. The same thing becomes ${shadow} when you are not looking.`
      : `${cap}. То же самое становится: ${shadow} — когда вы не смотрите.`;
};

export function buildThread(
  fullName: string,
  birthDate: Date,
  lang: ThreadLang,
  today: Date = new Date(),
): ThreadStep[] {
  const b = toBirthDate(birthDate);
  const profile = fullPythagoreanProfile(fullName, b, today);
  const steps: ThreadStep[] = [];

  // Ancora. Rangul nu contează -- e scoasă din sortare și pusă prima.
  const lp = profile.core.lifePath.value;
  const lpA = archetype(lp);
  steps.push({
    key: "lifePath",
    kicker: KICKERS.anchor[lang],
    title: lpA.title[lang],
    keywords: lpA.keywords[lang],
    say: capitalise(lpA.essence[lang]) + ".",
    works: capitalise(lpA.strength[lang]) + ".",
    breaks: capitalise(lpA.shadow[lang]) + ".",
    figures: String(lp),
    name: NAMES.lifePath[lang],
    plain: PLAIN.lifePath[lang],
    rank: Number.POSITIVE_INFINITY,
  });

  // Contradicțiile: motorul le dă deja compuse, cu distanța lor.
  for (const c of contradictions(profile, lang)) {
    if (c.distance <= 0) continue;
    steps.push({
      key: c.key,
      kicker: KICKERS.tension[lang],
      say: c.text,
      figures: `${c.sides[0].value} ↔ ${c.sides[1].value}`,
      name: c.label,
      plain: PLAIN[c.key][lang],
      rank: 20 + c.distance,
    });
  }

  // Anul personal. Anii de prag -- 1 și 9 -- urcă peste ceilalți.
  const year = calculatePersonalYearNumber(birthDate, today.getFullYear());
  steps.push({
    key: "personalYear",
    kicker: KICKERS.now[lang],
    say: YEAR_LEAD[lang](year, archetype(year).essence[lang]),
    title: archetype(year).title[lang],
    keywords: archetype(year).keywords[lang],
    works: capitalise(archetype(year).strength[lang]) + ".",
    figures: String(year),
    name: NAMES.personalYear[lang],
    plain: PLAIN.personalYear[lang],
    rank: year === 1 || year === 9 ? 18 : 8,
  });

  // Ce lipsește. Cu cât lipsesc mai multe, cu atât absența spune mai mult.
  const missing = profile.extended.karmicLessons;
  if (missing.length > 0) {
    const list = missing.length === 1
      ? String(missing[0])
      : missing.slice(0, -1).join(", ") + JOIN[lang] + missing[missing.length - 1];
    steps.push({
      key: "karmicLessons",
      kicker: KICKERS.missing[lang],
      say: MISSING_LEAD[lang](list),
      figures: missing.join(" · "),
      details: missing.map((n) => MISSING_ONE[lang](n, archetype(n).essence[lang])),
      name: NAMES.karmicLessons[lang],
      plain: PLAIN.karmicLessons[lang],
      rank: 10 + missing.length * 2,
    });
  }

  // Ce se repetă. O cifră de trei ori spune mai mult decât una de două.
  const hp = profile.extended.hiddenPassion;
  if (hp.frequency >= 2) {
    steps.push({
      key: "hiddenPassion",
      kicker: KICKERS.repeat[lang],
      say: REPEAT_LEAD[lang](hp.value, hp.frequency, archetype(hp.value).essence[lang]),
      figures: `${hp.value} × ${hp.frequency}`,
      title: archetype(hp.value).title[lang],
      works: capitalise(archetype(hp.value).strength[lang]) + ".",
      breaks: capitalise(archetype(hp.value).shadow[lang]) + ".",
      name: NAMES.hiddenPassion[lang],
      plain: PLAIN.hiddenPassion[lang],
      rank: 6 + hp.frequency,
    });
  }

  // Cele trei litere. Fără semnal rar: coada firului, unde se citește cu calm.
  const letters = interpretLetters(profile, lang).flatMap((l) => (l ? [l] : []));
  if (letters.length) {
    steps.push({
      key: "letters",
      kicker: KICKERS.letters[lang],
      say: letters[0] ? letters[0].lead : "",
      details: letters.map((l) => `${l.letter} — ${l.label}: ${l.lead}`),
      figures: letters.map((l) => l.letter).join(" · "),
      name: NAMES.letters[lang],
      plain: PLAIN.letters[lang],
      rank: 2,
    });
  }

  const [anchor, ...rest] = steps;
  rest.sort((a, z) => z.rank - a.rank);
  const ordered = [anchor, ...rest];

  // Fiecare pas anunță ce urmează. Ultimul nu are ce anunța.
  return ordered.map((step, i) => {
    const next = ordered[i + 1];
    return next ? { ...step, teaser: TEASERS[next.key]?.[lang] ?? next.name } : step;
  });
}
