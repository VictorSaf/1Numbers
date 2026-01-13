// Business Numerology Library
// Advanced business name analysis combining Pythagorean and Chaldean systems

import { calculateDestinyNumber } from './numerology';
import { calculateChaldeanNameNumber, calculateBusinessNameNumber, getCompoundMeaning } from './chaldean';
import { getColorRecommendation, getRemedyForNumber } from './remedies';

export interface BusinessFullAnalysis {
  name: string;
  pythagorean: {
    destinyNumber: number;
    meaning: ReturnType<typeof getPythagoreanBusinessMeaning>;
  };
  chaldean: {
    compound: number;
    single: number;
    isLucky: boolean;
    compoundMeaning: ReturnType<typeof getCompoundMeaning>;
  };
  branding: {
    primaryColor: string;
    secondaryColors: string[];
    colorHex: string;
    avoidColors: string[];
    gemstone: string;
  };
  bestLaunchDays: string[];
  industryFit: {
    excellent: string[];
    good: string[];
    avoid: string[];
  };
  partnerNumbers: number[];
  employeeCompatibility: number[];
  overallScore: number;
  recommendations: string[];
}

interface PartnershipAnalysis {
  partner1Name: string;
  partner2Name: string;
  partner1Number: number;
  partner2Number: number;
  combinedNumber: number;
  compatibilityScore: number;
  strengths: string[];
  challenges: string[];
  recommendation: string;
}

interface LaunchDateAnalysis {
  date: Date;
  universalDay: number;
  businessNumber: number;
  compatibility: number;
  isAuspicious: boolean;
  reasons: string[];
}

