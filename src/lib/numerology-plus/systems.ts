/**
 * numerology-plus / systems
 * Faza B: Vedic (Ank Jyotish), Kua (Feng Shui), Kabbalah (ambele variante),
 * layer de numere compuse Chaldean.
 */

import {
  CHALDEAN, KABBALAH_SIMPLE, type BirthDate, type NumResult,
  digitSum, letters, reduce, result, sumLetters,
} from './core.js';

// ═══════════════════════════════════════════════════════════
// B1 — Numerologie Vedică (Ank Jyotish)
// ═══════════════════════════════════════════════════════════

/** Mulank / Moolank — numărul psihic. Doar ziua nașterii. Fără master. */
export function mulank(b: BirthDate): number {
  return reduce(b.day, false);
}

/**
 * Bhagyank — numărul destinului vedic.
 * ATENȚIE: sumă PLATĂ a tuturor cifrelor datei, spre deosebire de Life Path
 * pitagoreic care reduce pe segmente. Cele două pot diferi — afișează-le pe amândouă.
 */
export function bhagyank(b: BirthDate): number {
  const all = `${b.day}${b.month}${b.year}`.split('').reduce((a, d) => a + Number(d), 0);
  return reduce(all, false);
}

/** Naamank — numărul numelui. Vedic folosește tabelul CHALDEAN, nu pitagoreic. */
export function naamank(name: string): { compound: number; root: number } {
  const compound = sumLetters(name, CHALDEAN);
  return { compound, root: reduce(compound, false) };
}

export const NAVAGRAHA: Record<number, { planet: string; sanskrit: string; day: string; gem: string; color: string }> = {
  1: { planet: 'Soare',   sanskrit: 'Surya',   day: 'duminică', gem: 'rubin',              color: 'auriu / portocaliu' },
  2: { planet: 'Lună',    sanskrit: 'Chandra', day: 'luni',     gem: 'perlă',              color: 'alb / argintiu' },
  3: { planet: 'Jupiter', sanskrit: 'Guru',    day: 'joi',      gem: 'safir galben',       color: 'galben' },
  4: { planet: 'Rahu',    sanskrit: 'Rahu',    day: '—',        gem: 'hessonit (gomed)',   color: 'gri / fumuriu' },
  5: { planet: 'Mercur',  sanskrit: 'Budha',   day: 'miercuri', gem: 'smarald',            color: 'verde' },
  6: { planet: 'Venus',   sanskrit: 'Shukra',  day: 'vineri',   gem: 'diamant',            color: 'alb / roz' },
  7: { planet: 'Ketu',    sanskrit: 'Ketu',    day: '—',        gem: 'ochi-de-pisică',     color: 'multicolor' },
  8: { planet: 'Saturn',  sanskrit: 'Shani',   day: 'sâmbătă',  gem: 'safir albastru',     color: 'albastru închis / negru' },
  9: { planet: 'Marte',   sanskrit: 'Mangal',  day: 'marți',    gem: 'coral roșu',         color: 'roșu' },
};

/** Tabel prieten / neutru / dușman între numere — baza pentru name correction. */
export const VEDIC_RELATIONS: Record<number, { friends: number[]; neutral: number[]; enemies: number[] }> = {
  1: { friends: [1,2,3,9], neutral: [5,6], enemies: [4,7,8] },
  2: { friends: [1,2,5,7], neutral: [3,6], enemies: [4,8,9] },
  3: { friends: [1,3,9],   neutral: [2,5,7], enemies: [4,6,8] },
  4: { friends: [5,6,7,8], neutral: [1,2], enemies: [3,9] },
  5: { friends: [1,4,5,6], neutral: [2,3,7,8], enemies: [9] },
  6: { friends: [4,5,6,8], neutral: [1,3,7], enemies: [2,9] },
  7: { friends: [2,4,7],   neutral: [1,5,6], enemies: [3,8,9] },
  8: { friends: [4,5,6,8], neutral: [2,7], enemies: [1,3,9] },
  9: { friends: [1,3,9],   neutral: [5,7], enemies: [2,4,6,8] },
};

export function vedicProfile(name: string, b: BirthDate) {
  const m = mulank(b), bh = bhagyank(b), n = naamank(name);
  const rel = (a: number, x: number) =>
    VEDIC_RELATIONS[a]?.friends.includes(x) ? 'friend'
      : VEDIC_RELATIONS[a]?.enemies.includes(x) ? 'enemy' : 'neutral';
  return {
    mulank: m, bhagyank: bh, naamank: n,
    planets: { mulank: NAVAGRAHA[m], bhagyank: NAVAGRAHA[bh], naamank: NAVAGRAHA[n.root] },
    harmony: {
      nameToMulank: rel(m, n.root),
      nameToBhagyank: rel(bh, n.root),
      mulankToBhagyank: rel(m, bh),
    },
  };
}

// ═══════════════════════════════════════════════════════════
// B2 — Numărul Kua (Feng Shui)
// ═══════════════════════════════════════════════════════════

