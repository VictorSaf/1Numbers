/**
 * Lo Shu Grid (Chinese Numerology) - Magic Square Analysis
 *
 * The Lo Shu Grid is a 3x3 magic square where the birth date digits
 * are mapped to analyze personality traits, strengths, and weaknesses.
 *
 * Traditional Lo Shu arrangement:
 *   4 | 9 | 2
 *   ---------
 *   3 | 5 | 7
 *   ---------
 *   8 | 1 | 6
 */

import { Language } from './translations';

// Grid position for each number (row, col) - 0-indexed
export const LO_SHU_POSITIONS: Record<number, [number, number]> = {
  4: [0, 0], 9: [0, 1], 2: [0, 2],
  3: [1, 0], 5: [1, 1], 7: [1, 2],
  8: [2, 0], 1: [2, 1], 6: [2, 2],
};

// The traditional Lo Shu Grid layout
export const LO_SHU_GRID_LAYOUT = [
  [4, 9, 2],
  [3, 5, 7],
  [8, 1, 6],
];

export interface LoShuGridResult {
  grid: number[][]; // Count of each number in position
  presentNumbers: number[];
  missingNumbers: number[];
  repeatedNumbers: { number: number; count: number }[];
  planes: LoShuPlane[];
  arrows: LoShuArrow[];
  dominantElement: string;
  analysis: LoShuAnalysis;
}

export interface LoShuPlane {
  type: 'mental' | 'emotional' | 'practical' | 'thought' | 'will' | 'action';
  numbers: number[];
  strength: 'empty' | 'weak' | 'balanced' | 'strong' | 'dominant';
  meaning: Record<Language, string>;
}

export interface LoShuArrow {
  type: 'success' | 'determination' | 'spirituality' | 'frustration' | 'hesitation' | 'disappointment' | 'planner' | 'emotional' | 'activity';
  direction: 'positive' | 'negative';
  numbers: number[];
  meaning: Record<Language, string>;
}

export interface LoShuAnalysis {
  strengths: Record<Language, string[]>;
  weaknesses: Record<Language, string[]>;
  recommendations: Record<Language, string[]>;
}

export interface NumberRemedy {
  number: number;
  colors: string[];
  gemstones: Record<Language, string[]>;
  mantras: string[];
  favorableDays: Record<Language, string[]>;
  element: string;
  direction: string;
  description: Record<Language, string>;
}

/**
 * Extract digits from a birth date
 */
export const extractBirthDateDigits = (birthDate: Date): number[] => {
  const day = birthDate.getDate();
  const month = birthDate.getMonth() + 1;
  const year = birthDate.getFullYear();

  const dateString = `${day}${month}${year}`;
  return dateString.split('').map(d => parseInt(d)).filter(d => d > 0); // Exclude 0s
};

/**
 * Generate Lo Shu Grid from birth date
 */
export const generateLoShuGrid = (birthDate: Date): LoShuGridResult => {
  const digits = extractBirthDateDigits(birthDate);

  // Initialize 3x3 grid with zeros
  const grid: number[][] = [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
  ];

  // Count occurrences of each digit
  const digitCounts: Record<number, number> = {};
  for (let i = 1; i <= 9; i++) {
    digitCounts[i] = 0;
  }

  for (const digit of digits) {
    if (digit >= 1 && digit <= 9) {
      digitCounts[digit]++;
      const [row, col] = LO_SHU_POSITIONS[digit];
      grid[row][col]++;
    }
  }

  // Identify present, missing, and repeated numbers
  const presentNumbers: number[] = [];
  const missingNumbers: number[] = [];
  const repeatedNumbers: { number: number; count: number }[] = [];

  for (let i = 1; i <= 9; i++) {
    if (digitCounts[i] > 0) {
      presentNumbers.push(i);
      if (digitCounts[i] > 1) {
        repeatedNumbers.push({ number: i, count: digitCounts[i] });
      }
    } else {
      missingNumbers.push(i);
    }
  }

  // Analyze planes and arrows
  const planes = analyzePlanes(digitCounts);
  const arrows = analyzeArrows(digitCounts);
  const dominantElement = determineDominantElement(digitCounts);
  const analysis = generateAnalysis(digitCounts, planes, arrows, missingNumbers);

  return {
    grid,
    presentNumbers,
    missingNumbers,
    repeatedNumbers,
    planes,
    arrows,
    dominantElement,
    analysis,
  };
};

/**
 * Analyze horizontal and vertical planes
 */
