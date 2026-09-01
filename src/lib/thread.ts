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
  you: { ro: "cine ești, pe altă latură", en: "who you are, from another side", ru: "кто вы, с другой стороны" },
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

  // Cele nouă adăugate când firul a trecut de la a arăta o șesime din hartă la
  // a o arăta întreagă. Textele astea sunt singurul lucru scris de mână aici:
  // interpretările vin din arhetipuri, dar „de unde vine cifra” nu se poate
  // compune -- fiecare are altă rețetă.
  expression: {
    ro: "Se adună toate literele numelui tău întreg, fiecare cu cifra ei, și se reduce. E numele care ți s-a dat, nu ziua în care te-ai născut.",
    en: "Every letter of your full name gets a figure; they are added and reduced. This is the name you were given, not the day you were born.",
    ru: "Каждая буква вашего полного имени имеет цифру; их складывают и сводят. Это данное вам имя, а не день рождения.",
  },
  soulUrge: {
    ro: "Doar vocalele numelui tău. Vocalele sunt sunetele care ies fără ca gura să le oprească — de-aia li se spune partea care nu se vede din afară.",
    en: "Only the vowels of your name. Vowels are the sounds nothing in the mouth stops — which is why they stand for the part others do not see.",
    ru: "Только гласные вашего имени. Гласные — звуки, которые ничто не останавливает; поэтому они означают то, чего снаружи не видно.",
  },
  personality: {
    ro: "Doar consoanele. Ele sunt sunetele care se lovesc de ceva ca să existe — partea din tine cu care alții se lovesc prima dată.",
    en: "Only the consonants. They are the sounds that need something to strike against — the part of you others meet first.",
    ru: "Только согласные. Это звуки, которым нужно обо что-то удариться, — та часть вас, с которой другие сталкиваются первой.",
  },
  birthday: {
    ro: "Ziua din lună în care te-ai născut, redusă. E singura cifră din hartă pe care n-o poate schimba nimic: nici numele, nici anul.",
    en: "The day of the month you were born, reduced. It is the one figure nothing can change: not your name, not the year.",
    ru: "День месяца вашего рождения, сведённый к цифре. Единственное число, которое ничто не меняет: ни имя, ни год.",
  },
  maturity: {
    ro: "Drumul Vieții adunat cu Destinul. E ce iese din ele două puse împreună — de-aia se simte mai mult după patruzeci de ani decât la douăzeci.",
    en: "Your Life Path added to your Expression. It is what the two make together — which is why it shows more after forty than at twenty.",
    ru: "Жизненный путь плюс Судьба. Это то, что получается из них вместе, — поэтому оно заметнее после сорока, чем в двадцать.",
  },
  attitude: {
    ro: "Luna și ziua nașterii, adunate. Nu anul — de-aia arată reacția scurtă, cea de dinainte să apuci să gândești.",
    en: "Your birth month and day, added. Not the year — which is why it shows the quick reaction, the one before you think.",
    ru: "Месяц и день рождения, сложенные. Без года — поэтому показывает быструю реакцию, ту, что до размышления.",
  },
  balance: {
    ro: "Doar inițialele numelui tău. Se citește când lucrurile se strică — inițialele sunt ce rămâne dintr-un nume când nu mai e timp de tot.",
    en: "Only the initials of your name. It is read when things break — initials are what remains of a name when there is no time for all of it.",
    ru: "Только инициалы вашего имени. Читается, когда всё рушится: инициалы — то, что остаётся от имени, когда нет времени на целое.",
  },
  subconsciousSelf: {
    ro: "Nouă minus câte cifre lipsesc din numele tău. Cu cât ai mai multe, cu atât te descurci mai repede când ceva te ia prin surprindere.",
    en: "Nine minus how many figures are missing from your name. The more you have, the faster you cope when something takes you by surprise.",
    ru: "Девять минус число отсутствующих цифр в вашем имени. Чем их больше, тем быстрее вы справляетесь с неожиданным.",
  },
  rationalThought: {
    ro: "Primul tău prenume adunat cu ziua nașterii. Arată cum te apuci de o problemă înainte s-o rezolvi: de la fapte sau de la senzație.",
    en: "Your first name added to your birth day. It shows how you take hold of a problem before solving it: from facts, or from feel.",
    ru: "Ваше первое имя плюс день рождения. Показывает, как вы берётесь за задачу до решения: от фактов или от ощущения.",
  },
  karmicDebts: {
    ro: "Unele cifre din hartă vin din 13, 14, 16 sau 19 înainte de a fi reduse. Se numesc datorii fiindcă aceleași lucruri se întorc până sunt făcute.",
    en: "Some figures in your chart come from 13, 14, 16 or 19 before reduction. They are called debts because the same things return until they are done.",
    ru: "Некоторые числа карты происходят из 13, 14, 16 или 19 до сведения. Их зовут долгами: одно и то же возвращается, пока не сделано.",
  },
};

