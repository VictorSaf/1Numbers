import { calculateLifePathNumber } from "./numerology";
// Imported from the module, not the barrel: the barrel re-exports the content
// layer, which would drag arcana and archetypes into this chunk.
import {
  personalYear as personalYearPlus,
  personalMonth as personalMonthPlus,
  personalDay as personalDayPlus,
  universalMonth as universalMonthPlus,
  universalDay as universalDayPlus,
} from './numerology-plus/pythagorean';

const toBirthDate = (d: Date) => ({ day: d.getDate(), month: d.getMonth() + 1, year: d.getFullYear() });

// The personal and universal cycles.
//
// These were written out three times -- here, in predictions.ts and again in
// businessNumerology.ts -- and the third copy preserved master numbers, which
// its own compatibility lookup had no keys for, so a master universal day
// scored as incompatible without saying so. One source now: the engine.
// predictions.ts imports these rather than keeping its own.

// Calculate Personal Month Number
export const calculatePersonalMonthNumber = (
  birthDate: Date,
  year: number = new Date().getFullYear(),
  month: number = new Date().getMonth() + 1
): number => personalMonthPlus(personalYearPlus(toBirthDate(birthDate), year), month).value;

// Calculate Personal Day Number
export const calculatePersonalDayNumber = (
  birthDate: Date,
  targetDate: Date = new Date()
): number => {
  const b = toBirthDate(birthDate);
  const py = personalYearPlus(b, targetDate.getFullYear());
  const pm = personalMonthPlus(py, targetDate.getMonth() + 1);
  return personalDayPlus(pm, targetDate.getDate()).value;
};

// Calculate Universal Month
export const calculateUniversalMonth = (
  year: number = new Date().getFullYear(),
  month: number = new Date().getMonth() + 1
): number => universalMonthPlus(year, month).value;

// Calculate Universal Day
export const calculateUniversalDay = (date: Date = new Date()): number =>
  universalDayPlus(date.getFullYear(), date.getMonth() + 1, date.getDate()).value;

