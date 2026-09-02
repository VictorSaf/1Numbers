import type { Lang } from "@/lib/numerology-plus/content/arcana";

/**
 * Cele nouă graha, pe trei limbi.
 *
 * `NAVAGRAHA` din systems.ts poartă planeta, ziua și piatra numai în română --
 * de-aia pagina vedică arată „safir galben" și „joi" și cititorului englez.
 * Bugul e vechi și nu se repară aici; ce se repară aici e să nu-l duc în capul
 * hărții, unde ar fi primul lucru pe care îl vede omul.
 *
 * Numele sanscrit lipsește dinadins: Guru e Guru în orice limbă, iar systems.ts
 * îl are deja.
 */

export interface Graha {
  planet: string;
  day: string | null;
  gem: string;
}

export const NAVAGRAHA_I18N: Record<Lang, Record<number, Graha>> = {
  ro: {
    1: { planet: "Soare", day: "duminică", gem: "rubin" },
    2: { planet: "Lună", day: "luni", gem: "perlă" },
    3: { planet: "Jupiter", day: "joi", gem: "safir galben" },
    4: { planet: "Rahu", day: null, gem: "hessonit" },
    5: { planet: "Mercur", day: "miercuri", gem: "smarald" },
    6: { planet: "Venus", day: "vineri", gem: "diamant" },
    7: { planet: "Ketu", day: null, gem: "ochi-de-pisică" },
    8: { planet: "Saturn", day: "sâmbătă", gem: "safir albastru" },
    9: { planet: "Marte", day: "marți", gem: "coral roșu" },
  },
  en: {
    1: { planet: "Sun", day: "Sunday", gem: "ruby" },
    2: { planet: "Moon", day: "Monday", gem: "pearl" },
    3: { planet: "Jupiter", day: "Thursday", gem: "yellow sapphire" },
    4: { planet: "Rahu", day: null, gem: "hessonite" },
    5: { planet: "Mercury", day: "Wednesday", gem: "emerald" },
    6: { planet: "Venus", day: "Friday", gem: "diamond" },
    7: { planet: "Ketu", day: null, gem: "cat's eye" },
    8: { planet: "Saturn", day: "Saturday", gem: "blue sapphire" },
    9: { planet: "Mars", day: "Tuesday", gem: "red coral" },
  },
  ru: {
    1: { planet: "Солнце", day: "воскресенье", gem: "рубин" },
    2: { planet: "Луна", day: "понедельник", gem: "жемчуг" },
    3: { planet: "Юпитер", day: "четверг", gem: "жёлтый сапфир" },
    4: { planet: "Раху", day: null, gem: "гессонит" },
    5: { planet: "Меркурий", day: "среда", gem: "изумруд" },
    6: { planet: "Венера", day: "пятница", gem: "алмаз" },
    7: { planet: "Кету", day: null, gem: "кошачий глаз" },
    8: { planet: "Сатурн", day: "суббота", gem: "синий сапфир" },
    9: { planet: "Марс", day: "вторник", gem: "красный коралл" },
  },
};
