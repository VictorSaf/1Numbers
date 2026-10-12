// Imported from the module, not the barrel: the barrel re-exports the content
// layer, which would drag arcana and archetypes into this chunk.
import { lifePath, pinnacles, challenges, lifeCycles } from './numerology-plus/pythagorean';

const toBirthDate = (d: Date) => ({ day: d.getDate(), month: d.getMonth() + 1, year: d.getFullYear() });

export interface PinnacleData {
  number: number;
  startAge: number;
  endAge: number;
  period: number; // 1-4
}

export interface ChallengeData {
  number: number;
  period: number; // 1-4
}

export interface LifeCycleData {
  stage: 'formative' | 'productive' | 'harvest';
  number: number;
  startAge: number;
  endAge: number;
}

// Calculate the 4 Pinnacle Numbers
//
// The arithmetic lives in the engine. This module used to carry its own copy,
// which reduced the month, day and year without preserving masters while
// numerology-plus preserved them -- so the same page could show two different
// Life Paths, and the pinnacle ages were computed from two different scales.
// Both now come from one place; what stays here is the shape the cards expect.
export const calculatePinnacles = (birthDate: Date): PinnacleData[] => {
  const b = toBirthDate(birthDate);
  return pinnacles(b, lifePath(b)).map((p) => ({
    number: p.value,
    startAge: p.fromAge,
    // The engine leaves the last pinnacle open; the cards want a number.
    endAge: p.toAge ?? 99,
    period: p.index,
  }));
};

// Calculate the 4 Challenge Numbers
export const calculateChallenges = (birthDate: Date): ChallengeData[] => {
  const b = toBirthDate(birthDate);
  return challenges(b, lifePath(b)).map((c) => ({ number: c.value, period: c.index }));
};

// The three Life Cycles: month, day and year of birth, each reduced on its
// own and given the same age boundaries the engine already uses for the
// first Pinnacle -- formative ends there, productive runs 27 years, harvest
// is open-ended. The engine (`lifeCycles`) has carried this since it was
// written for Pinnacles' sake; nothing in the app ever called it.
export const calculateLifeCycles = (birthDate: Date): LifeCycleData[] => {
  const b = toBirthDate(birthDate);
  return lifeCycles(b, lifePath(b)).map((c) => ({
    stage: c.name as LifeCycleData['stage'],
    number: c.value,
    startAge: c.fromAge,
    endAge: c.toAge ?? 99,
  }));
};

// What each Life Cycle stage is about, independent of its number -- the
// number's own flavour comes from PINNACLE_MEANINGS below, keyed the same way
// a Pinnacle already is: the energy of a 3 doesn't change because it's a
// cycle instead of a peak.
export const LIFE_CYCLE_STAGE_LABELS: Record<LifeCycleData['stage'], { title: { ro: string; en: string; ru: string }; description: { ro: string; en: string; ru: string } }> = {
  formative: {
    title: { ro: "Formarea", en: "The Formative Cycle", ru: "Формирующий цикл" },
    description: {
      ro: "De la naștere până aici, cifra vine din luna în care te-ai născut. E terenul pe care ai crescut, nu o alegere -- felul în care ai învățat, primele obiceiuri, ce ai luat drept normal înainte să poți compara.",
      en: "From birth to here, the number comes from the month you were born in. It's the ground you grew up on, not a choice -- how you learned, your first habits, what you took as normal before you had anything to compare it to.",
      ru: "От рождения и до этого возраста число идёт от месяца рождения. Это почва, на которой вы выросли, не выбор — то, как вы учились, первые привычки, что казалось нормой, пока не с чем было сравнить.",
    },
  },
  productive: {
    title: { ro: "Producția", en: "The Productive Cycle", ru: "Продуктивный цикл" },
    description: {
      ro: "Cei douăzeci și șapte de ani în care se construiește cea mai mare parte a unei vieți -- carieră, familie, ce rămâne după. Cifra vine din ziua nașterii: reflexul cu care acționezi când chiar contează.",
      en: "The twenty-seven years in which most of a life gets built -- career, family, what stays behind. The number comes from the day of birth: the reflex you act on when it actually matters.",
      ru: "Двадцать семь лет, в которые строится основная часть жизни — карьера, семья, то, что остаётся. Число идёт от дня рождения: рефлекс, которым вы действуете, когда это действительно важно.",
    },
  },
  harvest: {
    title: { ro: "Recolta", en: "The Harvest Cycle", ru: "Цикл жатвы" },
    description: {
      ro: "Ce rămâne, fără termen. Cifra vine din anul nașterii -- cea mai lentă dintre cele trei, și cea care judecă mai puțin cât ai făcut și mai mult ce a rezistat.",
      en: "What remains, with no end date. The number comes from the year of birth -- the slowest of the three, and the one that judges less how much you did and more what lasted.",
      ru: "То, что остаётся, без срока. Число идёт от года рождения — самое медленное из трёх, и то, что судит не столько о сделанном, сколько о том, что устояло.",
    },
  },
};