/** Sursele diferă pentru născuții după 2000. 'classic' = 10−/+5 pentru toți. */
export type KuaEra = 'classic' | 'century';
export const KUA_ERA: KuaEra = 'classic';

const EAST_DIRECTIONS = { shengChi: 'SE', tienYi: 'E',  nienYen: 'S',  fuWei: 'N'  };
const WEST_DIRECTIONS = { shengChi: 'NE', tienYi: 'NV', nienYen: 'V',  fuWei: 'SV' };

const DIRECTIONS_BY_KUA: Record<number, { shengChi: string; tienYi: string; nienYen: string; fuWei: string }> = {
  1: { shengChi: 'SE', tienYi: 'E',  nienYen: 'S',  fuWei: 'N'  },
  2: { shengChi: 'NE', tienYi: 'V',  nienYen: 'NV', fuWei: 'SV' },
  3: { shengChi: 'S',  tienYi: 'N',  nienYen: 'SE', fuWei: 'E'  },
  4: { shengChi: 'N',  tienYi: 'S',  nienYen: 'E',  fuWei: 'SE' },
  6: { shengChi: 'V',  tienYi: 'NE', nienYen: 'SV', fuWei: 'NV' },
  7: { shengChi: 'NV', tienYi: 'SV', nienYen: 'NE', fuWei: 'V'  },
  8: { shengChi: 'SV', tienYi: 'NV', nienYen: 'V',  fuWei: 'NE' },
  9: { shengChi: 'E',  tienYi: 'SE', nienYen: 'N',  fuWei: 'S'  },
};

export function kuaNumber(year: number, gender: 'male' | 'female', era: KuaEra = KUA_ERA) {
  const lastTwo = year % 100;
  const d = reduce(digitSum(lastTwo), false);
  const post2000 = era === 'century' && year >= 2000;
  let kua: number;
  if (gender === 'male') {
    kua = (post2000 ? 9 : 10) - d;
    if (kua <= 0) kua += 9;
    if (kua === 5) kua = 2;
  } else {
    kua = d + (post2000 ? 6 : 5);
    if (kua > 9) kua = reduce(kua, false);
    if (kua === 5) kua = 8;
  }
  const group = [1, 3, 4, 9].includes(kua) ? 'east' : 'west';
  return {
    kua, group,
    favorable: DIRECTIONS_BY_KUA[kua],
    groupDirections: group === 'east' ? EAST_DIRECTIONS : WEST_DIRECTIONS,
    convention: post2000 ? 'century (post-2000)' : 'classic (10− / +5)',
  };
}

// ═══════════════════════════════════════════════════════════
// B3 — Kabbalah (două sisteme distincte, etichetate explicit)
// ═══════════════════════════════════════════════════════════

/** B3.1 Gematria ebraică reală — valori 1–400, suma NU se reduce. */
export const HEBREW_GEMATRIA: Record<string, number> = {
  'א':1,'ב':2,'ג':3,'ד':4,'ה':5,'ו':6,'ז':7,'ח':8,'ט':9,
  'י':10,'כ':20,'ל':30,'מ':40,'נ':50,'ס':60,'ע':70,'פ':80,'צ':90,
  'ק':100,'ר':200,'ש':300,'ת':400,
  'ך':20,'ם':40,'ן':50,'ף':80,'ץ':90, // forme finale (valoare standard)
};

/** Transliterare latină→ebraică, aproximativă. Expune-o ca editabilă în UI. */
const TRANSLIT: Array<[RegExp, string]> = [
  [/SH/g,'ש'],[/CH|KH/g,'ח'],[/TS|TZ/g,'צ'],[/TH/g,'ת'],
  [/A/g,'א'],[/B|V/g,'ב'],[/G/g,'ג'],[/D/g,'ד'],[/H/g,'ה'],[/O|U|W/g,'ו'],
  [/Z/g,'ז'],[/T/g,'ט'],[/I|Y|J/g,'י'],[/K|C/g,'כ'],[/L/g,'ל'],[/M/g,'מ'],
  [/N/g,'נ'],[/S/g,'ס'],[/E/g,'ע'],[/P|F/g,'פ'],[/Q/g,'ק'],[/R/g,'ר'],[/X/g,'ש'],
];

export function hebrewGematria(name: string) {
  let s = letters(name).join('');
  for (const [re, heb] of TRANSLIT) s = s.replace(re, heb);
  const hebrew = s.split('').filter((c) => HEBREW_GEMATRIA[c] !== undefined);
  const total = hebrew.reduce((a, c) => a + HEBREW_GEMATRIA[c], 0);
  return { hebrew: hebrew.join(''), total, reduced: reduce(total, false), system: 'hebrew-gematria' as const };
}