const analyzePlanes = (digitCounts: Record<number, number>): LoShuPlane[] => {
  const planes: LoShuPlane[] = [];

  // Horizontal planes
  // Mental plane (top row): 4, 9, 2
  const mentalStrength = calculatePlaneStrength([4, 9, 2], digitCounts);
  planes.push({
    type: 'mental',
    numbers: [4, 9, 2],
    strength: mentalStrength,
    meaning: PLANE_MEANINGS.mental[mentalStrength],
  });

  // Emotional plane (middle row): 3, 5, 7
  const emotionalStrength = calculatePlaneStrength([3, 5, 7], digitCounts);
  planes.push({
    type: 'emotional',
    numbers: [3, 5, 7],
    strength: emotionalStrength,
    meaning: PLANE_MEANINGS.emotional[emotionalStrength],
  });

  // Practical plane (bottom row): 8, 1, 6
  const practicalStrength = calculatePlaneStrength([8, 1, 6], digitCounts);
  planes.push({
    type: 'practical',
    numbers: [8, 1, 6],
    strength: practicalStrength,
    meaning: PLANE_MEANINGS.practical[practicalStrength],
  });

  // Vertical planes
  // Thought plane (left column): 4, 3, 8
  const thoughtStrength = calculatePlaneStrength([4, 3, 8], digitCounts);
  planes.push({
    type: 'thought',
    numbers: [4, 3, 8],
    strength: thoughtStrength,
    meaning: PLANE_MEANINGS.thought[thoughtStrength],
  });

  // Will plane (middle column): 9, 5, 1
  const willStrength = calculatePlaneStrength([9, 5, 1], digitCounts);
  planes.push({
    type: 'will',
    numbers: [9, 5, 1],
    strength: willStrength,
    meaning: PLANE_MEANINGS.will[willStrength],
  });

  // Action plane (right column): 2, 7, 6
  const actionStrength = calculatePlaneStrength([2, 7, 6], digitCounts);
  planes.push({
    type: 'action',
    numbers: [2, 7, 6],
    strength: actionStrength,
    meaning: PLANE_MEANINGS.action[actionStrength],
  });

  return planes;
};

/**
 * Calculate plane strength based on number counts
 */
const calculatePlaneStrength = (
  numbers: number[],
  digitCounts: Record<number, number>
): 'empty' | 'weak' | 'balanced' | 'strong' | 'dominant' => {
  const total = numbers.reduce((sum, num) => sum + digitCounts[num], 0);
  const presentCount = numbers.filter(num => digitCounts[num] > 0).length;

  if (presentCount === 0) return 'empty';
  if (presentCount === 1 && total === 1) return 'weak';
  if (presentCount === 2 || total <= 3) return 'balanced';
  if (total <= 5) return 'strong';
  return 'dominant';
};

/**
 * Analyze arrows (diagonal and special combinations)
 */
const analyzeArrows = (digitCounts: Record<number, number>): LoShuArrow[] => {
  const arrows: LoShuArrow[] = [];

  // Arrow of Determination (1-5-9 diagonal) - positive
  if (hasAllNumbers([1, 5, 9], digitCounts)) {
    arrows.push({
      type: 'determination',
      direction: 'positive',
      numbers: [1, 5, 9],
      meaning: ARROW_MEANINGS.determination.positive,
    });
  } else if (hasMissingNumbers([1, 5, 9], digitCounts)) {
    arrows.push({
      type: 'hesitation',
      direction: 'negative',
      numbers: [1, 5, 9],
      meaning: ARROW_MEANINGS.determination.negative,
    });
  }

  // Arrow of Spirituality (3-5-7 diagonal) - positive
  if (hasAllNumbers([3, 5, 7], digitCounts)) {
    arrows.push({
      type: 'spirituality',
      direction: 'positive',
      numbers: [3, 5, 7],
      meaning: ARROW_MEANINGS.spirituality.positive,
    });
  } else if (hasMissingNumbers([3, 5, 7], digitCounts)) {
    arrows.push({
      type: 'frustration',
      direction: 'negative',
      numbers: [3, 5, 7],
      meaning: ARROW_MEANINGS.spirituality.negative,
    });
  }

  // Arrow of Planner (1-2-3) - horizontal
  if (hasAllNumbers([1, 2, 3], digitCounts)) {
    arrows.push({
      type: 'planner',
      direction: 'positive',
      numbers: [1, 2, 3],
      meaning: ARROW_MEANINGS.planner.positive,
    });
  }

  // Arrow of Success (4-5-6) - diagonal
  if (hasAllNumbers([4, 5, 6], digitCounts)) {
    arrows.push({
      type: 'success',
      direction: 'positive',
      numbers: [4, 5, 6],
      meaning: ARROW_MEANINGS.success.positive,
    });
  } else if (hasMissingNumbers([4, 5, 6], digitCounts)) {
    arrows.push({
      type: 'disappointment',
      direction: 'negative',
      numbers: [4, 5, 6],
      meaning: ARROW_MEANINGS.success.negative,
    });
  }

  // Arrow of Activity (7-8-9)
  if (hasAllNumbers([7, 8, 9], digitCounts)) {
    arrows.push({
      type: 'activity',
      direction: 'positive',
      numbers: [7, 8, 9],
      meaning: ARROW_MEANINGS.activity.positive,
    });
  }

  // Arrow of Emotional Balance (2-5-8) - vertical middle
  if (hasAllNumbers([2, 5, 8], digitCounts)) {
    arrows.push({
      type: 'emotional',
      direction: 'positive',
      numbers: [2, 5, 8],
      meaning: ARROW_MEANINGS.emotional.positive,
    });
  }

  return arrows;
};