// Pythagorean business meanings
function getPythagoreanBusinessMeaning(number: number, language: string = 'en'): {
  title: string;
  energy: string;
  industries: string[];
  strengths: string[];
  challenges: string[];
} {
  const meanings: Record<string, Record<number, {
    title: string;
    energy: string;
    industries: string[];
    strengths: string[];
    challenges: string[];
  }>> = {
    en: {
      1: {
        title: 'The Pioneer',
        energy: 'Leadership, Innovation, Independence',
        industries: ['Tech Startups', 'Consulting', 'Executive Services', 'Innovation'],
        strengths: ['Strong brand identity', 'Market leadership potential', 'Independence'],
        challenges: ['Partnership difficulties', 'May seem too aggressive'],
      },
      2: {
        title: 'The Diplomat',
        energy: 'Partnership, Cooperation, Balance',
        industries: ['Mediation', 'HR Services', 'Counseling', 'B2B Services'],
        strengths: ['Excellent for partnerships', 'Client relationships', 'Teamwork'],
        challenges: ['Slow decision making', 'May lack assertiveness'],
      },
      3: {
        title: 'The Creator',
        energy: 'Creativity, Expression, Joy',
        industries: ['Marketing', 'Design', 'Entertainment', 'Social Media'],
        strengths: ['Creative branding', 'Customer engagement', 'Viral potential'],
        challenges: ['Lack of focus', 'Inconsistent messaging'],
      },
      4: {
        title: 'The Builder',
        energy: 'Stability, Structure, Reliability',
        industries: ['Construction', 'Finance', 'Manufacturing', 'Real Estate'],
        strengths: ['Trust and reliability', 'Long-term stability', 'Systematic growth'],
        challenges: ['Resistance to change', 'May seem rigid'],
      },
      5: {
        title: 'The Adventurer',
        energy: 'Change, Freedom, Versatility',
        industries: ['Travel', 'Media', 'Sales', 'Dynamic Retail'],
        strengths: ['Adaptability', 'Quick market response', 'Innovation'],
        challenges: ['Perceived instability', 'Frequent changes'],
      },
      6: {
        title: 'The Nurturer',
        energy: 'Harmony, Responsibility, Care',
        industries: ['Healthcare', 'Education', 'Family Services', 'Interior Design'],
        strengths: ['Customer loyalty', 'Community focus', 'Trust building'],
        challenges: ['Over-commitment', 'Difficulty saying no'],
      },
      7: {
        title: 'The Analyst',
        energy: 'Research, Spirituality, Wisdom',
        industries: ['Research', 'Technology', 'Consulting', 'Spiritual Services'],
        strengths: ['Expertise positioning', 'Quality focus', 'Niche markets'],
        challenges: ['Limited mass appeal', 'Communication barriers'],
      },
      8: {
        title: 'The Executive',
        energy: 'Power, Achievement, Success',
        industries: ['Finance', 'Investments', 'Corporate Services', 'Luxury Goods'],
        strengths: ['Authority and prestige', 'Growth potential', 'Material success'],
        challenges: ['High pressure', 'Materialistic perception'],
      },
      9: {
        title: 'The Humanitarian',
        energy: 'Service, Compassion, Global Vision',
        industries: ['Non-profits', 'Arts', 'Global Services', 'Education'],
        strengths: ['Social impact', 'Global reach', 'Purpose-driven'],
        challenges: ['Profit challenges', 'Idealistic approach'],
      },
      11: {
        title: 'The Visionary',
        energy: 'Inspiration, Illumination, Intuition',
        industries: ['Coaching', 'Spiritual Media', 'Innovation', 'Visionary Art'],
        strengths: ['Inspirational leadership', 'Unique positioning', 'High vibration'],
        challenges: ['High expectations', 'Sensitivity to criticism'],
      },
      22: {
        title: 'The Master Builder',
        energy: 'Large-Scale Achievement, Practical Dreams',
        industries: ['Infrastructure', 'Global Corporations', 'Major Construction'],
        strengths: ['Empire building', 'Transformative impact', 'Global scale'],
        challenges: ['Enormous pressure', 'Unrealistic expectations'],
      },
      33: {
        title: 'The Master Teacher',
        energy: 'Universal Love, Healing, Spiritual Teaching',
        industries: ['Humanitarian Organizations', 'Healing', 'Spiritual Education'],
        strengths: ['Profound impact', 'Spiritual authority', 'Global healing'],
        challenges: ['Excessive sacrifice', 'Immense responsibility'],
      },
    },
    ro: {
      1: {
        title: 'Pionierul',
        energy: 'Leadership, Inovație, Independență',
        industries: ['Startupuri Tech', 'Consultanță', 'Servicii Executive', 'Inovație'],
        strengths: ['Identitate de brand puternică', 'Potențial de lider de piață', 'Independență'],
        challenges: ['Dificultăți cu parteneriatele', 'Poate părea prea agresiv'],
      },
      2: {
        title: 'Diplomatul',
        energy: 'Parteneriat, Cooperare, Echilibru',
        industries: ['Mediere', 'Servicii HR', 'Consiliere', 'Servicii B2B'],
        strengths: ['Excelent pentru parteneriate', 'Relații cu clienții', 'Munca în echipă'],
        challenges: ['Decizii lente', 'Poate lipsi asertivitatea'],
      },
      3: {
        title: 'Creatorul',
        energy: 'Creativitate, Expresie, Bucurie',
        industries: ['Marketing', 'Design', 'Divertisment', 'Social Media'],
        strengths: ['Branding creativ', 'Engagement clienți', 'Potențial viral'],
        challenges: ['Lipsă de focus', 'Mesaje inconsistente'],
      },
      4: {
        title: 'Constructorul',
        energy: 'Stabilitate, Structură, Fiabilitate',
        industries: ['Construcții', 'Finanțe', 'Producție', 'Imobiliare'],
        strengths: ['Încredere și fiabilitate', 'Stabilitate pe termen lung', 'Creștere sistematică'],
        challenges: ['Rezistență la schimbare', 'Poate părea rigid'],
      },
      5: {
        title: 'Aventurierul',
        energy: 'Schimbare, Libertate, Versatilitate',
        industries: ['Turism', 'Media', 'Vânzări', 'Retail Dinamic'],
        strengths: ['Adaptabilitate', 'Răspuns rapid la piață', 'Inovație'],
        challenges: ['Instabilitate percepută', 'Schimbări frecvente'],
      },
      6: {
        title: 'Protectorul',
        energy: 'Armonie, Responsabilitate, Grijă',
        industries: ['Sănătate', 'Educație', 'Servicii Familiale', 'Design Interior'],
        strengths: ['Loialitatea clienților', 'Focus comunitar', 'Construirea încrederii'],
        challenges: ['Supra-angajament', 'Dificultăți în a spune nu'],
      },
      7: {
        title: 'Analistul',
        energy: 'Cercetare, Spiritualitate, Înțelepciune',
        industries: ['Cercetare', 'Tehnologie', 'Consultanță', 'Servicii Spirituale'],
        strengths: ['Poziționare de expert', 'Focus pe calitate', 'Piețe de nișă'],
        challenges: ['Apel de masă limitat', 'Bariere de comunicare'],
      },
      8: {
        title: 'Executivul',
        energy: 'Putere, Realizare, Succes',
        industries: ['Finanțe', 'Investiții', 'Servicii Corporate', 'Bunuri de Lux'],
        strengths: ['Autoritate și prestigiu', 'Potențial de creștere', 'Succes material'],
        challenges: ['Presiune mare', 'Percepție materialistă'],
      },
      9: {
        title: 'Umanitarul',
        energy: 'Serviciu, Compasiune, Viziune Globală',
        industries: ['ONG-uri', 'Arte', 'Servicii Globale', 'Educație'],
        strengths: ['Impact social', 'Acoperire globală', 'Orientat spre scop'],
        challenges: ['Provocări de profit', 'Abordare idealistă'],
      },
      11: {
        title: 'Vizionarul',
        energy: 'Inspirație, Iluminare, Intuiție',
        industries: ['Coaching', 'Media Spirituală', 'Inovație', 'Artă Vizionară'],
        strengths: ['Leadership inspirațional', 'Poziționare unică', 'Vibrație înaltă'],
        challenges: ['Așteptări mari', 'Sensibilitate la critică'],
      },
      22: {
        title: 'Maestrul Constructor',
        energy: 'Realizări la Scară Mare, Vise Practice',
        industries: ['Infrastructură', 'Corporații Globale', 'Construcții Majore'],
        strengths: ['Construirea de imperii', 'Impact transformator', 'Scară globală'],
        challenges: ['Presiune enormă', 'Așteptări nerealiste'],
      },
      33: {
        title: 'Maestrul Profesor',
        energy: 'Iubire Universală, Vindecare, Predare Spirituală',
        industries: ['Organizații Umanitare', 'Vindecare', 'Educație Spirituală'],
        strengths: ['Impact profund', 'Autoritate spirituală', 'Vindecare globală'],
        challenges: ['Sacrificiu excesiv', 'Responsabilitate imensă'],
      },
    },
    ru: {
      1: {
        title: 'Пионер',
        energy: 'Лидерство, Инновации, Независимость',
        industries: ['Технологические стартапы', 'Консалтинг', 'Услуги для руководителей', 'Инновации'],
        strengths: ['Сильная идентичность бренда', 'Потенциал лидера рынка', 'Независимость'],
        challenges: ['Трудности с партнерствами', 'Может казаться слишком агрессивным'],
      },
      // ... abbreviated for length - would include all numbers in Russian
    },
  };

  const langMeanings = meanings[language] || meanings.en;
  return langMeanings[number] || langMeanings[9];
}