export const PERSONAL_CYCLE_MEANINGS: Record<number, {
  keywords: { ro: string; en: string; ru: string };
  dayMeaning: { ro: string; en: string; ru: string };
  monthMeaning: { ro: string; en: string; ru: string };
}> = {
  1: {
    keywords: { ro: "Începuturi, Inițiativă", en: "Beginnings, Initiative", ru: "Начинания, Инициатива" },
    dayMeaning: {
      ro: "Zi excelentă pentru a începe proiecte noi, a lua inițiativa și a te afirma.",
      en: "Excellent day to start new projects, take initiative, and assert yourself.",
      ru: "Отличный день для начала новых проектов, проявления инициативы и самоутверждения."
    },
    monthMeaning: {
      ro: "Lună de noi începuturi. Plantează semințele pentru ceea ce vrei să crească.",
      en: "Month of new beginnings. Plant seeds for what you want to grow.",
      ru: "Месяц новых начинаний. Сейте семена того, что хотите вырастить."
    }
  },
  2: {
    keywords: { ro: "Cooperare, Răbdare", en: "Cooperation, Patience", ru: "Сотрудничество, Терпение" },
    dayMeaning: {
      ro: "Zi pentru diplomație, parteneriate și detalii. Evită deciziile grăbite.",
      en: "Day for diplomacy, partnerships, and details. Avoid hasty decisions.",
      ru: "День для дипломатии, партнёрства и деталей. Избегайте поспешных решений."
    },
    monthMeaning: {
      ro: "Lună pentru construirea relațiilor și acordarea atenției la detalii.",
      en: "Month for building relationships and paying attention to details.",
      ru: "Месяц для построения отношений и внимания к деталям."
    }
  },
  3: {
    keywords: { ro: "Creativitate, Expresie", en: "Creativity, Expression", ru: "Творчество, Выражение" },
    dayMeaning: {
      ro: "Zi excelentă pentru activități creative, socializare și exprimarea ideilor.",
      en: "Excellent day for creative activities, socializing, and expressing ideas.",
      ru: "Отличный день для творчества, общения и выражения идей."
    },
    monthMeaning: {
      ro: "Lună de exprimare creativă și bucurie. Lasă-ți imaginația să zboare.",
      en: "Month of creative expression and joy. Let your imagination soar.",
      ru: "Месяц творческого самовыражения и радости. Дайте волю воображению."
    }
  },
  4: {
    keywords: { ro: "Muncă, Fundament", en: "Work, Foundation", ru: "Работа, Основа" },
    dayMeaning: {
      ro: "Zi pentru muncă practică, organizare și construirea fundamentelor solide.",
      en: "Day for practical work, organization, and building solid foundations.",
      ru: "День для практической работы, организации и построения прочных основ."
    },
    monthMeaning: {
      ro: "Lună de efort susținut. Construiește cu răbdare și disciplină.",
      en: "Month of sustained effort. Build with patience and discipline.",
      ru: "Месяц устойчивых усилий. Стройте с терпением и дисциплиной."
    }
  },
  5: {
    keywords: { ro: "Schimbare, Aventură", en: "Change, Adventure", ru: "Перемены, Приключения" },
    dayMeaning: {
      ro: "Zi pentru schimbări, călătorii și experiențe noi. Fii flexibil.",
      en: "Day for changes, travel, and new experiences. Be flexible.",
      ru: "День для перемен, путешествий и нового опыта. Будьте гибкими."
    },
    monthMeaning: {
      ro: "Lună de libertate și schimbare. Îmbrățișează oportunitățile neașteptate.",
      en: "Month of freedom and change. Embrace unexpected opportunities.",
      ru: "Месяц свободы и перемен. Используйте неожиданные возможности."
    }
  },
  6: {
    keywords: { ro: "Familie, Responsabilitate", en: "Family, Responsibility", ru: "Семья, Ответственность" },
    dayMeaning: {
      ro: "Zi pentru familie, casă și responsabilități domestice. Arată-ți grija.",
      en: "Day for family, home, and domestic responsibilities. Show your care.",
      ru: "День для семьи, дома и домашних обязанностей. Проявите заботу."
    },
    monthMeaning: {
      ro: "Lună pentru îngrijirea relațiilor și a casei. Armonia este prioritară.",
      en: "Month for nurturing relationships and home. Harmony is a priority.",
      ru: "Месяц для заботы об отношениях и доме. Гармония приоритетна."
    }
  },
  7: {
    keywords: { ro: "Reflecție, Studiu", en: "Reflection, Study", ru: "Размышление, Учёба" },
    dayMeaning: {
      ro: "Zi pentru introspecție, studiu și activități solitare. Caută înțelepciune.",
      en: "Day for introspection, study, and solitary activities. Seek wisdom.",
      ru: "День для самоанализа, учёбы и уединённых занятий. Ищите мудрость."
    },
    monthMeaning: {
      ro: "Lună pentru reflecție și creștere spirituală. Ia-ți timp pentru tine.",
      en: "Month for reflection and spiritual growth. Take time for yourself.",
      ru: "Месяц для размышлений и духовного роста. Уделите время себе."
    }
  },
  8: {
    keywords: { ro: "Realizare, Afaceri", en: "Achievement, Business", ru: "Достижение, Бизнес" },
    dayMeaning: {
      ro: "Zi excelentă pentru afaceri, negocieri și decizii financiare importante.",
      en: "Excellent day for business, negotiations, and important financial decisions.",
      ru: "Отличный день для бизнеса, переговоров и важных финансовых решений."
    },
    monthMeaning: {
      ro: "Lună de realizări și recunoaștere. Concentrează-te pe obiective materiale.",
      en: "Month of achievements and recognition. Focus on material goals.",
      ru: "Месяц достижений и признания. Сосредоточьтесь на материальных целях."
    }
  },
  9: {
    keywords: { ro: "Finalizare, Compasiune", en: "Completion, Compassion", ru: "Завершение, Сострадание" },
    dayMeaning: {
      ro: "Zi pentru finalizarea proiectelor, generozitate și eliberarea a ceea ce nu mai servește.",
      en: "Day for completing projects, generosity, and releasing what no longer serves.",
      ru: "День для завершения проектов, щедрости и освобождения от ненужного."
    },
    monthMeaning: {
      ro: "Lună de încheiere și tranziție. Pregătește-te pentru un nou ciclu.",
      en: "Month of closure and transition. Prepare for a new cycle.",
      ru: "Месяц завершения и перехода. Готовьтесь к новому циклу."
    }
  }
};