const hasAllNumbers = (numbers: number[], digitCounts: Record<number, number>): boolean => {
  return numbers.every(num => digitCounts[num] > 0);
};

const hasMissingNumbers = (numbers: number[], digitCounts: Record<number, number>): boolean => {
  return numbers.every(num => digitCounts[num] === 0);
};

/**
 * Determine dominant element based on number distribution
 */
const determineDominantElement = (digitCounts: Record<number, number>): string => {
  const elementCounts: Record<string, number> = {
    fire: digitCounts[1] + digitCounts[9],
    earth: digitCounts[2] + digitCounts[5] + digitCounts[8],
    metal: digitCounts[6] + digitCounts[7],
    water: digitCounts[1] + digitCounts[6], // Also associated with water
    wood: digitCounts[3] + digitCounts[4],
  };

  let maxElement = 'earth';
  let maxCount = 0;

  for (const [element, count] of Object.entries(elementCounts)) {
    if (count > maxCount) {
      maxCount = count;
      maxElement = element;
    }
  }

  return maxElement;
};

/**
 * Generate comprehensive analysis
 */
const generateAnalysis = (
  digitCounts: Record<number, number>,
  planes: LoShuPlane[],
  arrows: LoShuArrow[],
  missingNumbers: number[]
): LoShuAnalysis => {
  const strengths: Record<Language, string[]> = { ro: [], en: [], ru: [] };
  const weaknesses: Record<Language, string[]> = { ro: [], en: [], ru: [] };
  const recommendations: Record<Language, string[]> = { ro: [], en: [], ru: [] };

  // Analyze based on planes
  for (const plane of planes) {
    if (plane.strength === 'strong' || plane.strength === 'dominant') {
      strengths.ro.push(plane.meaning.ro);
      strengths.en.push(plane.meaning.en);
      strengths.ru.push(plane.meaning.ru);
    } else if (plane.strength === 'empty' || plane.strength === 'weak') {
      weaknesses.ro.push(plane.meaning.ro);
      weaknesses.en.push(plane.meaning.en);
      weaknesses.ru.push(plane.meaning.ru);
    }
  }

  // Analyze based on arrows
  for (const arrow of arrows) {
    if (arrow.direction === 'positive') {
      strengths.ro.push(arrow.meaning.ro);
      strengths.en.push(arrow.meaning.en);
      strengths.ru.push(arrow.meaning.ru);
    } else {
      weaknesses.ro.push(arrow.meaning.ro);
      weaknesses.en.push(arrow.meaning.en);
      weaknesses.ru.push(arrow.meaning.ru);
    }
  }

  // Add recommendations for missing numbers
  for (const num of missingNumbers) {
    const remedy = NUMBER_REMEDIES[num];
    if (remedy) {
      recommendations.ro.push(remedy.description.ro);
      recommendations.en.push(remedy.description.en);
      recommendations.ru.push(remedy.description.ru);
    }
  }

  return { strengths, weaknesses, recommendations };
};