/**
 * Perform full business name analysis
 */
export function analyzeBusinessFull(
  businessName: string,
  language: string = 'en'
): BusinessFullAnalysis {
  // Pythagorean analysis
  const pythagoreanNumber = calculateDestinyNumber(businessName);
  const pythagoreanMeaning = getPythagoreanBusinessMeaning(pythagoreanNumber, language);

  // Chaldean analysis
  const chaldeanResult = calculateBusinessNameNumber(businessName);
  const chaldeanMeaning = getCompoundMeaning(chaldeanResult.compound, language);

  // Branding recommendations based on single digit
  const remedy = getRemedyForNumber(chaldeanResult.single, language);
  const colorRec = getColorRecommendation(chaldeanResult.single, language);

  // Calculate overall score
  let overallScore = 50; // Base score
  if (chaldeanResult.isLucky) overallScore += 20;
  if (chaldeanMeaning?.nature === 'positive') overallScore += 15;
  if (chaldeanMeaning?.nature === 'negative') overallScore -= 10;
  if ([1, 3, 5, 8].includes(pythagoreanNumber)) overallScore += 10;
  if ([11, 22, 33].includes(pythagoreanNumber)) overallScore += 15;

  // Best launch days
  const bestLaunchDays = remedy?.days.favorable || [];

  // Industry fit
  const industryFit = {
    excellent: pythagoreanMeaning.industries.slice(0, 2),
    good: pythagoreanMeaning.industries.slice(2),
    avoid: getIndustriesToAvoid(pythagoreanNumber, language),
  };

  // Partner and employee compatibility
  const partnerNumbers = getCompatiblePartnerNumbers(chaldeanResult.single);
  const employeeCompatibility = getCompatibleEmployeeNumbers(pythagoreanNumber);

  // Recommendations
  const recommendations = generateBusinessRecommendations(
    pythagoreanNumber,
    chaldeanResult,
    overallScore,
    language
  );

  return {
    name: businessName,
    pythagorean: {
      destinyNumber: pythagoreanNumber,
      meaning: pythagoreanMeaning,
    },
    chaldean: {
      compound: chaldeanResult.compound,
      single: chaldeanResult.single,
      isLucky: chaldeanResult.isLucky,
      compoundMeaning: chaldeanMeaning,
    },
    branding: {
      primaryColor: colorRec?.wear[0] || 'Blue',
      secondaryColors: colorRec?.wear.slice(1) || [],
      colorHex: colorRec?.hex || '#4169E1',
      avoidColors: colorRec?.avoid || [],
      gemstone: remedy?.gemstones.primary || 'Crystal',
    },
    bestLaunchDays,
    industryFit,
    partnerNumbers,
    employeeCompatibility,
    overallScore: Math.min(100, Math.max(0, overallScore)),
    recommendations,
  };
}