/** B3.2 „Kabbalah" populară — mod-9 ciclic. NU are legătură cu gematria ebraică. */
export function popularKabbalah(name: string) {
  const total = sumLetters(name, KABBALAH_SIMPLE);
  const value = (total % 9) || 9;
  return { total, value, system: 'popular-mod9' as const,
    disclaimer: 'Variantă populară de piață — fără legătură cu gematria ebraică tradițională.' };
}

// ═══════════════════════════════════════════════════════════
// B5 — Chaldean cu layer de numere compuse
// ═══════════════════════════════════════════════════════════

/** Interpretarea numărului compus e ce diferențiază Chaldean de Pitagoreic. */
export const CHALDEAN_COMPOUND: Record<number, { title: string; nature: 'favorabil'|'mixt'|'dificil' }> = {
  10:{title:'Roata Norocului',nature:'favorabil'}, 11:{title:'Leul Îmblânzit',nature:'dificil'},
  12:{title:'Sacrificiul',nature:'dificil'},       13:{title:'Regresie și Schimbare',nature:'dificil'},
  14:{title:'Mișcare și Risc',nature:'mixt'},      15:{title:'Magicianul',nature:'favorabil'},
  16:{title:'Turnul Fulgerat',nature:'dificil'},   17:{title:'Steaua Magilor',nature:'favorabil'},
  18:{title:'Luna Materialismului',nature:'dificil'}, 19:{title:'Soarele',nature:'favorabil'},
  20:{title:'Trezirea',nature:'favorabil'},        21:{title:'Coroana Universului',nature:'favorabil'},
  22:{title:'Bunul Om Orb',nature:'dificil'},      23:{title:'Steaua Regală a Leului',nature:'favorabil'},
  24:{title:'Iubire și Câștig',nature:'favorabil'},25:{title:'Discernământ prin Încercare',nature:'mixt'},
  26:{title:'Parteneriate Grave',nature:'dificil'},27:{title:'Sceptrul',nature:'favorabil'},
  28:{title:'Mielul de Încredere',nature:'dificil'},29:{title:'Incertitudine',nature:'dificil'},
  30:{title:'Contemplația',nature:'mixt'},         31:{title:'Reclusul',nature:'mixt'},
  32:{title:'Comunicarea',nature:'favorabil'},     33:{title:'Ca 24',nature:'favorabil'},
  34:{title:'Ca 25',nature:'mixt'},                35:{title:'Ca 26',nature:'dificil'},
  36:{title:'Ca 27',nature:'favorabil'},           37:{title:'Prietenie și Iubire',nature:'favorabil'},
  38:{title:'Ca 29',nature:'dificil'},             39:{title:'Ca 30',nature:'mixt'},
  40:{title:'Ca 31',nature:'mixt'},                41:{title:'Ca 32',nature:'favorabil'},
  42:{title:'Ca 24',nature:'favorabil'},           43:{title:'Revoluție și Conflict',nature:'dificil'},
  44:{title:'Ca 26',nature:'dificil'},             45:{title:'Ca 27',nature:'favorabil'},
  46:{title:'Ca 37',nature:'favorabil'},           47:{title:'Ca 29',nature:'dificil'},
  48:{title:'Ca 30',nature:'mixt'},                49:{title:'Ca 31',nature:'mixt'},
  50:{title:'Ca 32',nature:'favorabil'},           51:{title:'Războinicul',nature:'favorabil'},
  52:{title:'Ca 43',nature:'dificil'},
};

export function chaldeanName(name: string) {
  const compound = sumLetters(name, CHALDEAN);
  const root = reduce(compound, false);
  return {
    compound, root,
    display: `${compound}/${root}`,
    compoundMeaning: CHALDEAN_COMPOUND[compound] ?? null,
    note: compound > 52 ? 'Peste 52 — tradiția clasică nu acoperă; se interpretează prin rădăcină.' : null,
  };
}

// ═══════════════════════════════════════════════════════════
// C6 — Biorritmuri
// ═══════════════════════════════════════════════════════════

export const BIORHYTHM_CYCLES = {
  physical: 23, emotional: 28, intellectual: 33,
  intuitive: 38, aesthetic: 43, spiritual: 53,
} as const;

export type BiorhythmKey = keyof typeof BIORHYTHM_CYCLES;

export function biorhythm(daysAlive: number, cycle: BiorhythmKey): number {
  return Math.sin((2 * Math.PI * daysAlive) / BIORHYTHM_CYCLES[cycle]);
}

export function biorhythmSeries(daysAlive: number, span = 30, cycles: BiorhythmKey[] = ['physical','emotional','intellectual']) {
  const half = Math.floor(span / 2);
  const rows = [];
  for (let off = -half; off <= half; off++) {
    const d = daysAlive + off;
    const row: Record<string, number> = { offset: off };
    for (const c of cycles) row[c] = Number(biorhythm(d, c).toFixed(4));
    row.critical = cycles.some((c) => Math.abs(biorhythm(d, c)) < 0.05) ? 1 : 0;
    rows.push(row);
  }
  return rows;
}