// Plane meanings by strength level
const PLANE_MEANINGS: Record<string, Record<string, Record<Language, string>>> = {
  mental: {
    empty: {
      ro: 'Planul mental gol - dificultăți în gândirea abstractă',
      en: 'Empty mental plane - difficulties in abstract thinking',
      ru: 'Пустой ментальный план - трудности в абстрактном мышлении',
    },
    weak: {
      ro: 'Plan mental slab - concentrare limitată',
      en: 'Weak mental plane - limited concentration',
      ru: 'Слабый ментальный план - ограниченная концентрация',
    },
    balanced: {
      ro: 'Plan mental echilibrat - gândire clară',
      en: 'Balanced mental plane - clear thinking',
      ru: 'Сбалансированный ментальный план - ясное мышление',
    },
    strong: {
      ro: 'Plan mental puternic - capacități intelectuale excelente',
      en: 'Strong mental plane - excellent intellectual abilities',
      ru: 'Сильный ментальный план - отличные интеллектуальные способности',
    },
    dominant: {
      ro: 'Plan mental dominant - geniu analitic, risc de detașare emoțională',
      en: 'Dominant mental plane - analytical genius, risk of emotional detachment',
      ru: 'Доминирующий ментальный план - аналитический гений, риск эмоциональной отстраненности',
    },
  },
  emotional: {
    empty: {
      ro: 'Planul emoțional gol - dificultăți în exprimarea sentimentelor',
      en: 'Empty emotional plane - difficulties expressing feelings',
      ru: 'Пустой эмоциональный план - трудности в выражении чувств',
    },
    weak: {
      ro: 'Plan emoțional slab - sensibilitate redusă',
      en: 'Weak emotional plane - reduced sensitivity',
      ru: 'Слабый эмоциональный план - сниженная чувствительность',
    },
    balanced: {
      ro: 'Plan emoțional echilibrat - empatie sănătoasă',
      en: 'Balanced emotional plane - healthy empathy',
      ru: 'Сбалансированный эмоциональный план - здоровая эмпатия',
    },
    strong: {
      ro: 'Plan emoțional puternic - intuiție și sensibilitate mare',
      en: 'Strong emotional plane - high intuition and sensitivity',
      ru: 'Сильный эмоциональный план - высокая интуиция и чувствительность',
    },
    dominant: {
      ro: 'Plan emoțional dominant - emoții intense, posibil copleșitoare',
      en: 'Dominant emotional plane - intense emotions, possibly overwhelming',
      ru: 'Доминирующий эмоциональный план - интенсивные эмоции, возможно подавляющие',
    },
  },
  practical: {
    empty: {
      ro: 'Planul practic gol - dificultăți în organizare',
      en: 'Empty practical plane - difficulties in organization',
      ru: 'Пустой практический план - трудности в организации',
    },
    weak: {
      ro: 'Plan practic slab - tendință spre visare',
      en: 'Weak practical plane - tendency to daydream',
      ru: 'Слабый практический план - склонность к мечтательности',
    },
    balanced: {
      ro: 'Plan practic echilibrat - bună organizare zilnică',
      en: 'Balanced practical plane - good daily organization',
      ru: 'Сбалансированный практический план - хорошая повседневная организация',
    },
    strong: {
      ro: 'Plan practic puternic - excelente abilități de manifestare',
      en: 'Strong practical plane - excellent manifestation abilities',
      ru: 'Сильный практический план - отличные способности к проявлению',
    },
    dominant: {
      ro: 'Plan practic dominant - materialist, risc de neglijare spirituală',
      en: 'Dominant practical plane - materialistic, risk of spiritual neglect',
      ru: 'Доминирующий практический план - материалистичный, риск духовного пренебрежения',
    },
  },
  thought: {
    empty: {
      ro: 'Plan al gândirii gol - dificultăți în planificare pe termen lung',
      en: 'Empty thought plane - difficulties in long-term planning',
      ru: 'Пустой план мысли - трудности в долгосрочном планировании',
    },
    weak: {
      ro: 'Plan al gândirii slab - idei disparate',
      en: 'Weak thought plane - scattered ideas',
      ru: 'Слабый план мысли - разрозненные идеи',
    },
    balanced: {
      ro: 'Plan al gândirii echilibrat - bună capacitate de analiză',
      en: 'Balanced thought plane - good analytical capacity',
      ru: 'Сбалансированный план мысли - хорошая аналитическая способность',
    },
    strong: {
      ro: 'Plan al gândirii puternic - vizionar și strateg',
      en: 'Strong thought plane - visionary and strategist',
      ru: 'Сильный план мысли - визионер и стратег',
    },
    dominant: {
      ro: 'Plan al gândirii dominant - overthinking, paralizie prin analiză',
      en: 'Dominant thought plane - overthinking, analysis paralysis',
      ru: 'Доминирующий план мысли - чрезмерное обдумывание, паралич анализа',
    },
  },
  will: {
    empty: {
      ro: 'Plan al voinței gol - lipsă de determinare',
      en: 'Empty will plane - lack of determination',
      ru: 'Пустой план воли - отсутствие решимости',
    },
    weak: {
      ro: 'Plan al voinței slab - ușor influențabil',
      en: 'Weak will plane - easily influenced',
      ru: 'Слабый план воли - легко поддается влиянию',
    },
    balanced: {
      ro: 'Plan al voinței echilibrat - determinare sănătoasă',
      en: 'Balanced will plane - healthy determination',
      ru: 'Сбалансированный план воли - здоровая решимость',
    },
    strong: {
      ro: 'Plan al voinței puternic - lider natural',
      en: 'Strong will plane - natural leader',
      ru: 'Сильный план воли - природный лидер',
    },
    dominant: {
      ro: 'Plan al voinței dominant - încăpățânare, posibil autoritarism',
      en: 'Dominant will plane - stubbornness, possibly authoritarian',
      ru: 'Доминирующий план воли - упрямство, возможно авторитаризм',
    },
  },
  action: {
    empty: {
      ro: 'Plan de acțiune gol - dificultăți în finalizarea proiectelor',
      en: 'Empty action plane - difficulties completing projects',
      ru: 'Пустой план действия - трудности в завершении проектов',
    },
    weak: {
      ro: 'Plan de acțiune slab - procrastinare',
      en: 'Weak action plane - procrastination',
      ru: 'Слабый план действия - прокрастинация',
    },
    balanced: {
      ro: 'Plan de acțiune echilibrat - execuție eficientă',
      en: 'Balanced action plane - efficient execution',
      ru: 'Сбалансированный план действия - эффективное выполнение',
    },
    strong: {
      ro: 'Plan de acțiune puternic - realizator excepțional',
      en: 'Strong action plane - exceptional achiever',
      ru: 'Сильный план действия - исключительный достигатор',
    },
    dominant: {
      ro: 'Plan de acțiune dominant - workaholic, risc de burnout',
      en: 'Dominant action plane - workaholic, risk of burnout',
      ru: 'Доминирующий план действия - трудоголик, риск выгорания',
    },
  },
};