/**
 * Analyze partnership compatibility
 */
export function analyzePartnership(
  partner1Name: string,
  partner2Name: string,
  language: string = 'en'
): PartnershipAnalysis {
  const p1Number = calculateDestinyNumber(partner1Name);
  const p2Number = calculateDestinyNumber(partner2Name);
  const combinedNumber = calculateDestinyNumber(partner1Name + partner2Name);

  // Calculate compatibility
  const compatiblePairs: Record<number, number[]> = {
    1: [1, 3, 5, 9],
    2: [2, 4, 6, 8],
    3: [1, 3, 5, 9],
    4: [2, 4, 6, 8],
    5: [1, 3, 5, 7],
    6: [2, 4, 6, 8],
    7: [5, 7],
    8: [2, 4, 6, 8],
    9: [1, 3, 9],
  };

  const isCompatible = compatiblePairs[p1Number]?.includes(p2Number);
  let compatibilityScore = isCompatible ? 70 : 40;

  // Master number bonus
  if ([11, 22, 33].includes(combinedNumber)) compatibilityScore += 15;

  // Same number synergy
  if (p1Number === p2Number) compatibilityScore += 10;

  const translations = getPartnershipTranslations(language);

  const strengths = getPartnershipStrengths(p1Number, p2Number, language);
  const challenges = getPartnershipChallenges(p1Number, p2Number, language);

  let recommendation: string;
  if (compatibilityScore >= 80) {
    recommendation = translations.excellent;
  } else if (compatibilityScore >= 60) {
    recommendation = translations.good;
  } else if (compatibilityScore >= 40) {
    recommendation = translations.moderate;
  } else {
    recommendation = translations.challenging;
  }

  return {
    partner1Name,
    partner2Name,
    partner1Number: p1Number,
    partner2Number: p2Number,
    combinedNumber,
    compatibilityScore: Math.min(100, compatibilityScore),
    strengths,
    challenges,
    recommendation,
  };
}

/**
 * Analyze launch date
 */
export function analyzeLaunchDate(
  date: Date,
  businessName: string,
  language: string = 'en'
): LaunchDateAnalysis {
  const businessNumber = calculateDestinyNumber(businessName);
  const chaldean = calculateChaldeanNameNumber(businessName);

  // Calculate universal day number
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  let universalDay = day + month + year
    .toString()
    .split('')
    .reduce((a, b) => a + parseInt(b), 0);

  while (universalDay > 9 && ![11, 22, 33].includes(universalDay)) {
    universalDay = universalDay
      .toString()
      .split('')
      .reduce((a, b) => a + parseInt(b), 0);
  }

  // Calculate compatibility
  const compatibleDays: Record<number, number[]> = {
    1: [1, 4, 5],
    2: [2, 7, 9],
    3: [3, 6, 9],
    4: [1, 4, 8],
    5: [5, 6, 9],
    6: [3, 6, 9],
    7: [2, 7],
    8: [4, 8],
    9: [3, 6, 9],
  };

  const isCompatible = compatibleDays[chaldean.single]?.includes(universalDay);
  let compatibility = isCompatible ? 80 : 50;

  // Master number day bonus
  if ([11, 22, 33].includes(universalDay)) compatibility += 15;

  // Same number bonus
  if (universalDay === businessNumber) compatibility += 10;

  const isAuspicious = compatibility >= 70;

  const reasons = getLaunchDateReasons(universalDay, businessNumber, isAuspicious, language);

  return {
    date,
    universalDay,
    businessNumber,
    compatibility: Math.min(100, compatibility),
    isAuspicious,
    reasons,
  };
}