// Pinnacle interpretations
export const PINNACLE_MEANINGS: Record<number, { title: { ro: string; en: string; ru: string }; description: { ro: string; en: string; ru: string } }> = {
  1: {
    title: { ro: "Independență și Inițiativă", en: "Independence and Initiative", ru: "Независимость и Инициатива" },
    description: {
      ro: "Această perioadă te cheamă să îți dezvolți independența și să preiei inițiativa în viață. Este timpul să îți urmezi propriile idei și să fii un lider.",
      en: "This period calls you to develop your independence and take initiative in life. It's time to follow your own ideas and be a leader.",
      ru: "Этот период призывает вас развивать независимость и проявлять инициативу в жизни. Время следовать собственным идеям и быть лидером."
    }
  },
  2: {
    title: { ro: "Cooperare și Diplomație", en: "Cooperation and Diplomacy", ru: "Сотрудничество и Дипломатия" },
    description: {
      ro: "Perioada pune accent pe parteneriate, răbdare și sensibilitate. Succesul vine prin colaborare și înțelegerea nevoilor altora.",
      en: "This period emphasizes partnerships, patience, and sensitivity. Success comes through collaboration and understanding others' needs.",
      ru: "Период делает акцент на партнёрстве, терпении и чувствительности. Успех приходит через сотрудничество и понимание потребностей других."
    }
  },
  3: {
    title: { ro: "Expresie Creativă", en: "Creative Expression", ru: "Творческое Выражение" },
    description: {
      ro: "O perioadă de creativitate, bucurie și auto-exprimare. Este momentul să îți dezvolți talentele artistice și să comunici cu lumea.",
      en: "A period of creativity, joy, and self-expression. It's time to develop your artistic talents and communicate with the world.",
      ru: "Период творчества, радости и самовыражения. Время развивать художественные таланты и общаться с миром."
    }
  },
  4: {
    title: { ro: "Construcție și Stabilitate", en: "Building and Stability", ru: "Строительство и Стабильность" },
    description: {
      ro: "Perioadă de muncă asiduă și construire a fundamentelor solide. Disciplina și organizarea sunt esențiale pentru succes.",
      en: "A period of hard work and building solid foundations. Discipline and organization are essential for success.",
      ru: "Период упорной работы и построения прочных основ. Дисциплина и организация необходимы для успеха."
    }
  },
  5: {
    title: { ro: "Schimbare și Libertate", en: "Change and Freedom", ru: "Перемены и Свобода" },
    description: {
      ro: "O perioadă dinamică de schimbări și oportunități noi. Adaptabilitatea și curajul de a explora sunt cheile progresului.",
      en: "A dynamic period of changes and new opportunities. Adaptability and courage to explore are the keys to progress.",
      ru: "Динамичный период перемен и новых возможностей. Адаптивность и смелость исследовать — ключи к прогрессу."
    }
  },
  6: {
    title: { ro: "Responsabilitate și Armonie", en: "Responsibility and Harmony", ru: "Ответственность и Гармония" },
    description: {
      ro: "Perioadă centrată pe familie, responsabilități casnice și serviciu față de alții. Armonia în relații este prioritară.",
      en: "Period centered on family, domestic responsibilities, and service to others. Harmony in relationships is a priority.",
      ru: "Период, сосредоточенный на семье, домашних обязанностях и служении другим. Гармония в отношениях приоритетна."
    }
  },
  7: {
    title: { ro: "Introspecție și Cunoaștere", en: "Introspection and Knowledge", ru: "Самоанализ и Познание" },
    description: {
      ro: "O perioadă de căutare interioară și dezvoltare spirituală. Timpul pentru studiu, reflecție și găsirea sensului profund.",
      en: "A period of inner searching and spiritual development. Time for study, reflection, and finding deeper meaning.",
      ru: "Период внутреннего поиска и духовного развития. Время для учёбы, размышлений и поиска глубокого смысла."
    }
  },
  8: {
    title: { ro: "Realizare și Abundență", en: "Achievement and Abundance", ru: "Достижение и Изобилие" },
    description: {
      ro: "Perioadă de succes material și recunoaștere. Abilitățile de leadership și viziunea de afaceri sunt recompensate.",
      en: "Period of material success and recognition. Leadership abilities and business vision are rewarded.",
      ru: "Период материального успеха и признания. Лидерские способности и деловое видение вознаграждаются."
    }
  },
  9: {
    title: { ro: "Compasiune și Finalizare", en: "Compassion and Completion", ru: "Сострадание и Завершение" },
    description: {
      ro: "O perioadă de generozitate, eliberare și serviciu umanitar. Timpul pentru a încheia cicluri vechi și a ajuta pe alții.",
      en: "A period of generosity, release, and humanitarian service. Time to close old cycles and help others.",
      ru: "Период щедрости, освобождения и гуманитарного служения. Время закрыть старые циклы и помогать другим."
    }
  },
  11: {
    title: { ro: "Iluminare și Inspirație", en: "Illumination and Inspiration", ru: "Просветление и Вдохновение" },
    description: {
      ro: "O perioadă master de intuiție intensificată și inspirație spirituală. Ești chemat să iluminezi calea altora.",
      en: "A master period of heightened intuition and spiritual inspiration. You are called to illuminate the path for others.",
      ru: "Мастер-период обострённой интуиции и духовного вдохновения. Вы призваны освещать путь другим."
    }
  },
  22: {
    title: { ro: "Construcție Maestră", en: "Master Building", ru: "Мастерское Строительство" },
    description: {
      ro: "Perioadă de manifestare la scară largă. Ai potențialul de a crea proiecte care să beneficieze mulți oameni.",
      en: "Period of large-scale manifestation. You have the potential to create projects that benefit many people.",
      ru: "Период крупномасштабного проявления. У вас есть потенциал создавать проекты, которые принесут пользу многим."
    }
  },
  33: {
    title: { ro: "Învățătură și Vindecare", en: "Teaching and Healing", ru: "Обучение и Исцеление" },
    description: {
      ro: "Cea mai înaltă vibrație a pinnacle-urilor. O chemare pentru a fi un ghid spiritual și vindecător pentru umanitate.",
      en: "The highest vibration of pinnacles. A calling to be a spiritual guide and healer for humanity.",
      ru: "Высшая вибрация вершин. Призвание быть духовным наставником и целителем для человечества."
    }
  }
};