// Arrow meanings
const ARROW_MEANINGS: Record<string, Record<string, Record<Language, string>>> = {
  determination: {
    positive: {
      ro: 'Săgeata Determinării (1-5-9) - Perseverență puternică și abilitatea de a depăși obstacolele',
      en: 'Arrow of Determination (1-5-9) - Strong perseverance and ability to overcome obstacles',
      ru: 'Стрела Решимости (1-5-9) - Сильная настойчивость и способность преодолевать препятствия',
    },
    negative: {
      ro: 'Săgeata Ezitării - Tendința de a renunța când lucrurile devin dificile',
      en: 'Arrow of Hesitation - Tendency to give up when things get difficult',
      ru: 'Стрела Колебания - Склонность сдаваться, когда становится трудно',
    },
  },
  spirituality: {
    positive: {
      ro: 'Săgeata Spiritualității (3-5-7) - Conexiune profundă cu sinele interior și înțelepciune',
      en: 'Arrow of Spirituality (3-5-7) - Deep connection with inner self and wisdom',
      ru: 'Стрела Духовности (3-5-7) - Глубокая связь с внутренним я и мудрость',
    },
    negative: {
      ro: 'Săgeata Frustrării - Tendința de a se simți copleșit și lipsit de sens',
      en: 'Arrow of Frustration - Tendency to feel overwhelmed and lacking meaning',
      ru: 'Стрела Разочарования - Склонность чувствовать себя подавленным и лишенным смысла',
    },
  },
  success: {
    positive: {
      ro: 'Săgeata Succesului (4-5-6) - Potențial mare pentru realizări și abundență',
      en: 'Arrow of Success (4-5-6) - Great potential for achievements and abundance',
      ru: 'Стрела Успеха (4-5-6) - Большой потенциал для достижений и изобилия',
    },
    negative: {
      ro: 'Săgeata Dezamăgirii - Tendința de a avea așteptări nerealiste',
      en: 'Arrow of Disappointment - Tendency to have unrealistic expectations',
      ru: 'Стрела Разочарования - Склонность к нереалистичным ожиданиям',
    },
  },
  planner: {
    positive: {
      ro: 'Săgeata Planificatorului (1-2-3) - Excelent la organizare și planificare',
      en: 'Arrow of the Planner (1-2-3) - Excellent at organization and planning',
      ru: 'Стрела Планировщика (1-2-3) - Отличный в организации и планировании',
    },
    negative: {
      ro: 'Plan lipsă - Dificultăți în organizarea vieții',
      en: 'Missing plan - Difficulties in organizing life',
      ru: 'Отсутствие плана - Трудности в организации жизни',
    },
  },
  activity: {
    positive: {
      ro: 'Săgeata Activității (7-8-9) - Energie fizică și mental puternică',
      en: 'Arrow of Activity (7-8-9) - Strong physical and mental energy',
      ru: 'Стрела Активности (7-8-9) - Сильная физическая и умственная энергия',
    },
    negative: {
      ro: 'Lipsa activității - Tendință spre pasivitate',
      en: 'Lack of activity - Tendency toward passivity',
      ru: 'Отсутствие активности - Склонность к пассивности',
    },
  },
  emotional: {
    positive: {
      ro: 'Săgeata Echilibrului Emoțional (2-5-8) - Stabilitate emoțională și intuiție',
      en: 'Arrow of Emotional Balance (2-5-8) - Emotional stability and intuition',
      ru: 'Стрела Эмоционального Баланса (2-5-8) - Эмоциональная стабильность и интуиция',
    },
    negative: {
      ro: 'Lipsa echilibrului emoțional',
      en: 'Lack of emotional balance',
      ru: 'Отсутствие эмоционального баланса',
    },
  },
};