/**
 * Find best launch dates in a range
 */
export function findBestLaunchDates(
  businessName: string,
  startDate: Date,
  endDate: Date,
  count: number = 5
): LaunchDateAnalysis[] {
  const results: LaunchDateAnalysis[] = [];
  const currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    const analysis = analyzeLaunchDate(currentDate, businessName);
    results.push(analysis);
    currentDate.setDate(currentDate.getDate() + 1);
  }

  // Sort by compatibility and return top results
  return results
    .sort((a, b) => b.compatibility - a.compatibility)
    .slice(0, count);
}

/**
 * Generate name variations with scores
 */
export function generateBusinessNameVariations(
  baseName: string,
  language: string = 'en'
): Array<{ name: string; analysis: BusinessFullAnalysis }> {
  const variations: string[] = [];
  const suffixes = ['Inc', 'Co', 'Group', 'Pro', 'Plus', 'Labs', 'Hub', 'X'];
  const prefixes = ['New', 'Prime', 'Alpha', 'Pro', 'Elite'];

  // Add suffixes
  suffixes.forEach(suffix => {
    variations.push(`${baseName} ${suffix}`);
  });

  // Add prefixes
  prefixes.forEach(prefix => {
    variations.push(`${prefix} ${baseName}`);
  });

  // Analyze each variation
  return variations
    .map(name => ({
      name,
      analysis: analyzeBusinessFull(name, language),
    }))
    .sort((a, b) => b.analysis.overallScore - a.analysis.overallScore);
}

// Helper functions

function getIndustriesToAvoid(number: number, language: string): string[] {
  const avoidMap: Record<string, Record<number, string[]>> = {
    en: {
      1: ['Partnerships', 'Collaborative ventures'],
      2: ['High-risk ventures', 'Solo enterprises'],
      3: ['Heavy manufacturing', 'Finance'],
      4: ['Creative industries', 'Entertainment'],
      5: ['Traditional banking', 'Government'],
      6: ['Aggressive sales', 'Competition-heavy'],
      7: ['Mass market retail', 'Social businesses'],
      8: ['Non-profits', 'Spiritual services'],
      9: ['Purely profit-focused', 'Finance'],
    },
    ro: {
      1: ['Parteneriate', 'Inițiative colaborative'],
      2: ['Afaceri cu risc mare', 'Întreprinderi solo'],
      3: ['Producție grea', 'Finanțe'],
      4: ['Industrii creative', 'Divertisment'],
      5: ['Bănci tradiționale', 'Guvern'],
      6: ['Vânzări agresive', 'Competiție intensă'],
      7: ['Retail de masă', 'Afaceri sociale'],
      8: ['ONG-uri', 'Servicii spirituale'],
      9: ['Doar profit', 'Finanțe'],
    },
  };

  const langMap = avoidMap[language] || avoidMap.en;
  return langMap[number] || [];
}

function getCompatiblePartnerNumbers(number: number): number[] {
  const compatibility: Record<number, number[]> = {
    1: [1, 3, 5, 9],
    2: [2, 4, 6, 8],
    3: [1, 3, 5, 6, 9],
    4: [2, 4, 6, 8],
    5: [1, 3, 5, 7, 9],
    6: [2, 3, 6, 9],
    7: [5, 7],
    8: [2, 4, 6, 8],
    9: [1, 3, 6, 9],
  };
  return compatibility[number] || [1, 5, 9];
}

function getCompatibleEmployeeNumbers(number: number): number[] {
  const compatibility: Record<number, number[]> = {
    1: [2, 4, 6],
    2: [1, 3, 9],
    3: [2, 6, 9],
    4: [1, 6, 8],
    5: [3, 6, 9],
    6: [1, 2, 3, 9],
    7: [2, 6],
    8: [2, 4, 6],
    9: [1, 3, 6],
  };
  return compatibility[number] || [2, 6, 9];
}

