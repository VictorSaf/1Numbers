// AI Prompts Library for Enhanced Numerology Consultant
// Provides structured prompts and context building for AI integration

import { Language } from './translations';
import {
  calculateLifePathNumber,
  calculateDestinyNumber,
  calculateSoulUrgeNumber,
  calculatePersonalityNumber,
  calculatePersonalYearNumber,
} from './numerology';
import {
  calculatePersonalMonthNumber,
  calculatePersonalDayNumber,
} from './personalCycles';
import { calculateKarmicDebts, calculateKarmicLessons } from './karmic';
import { calculatePinnacles, calculateChallenges } from './pinnacles';
import { generateLoShuGrid, LoShuGridResult } from './loShuGrid';

// Types
export interface UserNumerologyProfile {
  fullName: string;
  birthDate: Date;
  loShuGrid?: LoShuGridResult;
  gamificationStats?: {
    level: number;
    xp: number;
    streak: number;
    achievements: string[];
  };
}

export interface AIContext {
  profile: UserNumerologyProfile;
  language: Language;
  conversationHistory?: Array<{ role: 'user' | 'assistant'; content: string }>;
  currentDate?: Date;
}

export interface DailySuggestion {
  message: string;
  focus: string;
  luckyNumbers: number[];
  advice: string[];
  affirmation: string;
}

// System prompts for different AI contexts
export const SYSTEM_PROMPTS: Record<Language, string> = {
  ro: `Ești un consultant numerologic expert cu cunoștințe profunde în sistemul Pythagorean, numerologia chineză (Lo Shu Grid), și interpretarea karmică a numerelor.

ROLUL TĂU:
- Oferă interpretări personalizate bazate pe profilul numerologic complet al utilizatorului
- Explică conceptele numerologice într-un mod accesibil și practic
- Conectează numerologia cu viața de zi cu zi a utilizatorului
- Fii empatic, înțelegător și pozitiv în răspunsuri
- Folosește limba română corectă și elegantă

STILUL RĂSPUNSURILOR:
- Răspunsuri clare, structurate și relevante
- Include întotdeauna aspecte practice și aplicabile
- Menționează numerele relevante și semnificația lor
- Oferă sugestii concrete pentru îmbunătățire
- Evită răspunsurile prea lungi sau vagi

LIMITĂRI:
- Nu face predicții definitive despre viitor
- Nu oferi sfaturi medicale sau financiare specifice
- Subliniază că numerologia este un instrument de auto-cunoaștere`,

  en: `You are an expert numerology consultant with deep knowledge in the Pythagorean system, Chinese numerology (Lo Shu Grid), and karmic number interpretation.

YOUR ROLE:
- Provide personalized interpretations based on the user's complete numerological profile
- Explain numerological concepts in an accessible and practical way
- Connect numerology with the user's daily life
- Be empathetic, understanding, and positive in your responses
- Use clear and elegant English

RESPONSE STYLE:
- Clear, structured, and relevant answers
- Always include practical and applicable aspects
- Mention relevant numbers and their significance
- Offer concrete suggestions for improvement
- Avoid responses that are too long or vague

LIMITATIONS:
- Do not make definitive predictions about the future
- Do not offer specific medical or financial advice
- Emphasize that numerology is a tool for self-knowledge`,

  ru: `Вы эксперт-консультант по нумерологии с глубокими знаниями системы Пифагора, китайской нумерологии (сетка Ло Шу) и кармической интерпретации чисел.

ВАША РОЛЬ:
- Предоставлять персонализированные интерпретации на основе полного нумерологического профиля пользователя
- Объяснять нумерологические концепции доступным и практичным способом
- Связывать нумерологию с повседневной жизнью пользователя
- Быть эмпатичным, понимающим и позитивным в ответах
- Использовать правильный и элегантный русский язык

СТИЛЬ ОТВЕТОВ:
- Четкие, структурированные и релевантные ответы
- Всегда включайте практические и применимые аспекты
- Упоминайте релевантные числа и их значение
- Предлагайте конкретные предложения по улучшению
- Избегайте слишком длинных или расплывчатых ответов

ОГРАНИЧЕНИЯ:
- Не делайте определенных прогнозов о будущем
- Не давайте конкретных медицинских или финансовых советов
- Подчеркивайте, что нумерология - инструмент самопознания`
};