/**
 * Calculate detailed 9-year life cycles.
 * Each cycle represents a phase of personal growth and development.
 * @param birthDate - Birth date
 * @param startYear - Starting year for cycles (default: birth year)
 * @returns Array of 9-year cycle information
 */
export interface LifeCycleData {
  cycleNumber: number; // 1-9
  startYear: number;
  endYear: number;
  cycleYear: number; // Personal year within cycle (1-9)
  currentYear: number; // Current year in cycle
  theme: { ro: string; en: string; ru: string };
}

export const calculateLifeCycles = (
  birthDate: Date,
  startYear: number = birthDate.getFullYear()
): LifeCycleData[] => {
  const cycles: LifeCycleData[] = [];
  const lifePath = calculateLifePathNumber(birthDate);
  
  // Each cycle is 9 years
  for (let cycle = 1; cycle <= 9; cycle++) {
    const cycleStartYear = startYear + (cycle - 1) * 9;
    const cycleEndYear = cycleStartYear + 8;
    
    // Calculate current year in cycle (if applicable)
    const currentYear = new Date().getFullYear();
    const currentYearInCycle = currentYear >= cycleStartYear && currentYear <= cycleEndYear
      ? (currentYear - cycleStartYear + 1)
      : 0;
    
    cycles.push({
      cycleNumber: cycle,
      startYear: cycleStartYear,
      endYear: cycleEndYear,
      cycleYear: cycle,
      currentYear: currentYearInCycle,
      theme: getCycleTheme(cycle)
    });
  }
  
  return cycles;
};

/**
 * Get theme for a life cycle number (1-9).
 */
const getCycleTheme = (cycleNum: number): { ro: string; en: string; ru: string } => {
  const themes: Record<number, { ro: string; en: string; ru: string }> = {
    1: {
      ro: "Ciclu de începuturi și inițiativă",
      en: "Cycle of beginnings and initiative",
      ru: "Цикл начинаний и инициативы"
    },
    2: {
      ro: "Ciclu de cooperare și parteneriat",
      en: "Cycle of cooperation and partnership",
      ru: "Цикл сотрудничества и партнёрства"
    },
    3: {
      ro: "Ciclu de creativitate și expresie",
      en: "Cycle of creativity and expression",
      ru: "Цикл творчества и выражения"
    },
    4: {
      ro: "Ciclu de construcție și stabilitate",
      en: "Cycle of building and stability",
      ru: "Цикл строительства и стабильности"
    },
    5: {
      ro: "Ciclu de schimbare și libertate",
      en: "Cycle of change and freedom",
      ru: "Цикл перемен и свободы"
    },
    6: {
      ro: "Ciclu de responsabilitate și armonie",
      en: "Cycle of responsibility and harmony",
      ru: "Цикл ответственности и гармонии"
    },
    7: {
      ro: "Ciclu de introspecție și înțelepciune",
      en: "Cycle of introspection and wisdom",
      ru: "Цикл самоанализа и мудрости"
    },
    8: {
      ro: "Ciclu de realizare și abundență",
      en: "Cycle of achievement and abundance",
      ru: "Цикл достижений и изобилия"
    },
    9: {
      ro: "Ciclu de finalizare și compasiune",
      en: "Cycle of completion and compassion",
      ru: "Цикл завершения и сострадания"
    }
  };
  
  return themes[cycleNum] || themes[1];
};