function generateBusinessRecommendations(
  pythagoreanNumber: number,
  chaldean: { compound: number; single: number; isLucky: boolean },
  score: number,
  language: string
): string[] {
  const recommendations: string[] = [];

  const translations: Record<string, Record<string, string>> = {
    en: {
      excellentName: 'This is an excellent business name with strong numerological support.',
      goodName: 'This is a good business name with favorable energy.',
      moderateName: 'Consider adding a letter or suffix to improve the numerological vibration.',
      weakName: 'Consider modifying the name for better numerological alignment.',
      luckyChaldean: 'The Chaldean system indicates this is a lucky name for business.',
      masterNumber: 'Master number present - exceptional potential for large-scale success.',
    },
    ro: {
      excellentName: 'Acesta este un nume excelent pentru afaceri cu suport numerologic puternic.',
      goodName: 'Acesta este un nume bun pentru afaceri cu energie favorabilă.',
      moderateName: 'Consideră adăugarea unei litere sau sufix pentru a îmbunătăți vibrația.',
      weakName: 'Consideră modificarea numelui pentru o aliniere numerologică mai bună.',
      luckyChaldean: 'Sistemul Caldean indică că acesta este un nume norocos pentru afaceri.',
      masterNumber: 'Număr Master prezent - potențial excepțional pentru succes la scară mare.',
    },
  };

  const t = translations[language] || translations.en;

  if (score >= 80) {
    recommendations.push(t.excellentName);
  } else if (score >= 60) {
    recommendations.push(t.goodName);
  } else if (score >= 40) {
    recommendations.push(t.moderateName);
  } else {
    recommendations.push(t.weakName);
  }

  if (chaldean.isLucky) {
    recommendations.push(t.luckyChaldean);
  }

  if ([11, 22, 33].includes(pythagoreanNumber)) {
    recommendations.push(t.masterNumber);
  }

  return recommendations;
}

function getPartnershipTranslations(language: string): Record<string, string> {
  const translations: Record<string, Record<string, string>> = {
    en: {
      excellent: 'Excellent partnership potential - highly recommended!',
      good: 'Good partnership compatibility with synergistic energy.',
      moderate: 'Moderate compatibility - work on communication.',
      challenging: 'Challenging compatibility - requires effort and understanding.',
    },
    ro: {
      excellent: 'Potențial excelent de parteneriat - foarte recomandat!',
      good: 'Compatibilitate bună de parteneriat cu energie sinergică.',
      moderate: 'Compatibilitate moderată - lucrați la comunicare.',
      challenging: 'Compatibilitate provocatoare - necesită efort și înțelegere.',
    },
  };
  return translations[language] || translations.en;
}

function getPartnershipStrengths(n1: number, n2: number, language: string): string[] {
  const strengths: Record<string, string[]> = {
    en: ['Complementary skills', 'Balanced decision-making', 'Shared vision'],
    ro: ['Abilități complementare', 'Luare de decizii echilibrată', 'Viziune comună'],
  };
  return strengths[language] || strengths.en;
}

function getPartnershipChallenges(n1: number, n2: number, language: string): string[] {
  const challenges: Record<string, string[]> = {
    en: ['Different work styles', 'Communication gaps', 'Decision timing'],
    ro: ['Stiluri de lucru diferite', 'Lacune de comunicare', 'Timing diferit'],
  };
  return challenges[language] || challenges.en;
}

function getLaunchDateReasons(
  universalDay: number,
  businessNumber: number,
  isAuspicious: boolean,
  language: string
): string[] {
  const reasons: string[] = [];

  const translations: Record<string, Record<string, string>> = {
    en: {
      universalDay: `Universal Day ${universalDay} carries supportive energy`,
      matchingNumbers: 'Numbers align with business energy',
      masterDay: 'Master number day amplifies success potential',
      needsCaution: 'Consider alternative dates for better alignment',
    },
    ro: {
      universalDay: `Ziua Universală ${universalDay} aduce energie de susținere`,
      matchingNumbers: 'Numerele se aliniază cu energia afacerii',
      masterDay: 'Zi cu Număr Master amplifică potențialul de succes',
      needsCaution: 'Consideră date alternative pentru o aliniere mai bună',
    },
  };

  const t = translations[language] || translations.en;

  reasons.push(t.universalDay);

  if (universalDay === businessNumber) {
    reasons.push(t.matchingNumbers);
  }

  if ([11, 22, 33].includes(universalDay)) {
    reasons.push(t.masterDay);
  }

  if (!isAuspicious) {
    reasons.push(t.needsCaution);
  }

  return reasons;
}

export type { PartnershipAnalysis, LaunchDateAnalysis };