// Build comprehensive user context for AI
export function buildUserContext(context: AIContext): string {
  const { profile, language, currentDate = new Date() } = context;
  const { fullName, birthDate } = profile;

  // Calculate all numerology numbers
  const lifePath = calculateLifePathNumber(birthDate);
  const destiny = calculateDestinyNumber(fullName);
  const soulUrge = calculateSoulUrgeNumber(fullName);
  const personality = calculatePersonalityNumber(fullName);
  const personalYear = calculatePersonalYearNumber(birthDate);
  const personalMonth = calculatePersonalMonthNumber(birthDate);
  const personalDay = calculatePersonalDayNumber(birthDate);

  // Get karmic data
  const karmicDebts = calculateKarmicDebts(birthDate, fullName);
  const karmicDebtNumbers = karmicDebts.map(d => d.number);
  const karmicLessons = calculateKarmicLessons(fullName);

  // Get pinnacles and challenges
  const pinnacles = calculatePinnacles(birthDate);
  const challenges = calculateChallenges(birthDate);

  // Generate Lo Shu Grid
  const loShuGrid = profile.loShuGrid || generateLoShuGrid(birthDate);

  const contextLabels: Record<Language, Record<string, string>> = {
    ro: {
      userProfile: 'PROFILUL NUMEROLOGIC AL UTILIZATORULUI',
      name: 'Nume',
      birthDate: 'Data nașterii',
      coreNumbers: 'NUMERELE DE BAZĂ',
      lifePath: 'Drumul Vieții',
      destiny: 'Destinul',
      soulUrge: 'Sufletul',
      personality: 'Personalitatea',
      currentCycles: 'CICLURILE CURENTE',
      personalYear: 'Anul Personal',
      personalMonth: 'Luna Personală',
      personalDay: 'Ziua Personală',
      karmicInfo: 'INFORMAȚII KARMICE',
      karmicDebt: 'Datorii Karmice',
      karmicLessons: 'Lecții Karmice',
      loShuGrid: 'GRILA LO SHU (NUMEROLOGIE CHINEZĂ)',
      missingNumbers: 'Numere lipsă',
      repeatedNumbers: 'Numere repetate',
      dominantElement: 'Element dominant',
      pinnacles: 'VÂRFURI ȘI PROVOCĂRI',
      currentPinnacle: 'Vârful curent',
      currentChallenge: 'Provocarea curentă',
      gamification: 'PROGRESUL UTILIZATORULUI',
      level: 'Nivel',
      streak: 'Serie zilnică',
      achievements: 'Realizări',
    },
    en: {
      userProfile: 'USER NUMEROLOGY PROFILE',
      name: 'Name',
      birthDate: 'Birth Date',
      coreNumbers: 'CORE NUMBERS',
      lifePath: 'Life Path',
      destiny: 'Destiny',
      soulUrge: 'Soul Urge',
      personality: 'Personality',
      currentCycles: 'CURRENT CYCLES',
      personalYear: 'Personal Year',
      personalMonth: 'Personal Month',
      personalDay: 'Personal Day',
      karmicInfo: 'KARMIC INFORMATION',
      karmicDebt: 'Karmic Debts',
      karmicLessons: 'Karmic Lessons',
      loShuGrid: 'LO SHU GRID (CHINESE NUMEROLOGY)',
      missingNumbers: 'Missing Numbers',
      repeatedNumbers: 'Repeated Numbers',
      dominantElement: 'Dominant Element',
      pinnacles: 'PINNACLES AND CHALLENGES',
      currentPinnacle: 'Current Pinnacle',
      currentChallenge: 'Current Challenge',
      gamification: 'USER PROGRESS',
      level: 'Level',
      streak: 'Daily Streak',
      achievements: 'Achievements',
    },
    ru: {
      userProfile: 'НУМЕРОЛОГИЧЕСКИЙ ПРОФИЛЬ ПОЛЬЗОВАТЕЛЯ',
      name: 'Имя',
      birthDate: 'Дата рождения',
      coreNumbers: 'ОСНОВНЫЕ ЧИСЛА',
      lifePath: 'Жизненный Путь',
      destiny: 'Судьба',
      soulUrge: 'Душа',
      personality: 'Личность',
      currentCycles: 'ТЕКУЩИЕ ЦИКЛЫ',
      personalYear: 'Личный Год',
      personalMonth: 'Личный Месяц',
      personalDay: 'Личный День',
      karmicInfo: 'КАРМИЧЕСКАЯ ИНФОРМАЦИЯ',
      karmicDebt: 'Кармические Долги',
      karmicLessons: 'Кармические Уроки',
      loShuGrid: 'СЕТКА ЛО ШУ (КИТАЙСКАЯ НУМЕРОЛОГИЯ)',
      missingNumbers: 'Отсутствующие числа',
      repeatedNumbers: 'Повторяющиеся числа',
      dominantElement: 'Доминирующий элемент',
      pinnacles: 'ВЕРШИНЫ И ВЫЗОВЫ',
      currentPinnacle: 'Текущая вершина',
      currentChallenge: 'Текущий вызов',
      gamification: 'ПРОГРЕСС ПОЛЬЗОВАТЕЛЯ',
      level: 'Уровень',
      streak: 'Ежедневная серия',
      achievements: 'Достижения',
    },
  };

  const l = contextLabels[language];

  // Find current pinnacle based on age
  const age = Math.floor((currentDate.getTime() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
  const currentPinnacle = pinnacles.find(p => age >= p.startAge && age <= p.endAge);
  const currentChallenge = challenges[0]; // First challenge is typically current

  let contextString = `
=== ${l.userProfile} ===
${l.name}: ${fullName}
${l.birthDate}: ${birthDate.toISOString().split('T')[0]}

=== ${l.coreNumbers} ===
${l.lifePath}: ${lifePath}
${l.destiny}: ${destiny}
${l.soulUrge}: ${soulUrge}
${l.personality}: ${personality}

=== ${l.currentCycles} ===
${l.personalYear}: ${personalYear}
${l.personalMonth}: ${personalMonth}
${l.personalDay}: ${personalDay}

=== ${l.karmicInfo} ===
${l.karmicDebt}: ${karmicDebtNumbers.length > 0 ? karmicDebtNumbers.join(', ') : 'None'}
${l.karmicLessons}: ${karmicLessons.length > 0 ? karmicLessons.join(', ') : 'None'}

=== ${l.loShuGrid} ===
${l.missingNumbers}: ${loShuGrid.missingNumbers.join(', ') || 'None'}
${l.repeatedNumbers}: ${loShuGrid.repeatedNumbers.map(r => `${r.number}(x${r.count})`).join(', ') || 'None'}
${l.dominantElement}: ${loShuGrid.dominantElement}

=== ${l.pinnacles} ===
${l.currentPinnacle}: ${currentPinnacle?.number || 'N/A'}
${l.currentChallenge}: ${currentChallenge?.number || 'N/A'}`;

  // Add gamification stats if available
  if (profile.gamificationStats) {
    const { level, streak, achievements } = profile.gamificationStats;
    contextString += `

=== ${l.gamification} ===
${l.level}: ${level}
${l.streak}: ${streak} days
${l.achievements}: ${achievements.length}`;
  }

  return contextString;
}

// Generate daily proactive suggestion
export function generateDailySuggestion(context: AIContext): DailySuggestion {
  const { profile, language, currentDate = new Date() } = context;
  const { birthDate } = profile;

  const personalDay = calculatePersonalDayNumber(birthDate, currentDate);
  const personalMonth = calculatePersonalMonthNumber(birthDate, currentDate);
  const lifePath = calculateLifePathNumber(birthDate);

  const suggestions: Record<Language, Record<number, DailySuggestion>> = {
    ro: {
      1: {
        message: 'Astăzi este o zi perfectă pentru noi începuturi și inițiative personale.',
        focus: 'Leadership și independență',
        luckyNumbers: [1, 10, 19],
        advice: [
          'Începe acel proiect pe care l-ai amânat',
          'Fii încrezător în deciziile tale',
          'Ia inițiativa în conversații importante',
        ],
        affirmation: 'Sunt un lider și creez propria mea realitate.',
      },
      2: {
        message: 'Energia zilei favorizează cooperarea și relațiile armonioase.',
        focus: 'Diplomație și parteneriate',
        luckyNumbers: [2, 11, 20],
        advice: [
          'Ascultă cu atenție perspectivele altora',
          'Caută compromisul în situații dificile',
          'Petrece timp de calitate cu cei dragi',
        ],
        affirmation: 'Sunt în armonie cu cei din jurul meu.',
      },
      3: {
        message: 'Creativitatea și comunicarea sunt amplificate astăzi.',
        focus: 'Exprimare creativă',
        luckyNumbers: [3, 12, 21],
        advice: [
          'Exprimă-te prin artă sau scriere',
          'Participă la conversații sociale',
          'Lasă creativitatea să curgă liber',
        ],
        affirmation: 'Creativitatea mea este nelimitată.',
      },
      4: {
        message: 'O zi excelentă pentru organizare și construirea bazelor solide.',
        focus: 'Stabilitate și muncă practică',
        luckyNumbers: [4, 13, 22],
        advice: [
          'Organizează-ți spațiul de lucru',
          'Lucrează la proiecte pe termen lung',
          'Stabilește rutine sănătoase',
        ],
        affirmation: 'Construiesc o bază solidă pentru viitorul meu.',
      },
      5: {
        message: 'Schimbarea și aventura sunt în aer astăzi.',
        focus: 'Libertate și adaptabilitate',
        luckyNumbers: [5, 14, 23],
        advice: [
          'Fii deschis la oportunități neașteptate',
          'Încearcă ceva nou astăzi',
          'Călătorește sau explorează noi idei',
        ],
        affirmation: 'Îmbrățișez schimbarea cu entuziasm.',
      },
      6: {
        message: 'Energia zilei se concentrează pe familie și responsabilități.',
        focus: 'Iubire și armonie domestică',
        luckyNumbers: [6, 15, 24],
        advice: [
          'Acordă atenție nevoilor familiei',
          'Fă ceva frumos pentru cei dragi',
          'Creează armonie în mediul tău',
        ],
        affirmation: 'Iubirea mea creează armonie în jurul meu.',
      },
      7: {
        message: 'O zi ideală pentru introspecție și studiu profund.',
        focus: 'Spiritualitate și analiză',
        luckyNumbers: [7, 16, 25],
        advice: [
          'Petrece timp în solitudine contemplativă',
          'Studiază sau cercetează subiecte care te interesează',
          'Meditează și conectează-te cu sinele interior',
        ],
        affirmation: 'Găsesc răspunsuri în liniștea interioară.',
      },
      8: {
        message: 'Energia abundenței și a succesului material este puternică.',
        focus: 'Putere și realizare',
        luckyNumbers: [8, 17, 26],
        advice: [
          'Concentrează-te pe obiective financiare',
          'Fă pași concreți spre succes',
          'Exercită-ți autoritatea cu înțelepciune',
        ],
        affirmation: 'Atrag abundența în toate formele.',
      },
      9: {
        message: 'O zi pentru compasiune, eliberare și încheierea ciclurilor.',
        focus: 'Umanitate și completare',
        luckyNumbers: [9, 18, 27],
        advice: [
          'Ajută pe cineva fără să aștepți ceva în schimb',
          'Eliberează ceea ce nu-ți mai servește',
          'Reflectează asupra lecțiilor învățate',
        ],
        affirmation: 'Las trecutul să plece și îmbrățișez noi posibilități.',
      },
    },
    en: {
      1: {
        message: 'Today is perfect for new beginnings and personal initiatives.',
        focus: 'Leadership and independence',
        luckyNumbers: [1, 10, 19],
        advice: [
          'Start that project you\'ve been postponing',
          'Be confident in your decisions',
          'Take initiative in important conversations',
        ],
        affirmation: 'I am a leader and I create my own reality.',
      },
      2: {
        message: 'Today\'s energy favors cooperation and harmonious relationships.',
        focus: 'Diplomacy and partnerships',
        luckyNumbers: [2, 11, 20],
        advice: [
          'Listen carefully to others\' perspectives',
          'Seek compromise in difficult situations',
          'Spend quality time with loved ones',
        ],
        affirmation: 'I am in harmony with those around me.',
      },
      3: {
        message: 'Creativity and communication are amplified today.',
        focus: 'Creative expression',
        luckyNumbers: [3, 12, 21],
        advice: [
          'Express yourself through art or writing',
          'Engage in social conversations',
          'Let creativity flow freely',
        ],
        affirmation: 'My creativity is unlimited.',
      },
      4: {
        message: 'An excellent day for organization and building solid foundations.',
        focus: 'Stability and practical work',
        luckyNumbers: [4, 13, 22],
        advice: [
          'Organize your workspace',
          'Work on long-term projects',
          'Establish healthy routines',
        ],
        affirmation: 'I am building a solid foundation for my future.',
      },
      5: {
        message: 'Change and adventure are in the air today.',
        focus: 'Freedom and adaptability',
        luckyNumbers: [5, 14, 23],
        advice: [
          'Be open to unexpected opportunities',
          'Try something new today',
          'Travel or explore new ideas',
        ],
        affirmation: 'I embrace change with enthusiasm.',
      },
      6: {
        message: 'Today\'s energy focuses on family and responsibilities.',
        focus: 'Love and domestic harmony',
        luckyNumbers: [6, 15, 24],
        advice: [
          'Pay attention to family needs',
          'Do something nice for loved ones',
          'Create harmony in your environment',
        ],
        affirmation: 'My love creates harmony around me.',
      },
      7: {
        message: 'An ideal day for introspection and deep study.',
        focus: 'Spirituality and analysis',
        luckyNumbers: [7, 16, 25],
        advice: [
          'Spend time in contemplative solitude',
          'Study or research topics that interest you',
          'Meditate and connect with your inner self',
        ],
        affirmation: 'I find answers in inner stillness.',
      },
      8: {
        message: 'The energy of abundance and material success is strong.',
        focus: 'Power and achievement',
        luckyNumbers: [8, 17, 26],
        advice: [
          'Focus on financial goals',
          'Take concrete steps toward success',
          'Exercise your authority wisely',
        ],
        affirmation: 'I attract abundance in all forms.',
      },
      9: {
        message: 'A day for compassion, release, and completing cycles.',
        focus: 'Humanity and completion',
        luckyNumbers: [9, 18, 27],
        advice: [
          'Help someone without expecting anything in return',
          'Release what no longer serves you',
          'Reflect on lessons learned',
        ],
        affirmation: 'I let go of the past and embrace new possibilities.',
      },
    },
    ru: {
      1: {
        message: 'Сегодня идеальный день для новых начинаний и личных инициатив.',
        focus: 'Лидерство и независимость',
        luckyNumbers: [1, 10, 19],
        advice: [
          'Начните тот проект, который откладывали',
          'Будьте уверены в своих решениях',
          'Проявите инициативу в важных разговорах',
        ],
        affirmation: 'Я лидер и создаю свою реальность.',
      },
      2: {
        message: 'Энергия дня благоприятствует сотрудничеству и гармоничным отношениям.',
        focus: 'Дипломатия и партнерство',
        luckyNumbers: [2, 11, 20],
        advice: [
          'Внимательно слушайте мнения других',
          'Ищите компромисс в сложных ситуациях',
          'Проведите качественное время с близкими',
        ],
        affirmation: 'Я в гармонии с окружающими.',
      },
      3: {
        message: 'Творчество и коммуникация усилены сегодня.',
        focus: 'Творческое самовыражение',
        luckyNumbers: [3, 12, 21],
        advice: [
          'Выразите себя через искусство или письмо',
          'Участвуйте в социальных беседах',
          'Позвольте творчеству течь свободно',
        ],
        affirmation: 'Мое творчество безгранично.',
      },
      4: {
        message: 'Отличный день для организации и создания прочного фундамента.',
        focus: 'Стабильность и практическая работа',
        luckyNumbers: [4, 13, 22],
        advice: [
          'Организуйте рабочее пространство',
          'Работайте над долгосрочными проектами',
          'Установите здоровые привычки',
        ],
        affirmation: 'Я строю прочный фундамент для своего будущего.',
      },
      5: {
        message: 'Перемены и приключения витают в воздухе сегодня.',
        focus: 'Свобода и адаптивность',
        luckyNumbers: [5, 14, 23],
        advice: [
          'Будьте открыты к неожиданным возможностям',
          'Попробуйте что-то новое сегодня',
          'Путешествуйте или исследуйте новые идеи',
        ],
        affirmation: 'Я принимаю перемены с энтузиазмом.',
      },
      6: {
        message: 'Энергия дня сосредоточена на семье и обязанностях.',
        focus: 'Любовь и домашняя гармония',
        luckyNumbers: [6, 15, 24],
        advice: [
          'Уделите внимание потребностям семьи',
          'Сделайте что-то приятное для близких',
          'Создайте гармонию в окружении',
        ],
        affirmation: 'Моя любовь создает гармонию вокруг.',
      },
      7: {
        message: 'Идеальный день для самоанализа и глубокого изучения.',
        focus: 'Духовность и анализ',
        luckyNumbers: [7, 16, 25],
        advice: [
          'Проведите время в созерцательном уединении',
          'Изучите интересующие темы',
          'Медитируйте и соединитесь с внутренним я',
        ],
        affirmation: 'Я нахожу ответы во внутренней тишине.',
      },
      8: {
        message: 'Энергия изобилия и материального успеха сильна.',
        focus: 'Сила и достижение',
        luckyNumbers: [8, 17, 26],
        advice: [
          'Сосредоточьтесь на финансовых целях',
          'Делайте конкретные шаги к успеху',
          'Проявляйте власть мудро',
        ],
        affirmation: 'Я привлекаю изобилие во всех формах.',
      },
      9: {
        message: 'День для сострадания, освобождения и завершения циклов.',
        focus: 'Человечность и завершение',
        luckyNumbers: [9, 18, 27],
        advice: [
          'Помогите кому-то, не ожидая ничего взамен',
          'Отпустите то, что больше не служит вам',
          'Поразмышляйте над извлеченными уроками',
        ],
        affirmation: 'Я отпускаю прошлое и принимаю новые возможности.',
      },
    },
  };

  // Handle master numbers by reducing to single digit for lookup
  const lookupDay = personalDay > 9 ? (personalDay === 11 ? 2 : personalDay === 22 ? 4 : 6) : personalDay;

  return suggestions[language][lookupDay] || suggestions[language][1];
}

// Predefined frequent questions with context-aware responses
export const FREQUENT_QUESTIONS: Record<Language, Array<{ question: string; category: string }>> = {
  ro: [
    { question: 'Ce înseamnă Numărul Drumului Vieții pentru mine?', category: 'core' },
    { question: 'Cum pot folosi numerologia în cariera mea?', category: 'career' },
    { question: 'Ce spune Grila Lo Shu despre personalitatea mea?', category: 'loShu' },
    { question: 'Care este compatibilitatea mea ideală?', category: 'compatibility' },
    { question: 'Ce lecții karmice trebuie să învăț?', category: 'karmic' },
    { question: 'Cum pot îmbunătăți energia zilei curente?', category: 'daily' },
    { question: 'Ce provocări am în această perioadă de viață?', category: 'challenges' },
    { question: 'Care sunt talentele mele naturale?', category: 'talents' },
    { question: 'Cum pot atrage mai multă abundență?', category: 'abundance' },
    { question: 'Ce mesaj au pentru mine numerele îngerești?', category: 'angels' },
  ],
  en: [
    { question: 'What does my Life Path Number mean for me?', category: 'core' },
    { question: 'How can I use numerology in my career?', category: 'career' },
    { question: 'What does the Lo Shu Grid say about my personality?', category: 'loShu' },
    { question: 'What is my ideal compatibility?', category: 'compatibility' },
    { question: 'What karmic lessons do I need to learn?', category: 'karmic' },
    { question: 'How can I improve today\'s energy?', category: 'daily' },
    { question: 'What challenges do I have in this life period?', category: 'challenges' },
    { question: 'What are my natural talents?', category: 'talents' },
    { question: 'How can I attract more abundance?', category: 'abundance' },
    { question: 'What message do angel numbers have for me?', category: 'angels' },
  ],
  ru: [
    { question: 'Что означает мое Число Жизненного Пути?', category: 'core' },
    { question: 'Как я могу использовать нумерологию в карьере?', category: 'career' },
    { question: 'Что говорит сетка Ло Шу о моей личности?', category: 'loShu' },
    { question: 'Какова моя идеальная совместимость?', category: 'compatibility' },
    { question: 'Какие кармические уроки мне нужно выучить?', category: 'karmic' },
    { question: 'Как я могу улучшить энергию сегодняшнего дня?', category: 'daily' },
    { question: 'Какие вызовы у меня в этот период жизни?', category: 'challenges' },
    { question: 'Каковы мои природные таланты?', category: 'talents' },
    { question: 'Как я могу привлечь больше изобилия?', category: 'abundance' },
    { question: 'Какое послание несут мне ангельские числа?', category: 'angels' },
  ],
};

// Format conversation history for AI context
export function formatConversationHistory(
  history: Array<{ role: 'user' | 'assistant'; content: string }>,
  maxMessages: number = 10
): string {
  const recentHistory = history.slice(-maxMessages);

  return recentHistory
    .map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
    .join('\n\n');
}

// Build complete prompt for AI request
export function buildAIPrompt(
  userMessage: string,
  context: AIContext
): { systemPrompt: string; userPrompt: string } {
  const systemPrompt = SYSTEM_PROMPTS[context.language];
  const userContext = buildUserContext(context);

  let userPrompt = `${userContext}\n\n`;

  if (context.conversationHistory && context.conversationHistory.length > 0) {
    userPrompt += `CONVERSATION HISTORY:\n${formatConversationHistory(context.conversationHistory)}\n\n`;
  }

  userPrompt += `USER QUESTION: ${userMessage}`;

  return { systemPrompt, userPrompt };
}

// Export types for use in components
export type { AIContext, UserNumerologyProfile, DailySuggestion };