// Challenge interpretations (0-8)
export const CHALLENGE_MEANINGS: Record<number, { title: { ro: string; en: string; ru: string }; description: { ro: string; en: string; ru: string } }> = {
  0: {
    title: { ro: "Alegerea Liberă", en: "Free Choice", ru: "Свободный Выбор" },
    description: {
      ro: "Provocarea 0 este rară și specială. Ai de-a face cu toate provocările și niciuna simultan. Libertatea de alegere este și binecuvântare și responsabilitate.",
      en: "Challenge 0 is rare and special. You deal with all challenges and none simultaneously. Freedom of choice is both a blessing and responsibility.",
      ru: "Вызов 0 редкий и особенный. Вы имеете дело со всеми вызовами и ни с одним одновременно. Свобода выбора — благословение и ответственность."
    }
  },
  1: {
    title: { ro: "Încredere în Sine", en: "Self-Confidence", ru: "Уверенность в Себе" },
    description: {
      ro: "Lecția este să îți dezvolți încrederea în sine și independența. Evită extremele de agresivitate sau pasivitate.",
      en: "The lesson is to develop self-confidence and independence. Avoid extremes of aggressiveness or passivity.",
      ru: "Урок — развить уверенность в себе и независимость. Избегайте крайностей агрессивности или пассивности."
    }
  },
  2: {
    title: { ro: "Sensibilitate și Cooperare", en: "Sensitivity and Cooperation", ru: "Чувствительность и Сотрудничество" },
    description: {
      ro: "Provocarea este să găsești echilibrul între sensibilitate și forță. Învață să cooperezi fără a te pierde pe tine.",
      en: "The challenge is to find balance between sensitivity and strength. Learn to cooperate without losing yourself.",
      ru: "Вызов — найти баланс между чувствительностью и силой. Научитесь сотрудничать, не теряя себя."
    }
  },
  3: {
    title: { ro: "Exprimare Autentică", en: "Authentic Expression", ru: "Подлинное Выражение" },
    description: {
      ro: "Lecția este să îți exprimi creativitatea și emoțiile într-un mod sănătos. Evită auto-critica excesivă.",
      en: "The lesson is to express your creativity and emotions in a healthy way. Avoid excessive self-criticism.",
      ru: "Урок — выражать творчество и эмоции здоровым образом. Избегайте чрезмерной самокритики."
    }
  },
  4: {
    title: { ro: "Ordine și Disciplină", en: "Order and Discipline", ru: "Порядок и Дисциплина" },
    description: {
      ro: "Provocarea este să găsești echilibrul între muncă și viață. Învață să construiești fără a deveni rigid.",
      en: "The challenge is to find balance between work and life. Learn to build without becoming rigid.",
      ru: "Вызов — найти баланс между работой и жизнью. Научитесь строить, не становясь жёстким."
    }
  },
  5: {
    title: { ro: "Libertate Responsabilă", en: "Responsible Freedom", ru: "Ответственная Свобода" },
    description: {
      ro: "Lecția este să îți folosești libertatea cu înțelepciune. Evită excesele și impulsivitatea distructivă.",
      en: "The lesson is to use your freedom wisely. Avoid excess and destructive impulsivity.",
      ru: "Урок — мудро использовать свободу. Избегайте излишеств и разрушительной импульсивности."
    }
  },
  6: {
    title: { ro: "Responsabilitate Echilibrată", en: "Balanced Responsibility", ru: "Сбалансированная Ответственность" },
    description: {
      ro: "Provocarea este să ai grijă de alții fără a te neglija pe tine. Evită perfecționismul și controlul excesiv.",
      en: "The challenge is to care for others without neglecting yourself. Avoid perfectionism and excessive control.",
      ru: "Вызов — заботиться о других, не пренебрегая собой. Избегайте перфекционизма и чрезмерного контроля."
    }
  },
  7: {
    title: { ro: "Încredere și Deschidere", en: "Trust and Openness", ru: "Доверие и Открытость" },
    description: {
      ro: "Lecția este să găsești echilibrul între analiză și intuiție. Evită izolarea și scepticismul excesiv.",
      en: "The lesson is to find balance between analysis and intuition. Avoid isolation and excessive skepticism.",
      ru: "Урок — найти баланс между анализом и интуицией. Избегайте изоляции и чрезмерного скептицизма."
    }
  },
  8: {
    title: { ro: "Putere și Integritate", en: "Power and Integrity", ru: "Сила и Честность" },
    description: {
      ro: "Provocarea este să folosești puterea și resursele cu integritate. Evită materialismul și manipularea.",
      en: "The challenge is to use power and resources with integrity. Avoid materialism and manipulation.",
      ru: "Вызов — использовать силу и ресурсы честно. Избегайте материализма и манипуляций."
    }
  }
};