// Remedies for missing numbers
export const NUMBER_REMEDIES: Record<number, NumberRemedy> = {
  1: {
    number: 1,
    colors: ['#FF0000', '#FFCC00'], // Red, Gold
    gemstones: {
      ro: ['Rubin', 'Granat'],
      en: ['Ruby', 'Garnet'],
      ru: ['Рубин', 'Гранат'],
    },
    mantras: ['Om Hreem Surya Namaha'],
    favorableDays: {
      ro: ['Duminică'],
      en: ['Sunday'],
      ru: ['Воскресенье'],
    },
    element: 'Fire',
    direction: 'East',
    description: {
      ro: 'Pentru numărul 1 lipsă: Purtați roșu sau auriu, pietrele recomandate sunt rubinul și granatul.',
      en: 'For missing number 1: Wear red or gold, recommended stones are ruby and garnet.',
      ru: 'Для отсутствующего числа 1: Носите красный или золотой, рекомендуемые камни - рубин и гранат.',
    },
  },
  2: {
    number: 2,
    colors: ['#FFFFFF', '#F5F5DC'], // White, Cream
    gemstones: {
      ro: ['Perlă', 'Piatră de lună'],
      en: ['Pearl', 'Moonstone'],
      ru: ['Жемчуг', 'Лунный камень'],
    },
    mantras: ['Om Chandraya Namaha'],
    favorableDays: {
      ro: ['Luni'],
      en: ['Monday'],
      ru: ['Понедельник'],
    },
    element: 'Water',
    direction: 'North-West',
    description: {
      ro: 'Pentru numărul 2 lipsă: Purtați alb sau crem, pietrele recomandate sunt perla și piatra de lună.',
      en: 'For missing number 2: Wear white or cream, recommended stones are pearl and moonstone.',
      ru: 'Для отсутствующего числа 2: Носите белый или кремовый, рекомендуемые камни - жемчуг и лунный камень.',
    },
  },
  3: {
    number: 3,
    colors: ['#FFFF00', '#FFA500'], // Yellow, Orange
    gemstones: {
      ro: ['Citrin', 'Topaz galben'],
      en: ['Citrine', 'Yellow Topaz'],
      ru: ['Цитрин', 'Жёлтый топаз'],
    },
    mantras: ['Om Brihaspate Namaha'],
    favorableDays: {
      ro: ['Joi'],
      en: ['Thursday'],
      ru: ['Четверг'],
    },
    element: 'Fire',
    direction: 'North-East',
    description: {
      ro: 'Pentru numărul 3 lipsă: Purtați galben sau portocaliu, pietrele recomandate sunt citrinul și topazul galben.',
      en: 'For missing number 3: Wear yellow or orange, recommended stones are citrine and yellow topaz.',
      ru: 'Для отсутствующего числа 3: Носите жёлтый или оранжевый, рекомендуемые камни - цитрин и жёлтый топаз.',
    },
  },
  4: {
    number: 4,
    colors: ['#808080', '#0000FF'], // Grey, Blue
    gemstones: {
      ro: ['Hessonit', 'Safir albastru'],
      en: ['Hessonite', 'Blue Sapphire'],
      ru: ['Гессонит', 'Синий сапфир'],
    },
    mantras: ['Om Rahave Namaha'],
    favorableDays: {
      ro: ['Sâmbătă'],
      en: ['Saturday'],
      ru: ['Суббота'],
    },
    element: 'Air',
    direction: 'South-West',
    description: {
      ro: 'Pentru numărul 4 lipsă: Purtați gri sau albastru, pietrele recomandate sunt hessonitul și safirul albastru.',
      en: 'For missing number 4: Wear grey or blue, recommended stones are hessonite and blue sapphire.',
      ru: 'Для отсутствующего числа 4: Носите серый или синий, рекомендуемые камни - гессонит и синий сапфир.',
    },
  },
  5: {
    number: 5,
    colors: ['#008000', '#90EE90'], // Green, Light green
    gemstones: {
      ro: ['Smarald', 'Peridot'],
      en: ['Emerald', 'Peridot'],
      ru: ['Изумруд', 'Перидот'],
    },
    mantras: ['Om Budhaya Namaha'],
    favorableDays: {
      ro: ['Miercuri'],
      en: ['Wednesday'],
      ru: ['Среда'],
    },
    element: 'Earth',
    direction: 'North',
    description: {
      ro: 'Pentru numărul 5 lipsă: Purtați verde, pietrele recomandate sunt smaraldul și peridotul.',
      en: 'For missing number 5: Wear green, recommended stones are emerald and peridot.',
      ru: 'Для отсутствующего числа 5: Носите зелёный, рекомендуемые камни - изумруд и перидот.',
    },
  },
  6: {
    number: 6,
    colors: ['#FFC0CB', '#F0E68C'], // Pink, Khaki/Light yellow
    gemstones: {
      ro: ['Diamant', 'Opal alb'],
      en: ['Diamond', 'White Opal'],
      ru: ['Бриллиант', 'Белый опал'],
    },
    mantras: ['Om Shukraya Namaha'],
    favorableDays: {
      ro: ['Vineri'],
      en: ['Friday'],
      ru: ['Пятница'],
    },
    element: 'Water',
    direction: 'South-East',
    description: {
      ro: 'Pentru numărul 6 lipsă: Purtați roz sau nuanțe pastelate, pietrele recomandate sunt diamantul și opalul alb.',
      en: 'For missing number 6: Wear pink or pastel shades, recommended stones are diamond and white opal.',
      ru: 'Для отсутствующего числа 6: Носите розовый или пастельные оттенки, рекомендуемые камни - бриллиант и белый опал.',
    },
  },
  7: {
    number: 7,
    colors: ['#808080', '#F5F5F5'], // Grey, Off-white
    gemstones: {
      ro: ['Ochi de pisică', 'Turmalină'],
      en: ["Cat's Eye", 'Tourmaline'],
      ru: ['Кошачий глаз', 'Турмалин'],
    },
    mantras: ['Om Ketave Namaha'],
    favorableDays: {
      ro: ['Marți'],
      en: ['Tuesday'],
      ru: ['Вторник'],
    },
    element: 'Water',
    direction: 'South',
    description: {
      ro: 'Pentru numărul 7 lipsă: Purtați gri sau alb-gri, pietrele recomandate sunt ochiul de pisică și turmalina.',
      en: "For missing number 7: Wear grey or off-white, recommended stones are cat's eye and tourmaline.",
      ru: 'Для отсутствующего числа 7: Носите серый или бело-серый, рекомендуемые камни - кошачий глаз и турмалин.',
    },
  },
  8: {
    number: 8,
    colors: ['#000080', '#000000'], // Navy blue, Black
    gemstones: {
      ro: ['Safir albastru', 'Ametist'],
      en: ['Blue Sapphire', 'Amethyst'],
      ru: ['Синий сапфир', 'Аметист'],
    },
    mantras: ['Om Shanicharaya Namaha'],
    favorableDays: {
      ro: ['Sâmbătă'],
      en: ['Saturday'],
      ru: ['Суббота'],
    },
    element: 'Earth',
    direction: 'West',
    description: {
      ro: 'Pentru numărul 8 lipsă: Purtați albastru închis sau negru, pietrele recomandate sunt safirul albastru și ametistul.',
      en: 'For missing number 8: Wear dark blue or black, recommended stones are blue sapphire and amethyst.',
      ru: 'Для отсутствующего числа 8: Носите тёмно-синий или чёрный, рекомендуемые камни - синий сапфир и аметист.',
    },
  },
  9: {
    number: 9,
    colors: ['#FF0000', '#8B0000'], // Red, Dark red
    gemstones: {
      ro: ['Coral roșu', 'Rubin'],
      en: ['Red Coral', 'Ruby'],
      ru: ['Красный коралл', 'Рубин'],
    },
    mantras: ['Om Mangalaya Namaha'],
    favorableDays: {
      ro: ['Marți'],
      en: ['Tuesday'],
      ru: ['Вторник'],
    },
    element: 'Fire',
    direction: 'South',
    description: {
      ro: 'Pentru numărul 9 lipsă: Purtați roșu, pietrele recomandate sunt coralul roșu și rubinul.',
      en: 'For missing number 9: Wear red, recommended stones are red coral and ruby.',
      ru: 'Для отсутствующего числа 9: Носите красный, рекомендуемые камни - красный коралл и рубин.',
    },
  },
};