const NAMES: Record<string, Record<ThreadLang, string>> = {
  lifePath: { ro: "Drumul Vieții", en: "Life Path", ru: "Жизненный путь" },
  personalYear: { ro: "Anul personal", en: "Personal Year", ru: "Личный год" },
  karmicLessons: { ro: "Lecții karmice", en: "Karmic lessons", ru: "Кармические уроки" },
  hiddenPassion: { ro: "Pasiunea ascunsă", en: "Hidden Passion", ru: "Скрытая страсть" },
  letters: { ro: "Piatra de Temelie, de Vârf, Prima Vocală", en: "Cornerstone, Capstone, First Vowel", ru: "Краеугольный, Замковый, Первая гласная" },
  expression: { ro: "Destinul", en: "Expression", ru: "Судьба" },
  soulUrge: { ro: "Sufletul", en: "Soul Urge", ru: "Душа" },
  personality: { ro: "Personalitatea", en: "Personality", ru: "Личность" },
  birthday: { ro: "Ziua nașterii", en: "Birthday", ru: "День рождения" },
  maturity: { ro: "Maturitatea", en: "Maturity", ru: "Зрелость" },
  attitude: { ro: "Atitudinea", en: "Attitude", ru: "Отношение" },
  balance: { ro: "Echilibrul", en: "Balance", ru: "Равновесие" },
  subconsciousSelf: { ro: "Sinele subconștient", en: "Subconscious Self", ru: "Подсознательное Я" },
  rationalThought: { ro: "Gândirea rațională", en: "Rational Thought", ru: "Рациональное мышление" },
  karmicDebts: { ro: "Ce se întoarce", en: "What returns", ru: "Что возвращается" },
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
  you: { ro: "cine ești, pe altă latură", en: "who you are, from another side", ru: "кто вы, с другой стороны" },
};

const MISSING_ONE: Record<ThreadLang, (n: number, essence: string) => string> = {
  ro: (n, e) => `Fără ${n}: ${e}. Nu-ți vine de la sine.`,
  en: (n, e) => `No ${n}: ${e}. It does not come to you on its own.`,
  ru: (n, e) => `Нет ${n}: ${e}. Само это к вам не приходит.`,
};

const DEBT_LEAD: Record<ThreadLang, (list: number[]) => string> = {
  ro: (l) => `Harta ta poartă ${l.length === 1 ? "o datorie" : `${l.length} datorii`}: ${l.join(", ")}. Nu e o pedeapsă — e un lucru nefăcut care se tot reprogramează.`,
  en: (l) => `Your chart carries ${l.length === 1 ? "one debt" : `${l.length} debts`}: ${l.join(", ")}. Not a punishment — something undone that keeps rescheduling itself.`,
  ru: (l) => `Ваша карта несёт ${l.length === 1 ? "один долг" : `долгов: ${l.length}`}: ${l.join(", ")}. Это не наказание — несделанное, что переносится снова и снова.`,
};

const DEBT_ONE: Record<ThreadLang, (debt: number, where: string, shadow: string) => string> = {
  ro: (d, w, sh) => `${d}, pe ${w}: ${sh}`,
  en: (d, w, sh) => `${d}, on ${w}: ${sh}`,
  ru: (d, w, sh) => `${d}, на «${w}»: ${sh}`,
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

  /**
   * Restul hărții.
   *
   * Motorul calcula treizeci de lucruri și firul arăta șase: Sufletul,
   * Personalitatea și Destinul -- miezul oricărei hărți -- apăreau doar
   * înăuntrul unui pod, niciodată ca lucruri în sine. Aici se pun toate cele
   * care se compun dintr-o singură cifră, fiecare cu rangul ei.
   *
   * Rangul e distanța față de obișnuit, nu importanța. Destinul e fundamental,
   * dar îl are toată lumea; un 11 pe orice poziție e rar, deci urcă -- de-aia
   * numerele-maestru primesc un adaos.
   */
  const master = (n: number) => (n === 11 || n === 22 || n === 33 ? 9 : 0);

  const simple = (key: string, n: number, base: number) => {
    const a = archetype(n);
    steps.push({
      key,
      kicker: KICKERS.you[lang],
      title: a.title[lang],
      keywords: a.keywords[lang],
      say: capitalise(a.essence[lang]) + ".",
      works: capitalise(a.strength[lang]) + ".",
      breaks: capitalise(a.shadow[lang]) + ".",
      figures: String(n),
      name: NAMES[key][lang],
      plain: PLAIN[key][lang],
      rank: base + master(n),
    });
  };

  const core = profile.core;
  const ext = profile.extended;

  simple("expression", core.expression.value, 14);
  simple("soulUrge", core.soulUrge.value, 13);
  simple("personality", core.personality.value, 12);
  simple("maturity", ext.maturity.value, 7);
  simple("birthday", core.birthday.value, 5);
  simple("attitude", ext.attitude.value, 4);
  simple("rationalThought", ext.rationalThought.value, 4);
  simple("balance", ext.balance.value, 3);
  simple("subconsciousSelf", ext.subconsciousSelf, 3);

  // Ce se întoarce. Rar, și singurul lucru din hartă pe care oamenii îl caută
  // singuri -- deci urcă peste contradicții.
  if (profile.karmicDebts.length > 0) {
    const d = profile.karmicDebts;
    steps.push({
      key: "karmicDebts",
      kicker: KICKERS.tension[lang],
      say: DEBT_LEAD[lang](d.map((x) => x.debt)),
      details: d.map((x) => DEBT_ONE[lang](x.debt, NAMES[x.source]?.[lang] ?? x.source, archetype(x.reduced).shadow[lang])),
      figures: d.map((x) => String(x.debt)).join(" · "),
      name: NAMES.karmicDebts[lang],
      plain: PLAIN.karmicDebts[lang],
      rank: 22 + d.length,
    });
  }

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