// Individual number meanings in Lo Shu Grid
export const LO_SHU_NUMBER_MEANINGS: Record<number, Record<Language, { title: string; description: string; energy: string }>> = {
  1: {
    ro: {
      title: 'Comunicare',
      description: 'Reprezentă exprimarea de sine, comunicarea și noi începuturi.',
      energy: 'Energie verbală și expresivă',
    },
    en: {
      title: 'Communication',
      description: 'Represents self-expression, communication, and new beginnings.',
      energy: 'Verbal and expressive energy',
    },
    ru: {
      title: 'Коммуникация',
      description: 'Представляет самовыражение, общение и новые начинания.',
      energy: 'Вербальная и выразительная энергия',
    },
  },
  2: {
    ro: {
      title: 'Intuiție',
      description: 'Reprezentă sensibilitate, intuiție și cooperare.',
      energy: 'Energie intuitivă și receptivă',
    },
    en: {
      title: 'Intuition',
      description: 'Represents sensitivity, intuition, and cooperation.',
      energy: 'Intuitive and receptive energy',
    },
    ru: {
      title: 'Интуиция',
      description: 'Представляет чувствительность, интуицию и сотрудничество.',
      energy: 'Интуитивная и восприимчивая энергия',
    },
  },
  3: {
    ro: {
      title: 'Creativitate',
      description: 'Reprezentă imaginație, creativitate și expresie artistică.',
      energy: 'Energie creativă și expresivă',
    },
    en: {
      title: 'Creativity',
      description: 'Represents imagination, creativity, and artistic expression.',
      energy: 'Creative and expressive energy',
    },
    ru: {
      title: 'Креативность',
      description: 'Представляет воображение, творчество и художественное выражение.',
      energy: 'Творческая и выразительная энергия',
    },
  },
  4: {
    ro: {
      title: 'Stabilitate',
      description: 'Reprezentă practicalitate, muncă grea și fundație solidă.',
      energy: 'Energie stabilă și structurată',
    },
    en: {
      title: 'Stability',
      description: 'Represents practicality, hard work, and solid foundation.',
      energy: 'Stable and structured energy',
    },
    ru: {
      title: 'Стабильность',
      description: 'Представляет практичность, усердную работу и прочный фундамент.',
      energy: 'Стабильная и структурированная энергия',
    },
  },
  5: {
    ro: {
      title: 'Echilibru',
      description: 'Centrul gridului - reprezentă echilibru, libertate și adaptabilitate.',
      energy: 'Energie centrală și echilibratoare',
    },
    en: {
      title: 'Balance',
      description: 'The center of the grid - represents balance, freedom, and adaptability.',
      energy: 'Central and balancing energy',
    },
    ru: {
      title: 'Баланс',
      description: 'Центр сетки - представляет баланс, свободу и адаптивность.',
      energy: 'Центральная и уравновешивающая энергия',
    },
  },
  6: {
    ro: {
      title: 'Responsabilitate',
      description: 'Reprezentă armonie, responsabilitate și iubire de familie.',
      energy: 'Energie grijulie și protectoare',
    },
    en: {
      title: 'Responsibility',
      description: 'Represents harmony, responsibility, and love of family.',
      energy: 'Caring and protective energy',
    },
    ru: {
      title: 'Ответственность',
      description: 'Представляет гармонию, ответственность и любовь к семье.',
      energy: 'Заботливая и защитная энергия',
    },
  },
  7: {
    ro: {
      title: 'Spiritualitate',
      description: 'Reprezentă căutare spirituală, analiză și înțelepciune.',
      energy: 'Energie contemplativă și analitică',
    },
    en: {
      title: 'Spirituality',
      description: 'Represents spiritual seeking, analysis, and wisdom.',
      energy: 'Contemplative and analytical energy',
    },
    ru: {
      title: 'Духовность',
      description: 'Представляет духовный поиск, анализ и мудрость.',
      energy: 'Созерцательная и аналитическая энергия',
    },
  },
  8: {
    ro: {
      title: 'Abundență',
      description: 'Reprezentă putere materială, succes și manifestare.',
      energy: 'Energie materială și manifestatoare',
    },
    en: {
      title: 'Abundance',
      description: 'Represents material power, success, and manifestation.',
      energy: 'Material and manifesting energy',
    },
    ru: {
      title: 'Изобилие',
      description: 'Представляет материальную силу, успех и проявление.',
      energy: 'Материальная и проявляющая энергия',
    },
  },
  9: {
    ro: {
      title: 'Compasiune',
      description: 'Reprezentă umanitarism, compasiune și finalizare.',
      energy: 'Energie compasivă și universală',
    },
    en: {
      title: 'Compassion',
      description: 'Represents humanitarianism, compassion, and completion.',
      energy: 'Compassionate and universal energy',
    },
    ru: {
      title: 'Сострадание',
      description: 'Представляет гуманизм, сострадание и завершение.',
      energy: 'Сострадательная и универсальная энергия',
    },
  },
};
