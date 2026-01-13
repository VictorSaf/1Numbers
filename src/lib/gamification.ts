/**
 * Gamification System for Numerology Compass
 *
 * Features:
 * - Daily streak tracking
 * - XP points for actions
 * - Achievement badges
 * - User levels
 * - Weekly challenges
 */

import { Language } from './translations';

// XP Values for different actions
export const XP_REWARDS = {
  DAILY_LOGIN: 10,
  COMPLETE_READING: 25,
  COMPATIBILITY_CHECK: 15,
  JOURNAL_ENTRY: 20,
  COMPLETE_COURSE: 100,
  SHARE_READING: 10,
  PROFILE_COMPLETE: 50,
  PREDICTION_VIEW: 5,
  LO_SHU_ANALYSIS: 20,
  ANGEL_NUMBER_LOOKUP: 10,
} as const;

// User levels configuration
export interface UserLevel {
  level: number;
  name: Record<Language, string>;
  minXP: number;
  maxXP: number;
  icon: string;
  color: string;
}

export const USER_LEVELS: UserLevel[] = [
  {
    level: 1,
    name: { ro: 'Novice', en: 'Novice', ru: 'Новичок' },
    minXP: 0,
    maxXP: 99,
    icon: '🌱',
    color: '#6B7280', // gray
  },
  {
    level: 2,
    name: { ro: 'Începător', en: 'Beginner', ru: 'Начинающий' },
    minXP: 100,
    maxXP: 299,
    icon: '🌿',
    color: '#10B981', // green
  },
  {
    level: 3,
    name: { ro: 'Explorator', en: 'Explorer', ru: 'Исследователь' },
    minXP: 300,
    maxXP: 599,
    icon: '⭐',
    color: '#3B82F6', // blue
  },
  {
    level: 4,
    name: { ro: 'Căutător', en: 'Seeker', ru: 'Искатель' },
    minXP: 600,
    maxXP: 999,
    icon: '✨',
    color: '#8B5CF6', // purple
  },
  {
    level: 5,
    name: { ro: 'Adept', en: 'Adept', ru: 'Адепт' },
    minXP: 1000,
    maxXP: 1999,
    icon: '🔮',
    color: '#EC4899', // pink
  },
  {
    level: 6,
    name: { ro: 'Expert', en: 'Expert', ru: 'Эксперт' },
    minXP: 2000,
    maxXP: 3999,
    icon: '💫',
    color: '#F59E0B', // amber
  },
  {
    level: 7,
    name: { ro: 'Maestru', en: 'Master', ru: 'Мастер' },
    minXP: 4000,
    maxXP: 7999,
    icon: '👑',
    color: '#EF4444', // red
  },
  {
    level: 8,
    name: { ro: 'Înțelept', en: 'Sage', ru: 'Мудрец' },
    minXP: 8000,
    maxXP: 14999,
    icon: '🌟',
    color: '#D946EF', // fuchsia
  },
  {
    level: 9,
    name: { ro: 'Iluminat', en: 'Enlightened', ru: 'Просветлённый' },
    minXP: 15000,
    maxXP: Infinity,
    icon: '☀️',
    color: '#FFD700', // gold
  },
];

// Achievement badge definitions
export interface Achievement {
  id: string;
  name: Record<Language, string>;
  description: Record<Language, string>;
  icon: string;
  requirement: AchievementRequirement;
  xpReward: number;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
}

export interface AchievementRequirement {
  type: 'streak' | 'xp' | 'action_count' | 'level' | 'special';
  action?: string;
  count?: number;
}

export const ACHIEVEMENTS: Achievement[] = [
  // Streak achievements
  {
    id: 'first_steps',
    name: { ro: 'Primii Pași', en: 'First Steps', ru: 'Первые Шаги' },
    description: {
      ro: 'Completează prima ta lectură numerologică',
      en: 'Complete your first numerology reading',
      ru: 'Завершите свой первый нумерологический анализ',
    },
    icon: '🌟',
    requirement: { type: 'action_count', action: 'reading', count: 1 },
    xpReward: 50,
    rarity: 'common',
  },
  {
    id: 'streak_3',
    name: { ro: '3 Zile la Rând', en: '3-Day Streak', ru: '3 Дня Подряд' },
    description: {
      ro: '3 zile consecutive de activitate',
      en: '3 consecutive days of activity',
      ru: '3 дня подряд активности',
    },
    icon: '🔥',
    requirement: { type: 'streak', count: 3 },
    xpReward: 30,
    rarity: 'common',
  },
  {
    id: 'streak_7',
    name: { ro: 'Săptămâna Mistică', en: 'Mystic Week', ru: 'Мистическая Неделя' },
    description: {
      ro: '7 zile consecutive de activitate',
      en: '7 consecutive days of activity',
      ru: '7 дней подряд активности',
    },
    icon: '🔥',
    requirement: { type: 'streak', count: 7 },
    xpReward: 100,
    rarity: 'uncommon',
  },
  {
    id: 'streak_30',
    name: { ro: 'Luna Numerelor', en: 'Month of Numbers', ru: 'Месяц Чисел' },
    description: {
      ro: '30 zile consecutive de activitate',
      en: '30 consecutive days of activity',
      ru: '30 дней подряд активности',
    },
    icon: '🏆',
    requirement: { type: 'streak', count: 30 },
    xpReward: 500,
    rarity: 'rare',
  },
  {
    id: 'streak_100',
    name: { ro: 'Maestrul Dedicat', en: 'Dedicated Master', ru: 'Преданный Мастер' },
    description: {
      ro: '100 zile consecutive de activitate',
      en: '100 consecutive days of activity',
      ru: '100 дней подряд активности',
    },
    icon: '💎',
    requirement: { type: 'streak', count: 100 },
    xpReward: 2000,
    rarity: 'legendary',
  },
  // Action achievements
  {
    id: 'number_explorer',
    name: { ro: 'Exploratorul Numerelor', en: 'Number Explorer', ru: 'Исследователь Чисел' },
    description: {
      ro: 'Calculează toate numerele personale',
      en: 'Calculate all personal numbers',
      ru: 'Рассчитайте все личные числа',
    },
    icon: '💫',
    requirement: { type: 'action_count', action: 'all_numbers', count: 1 },
    xpReward: 100,
    rarity: 'uncommon',
  },
  {
    id: 'compatibility_pro',
    name: { ro: 'Expert Compatibilitate', en: 'Compatibility Pro', ru: 'Профи Совместимости' },
    description: {
      ro: '10 analize de compatibilitate',
      en: '10 compatibility analyses',
      ru: '10 анализов совместимости',
    },
    icon: '🤝',
    requirement: { type: 'action_count', action: 'compatibility', count: 10 },
    xpReward: 150,
    rarity: 'uncommon',
  },
  {
    id: 'compatibility_master',
    name: { ro: 'Maestrul Armoniei', en: 'Harmony Master', ru: 'Мастер Гармонии' },
    description: {
      ro: '50 analize de compatibilitate',
      en: '50 compatibility analyses',
      ru: '50 анализов совместимости',
    },
    icon: '💕',
    requirement: { type: 'action_count', action: 'compatibility', count: 50 },
    xpReward: 500,
    rarity: 'rare',
  },
  {
    id: 'journal_keeper',
    name: { ro: 'Scriitorul', en: 'Journal Keeper', ru: 'Хранитель Дневника' },
    description: {
      ro: '30 de intrări în jurnal',
      en: '30 journal entries',
      ru: '30 записей в дневнике',
    },
    icon: '✍️',
    requirement: { type: 'action_count', action: 'journal', count: 30 },
    xpReward: 300,
    rarity: 'rare',
  },
  {
    id: 'scholar',
    name: { ro: 'Savantul', en: 'Scholar', ru: 'Учёный' },
    description: {
      ro: '5 cursuri completate',
      en: '5 courses completed',
      ru: '5 завершённых курсов',
    },
    icon: '📚',
    requirement: { type: 'action_count', action: 'course', count: 5 },
    xpReward: 500,
    rarity: 'rare',
  },
  {
    id: 'social_butterfly',
    name: { ro: 'Fluturele Social', en: 'Social Butterfly', ru: 'Социальная Бабочка' },
    description: {
      ro: 'Distribuie 10 lectări pe social media',
      en: 'Share 10 readings on social media',
      ru: 'Поделитесь 10 анализами в соц. сетях',
    },
    icon: '🦋',
    requirement: { type: 'action_count', action: 'share', count: 10 },
    xpReward: 200,
    rarity: 'uncommon',
  },
  {
    id: 'lo_shu_master',
    name: { ro: 'Maestrul Lo Shu', en: 'Lo Shu Master', ru: 'Мастер Ло Шу' },
    description: {
      ro: '20 analize Lo Shu Grid',
      en: '20 Lo Shu Grid analyses',
      ru: '20 анализов сетки Ло Шу',
    },
    icon: '🎯',
    requirement: { type: 'action_count', action: 'loshu', count: 20 },
    xpReward: 250,
    rarity: 'uncommon',
  },
  {
    id: 'angel_whisperer',
    name: { ro: 'Șoptitorul Îngerilor', en: 'Angel Whisperer', ru: 'Шептун Ангелов' },
    description: {
      ro: '50 căutări de numere îngeri',
      en: '50 angel number lookups',
      ru: '50 поисков ангельских чисел',
    },
    icon: '😇',
    requirement: { type: 'action_count', action: 'angel_number', count: 50 },
    xpReward: 300,
    rarity: 'rare',
  },
  // Level achievements
  {
    id: 'level_5',
    name: { ro: 'Adeptul', en: 'The Adept', ru: 'Адепт' },
    description: {
      ro: 'Atinge nivelul 5',
      en: 'Reach level 5',
      ru: 'Достигните 5-го уровня',
    },
    icon: '🔮',
    requirement: { type: 'level', count: 5 },
    xpReward: 300,
    rarity: 'rare',
  },
  {
    id: 'level_7',
    name: { ro: 'Maestrul Numerelor', en: 'Master of Numbers', ru: 'Мастер Чисел' },
    description: {
      ro: 'Atinge nivelul 7',
      en: 'Reach level 7',
      ru: 'Достигните 7-го уровня',
    },
    icon: '👑',
    requirement: { type: 'level', count: 7 },
    xpReward: 700,
    rarity: 'epic',
  },
  {
    id: 'level_9',
    name: { ro: 'Iluminatul', en: 'The Enlightened', ru: 'Просветлённый' },
    description: {
      ro: 'Atinge nivelul maxim',
      en: 'Reach maximum level',
      ru: 'Достигните максимального уровня',
    },
    icon: '☀️',
    requirement: { type: 'level', count: 9 },
    xpReward: 1000,
    rarity: 'legendary',
  },
  // Special achievements
  {
    id: 'master_number',
    name: { ro: 'Născut Special', en: 'Born Special', ru: 'Особенный' },
    description: {
      ro: 'Ai un număr master în profilul tău',
      en: 'You have a master number in your profile',
      ru: 'У вас есть мастер-число в профиле',
    },
    icon: '⚡',
    requirement: { type: 'special', action: 'has_master_number' },
    xpReward: 100,
    rarity: 'uncommon',
  },
  {
    id: 'perfect_profile',
    name: { ro: 'Profil Complet', en: 'Complete Profile', ru: 'Полный Профиль' },
    description: {
      ro: 'Completează toate datele din profil',
      en: 'Complete all profile data',
      ru: 'Заполните все данные профиля',
    },
    icon: '✅',
    requirement: { type: 'special', action: 'complete_profile' },
    xpReward: 50,
    rarity: 'common',
  },
];

// User gamification state interface
export interface UserGamificationState {
  xp: number;
  level: number;
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string | null;
  achievements: string[]; // Array of achievement IDs
  actionCounts: Record<string, number>;
}

// Default initial state
export const DEFAULT_GAMIFICATION_STATE: UserGamificationState = {
  xp: 0,
  level: 1,
  currentStreak: 0,
  longestStreak: 0,
  lastActivityDate: null,
  achievements: [],
  actionCounts: {},
};

/**
 * Calculate user level from XP
 */
export const calculateLevel = (xp: number): UserLevel => {
  for (let i = USER_LEVELS.length - 1; i >= 0; i--) {
    if (xp >= USER_LEVELS[i].minXP) {
      return USER_LEVELS[i];
    }
  }
  return USER_LEVELS[0];
};

/**
 * Calculate XP progress to next level
 */
export const calculateLevelProgress = (xp: number): { current: number; next: number; percentage: number } => {
  const currentLevel = calculateLevel(xp);
  const nextLevelIndex = Math.min(currentLevel.level, USER_LEVELS.length - 1);
  const nextLevel = USER_LEVELS[nextLevelIndex];

  if (currentLevel.maxXP === Infinity) {
    return { current: xp - currentLevel.minXP, next: 0, percentage: 100 };
  }

  const current = xp - currentLevel.minXP;
  const next = nextLevel.minXP - currentLevel.minXP;
  const percentage = Math.min((current / next) * 100, 100);

  return { current, next, percentage };
};

/**
 * Check if today is a new day compared to last activity
 */
export const isNewDay = (lastActivityDate: string | null): boolean => {
  if (!lastActivityDate) return true;

  const today = new Date().toISOString().split('T')[0];
  return lastActivityDate !== today;
};

/**
 * Calculate streak based on last activity date
 */
export const calculateStreak = (
  currentStreak: number,
  lastActivityDate: string | null
): { newStreak: number; streakBroken: boolean } => {
  if (!lastActivityDate) {
    return { newStreak: 1, streakBroken: false };
  }

  const today = new Date();
  const lastActivity = new Date(lastActivityDate);
  const diffTime = today.getTime() - lastActivity.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    // Same day, no change
    return { newStreak: currentStreak, streakBroken: false };
  } else if (diffDays === 1) {
    // Consecutive day, increment streak
    return { newStreak: currentStreak + 1, streakBroken: false };
  } else {
    // Streak broken
    return { newStreak: 1, streakBroken: true };
  }
};

/**
 * Add XP and return updated state with any new achievements
 */
export const addXP = (
  state: UserGamificationState,
  amount: number,
  action?: string
): { newState: UserGamificationState; newAchievements: Achievement[] } => {
  const newXP = state.xp + amount;
  const newLevel = calculateLevel(newXP);

  const newActionCounts = { ...state.actionCounts };
  if (action) {
    newActionCounts[action] = (newActionCounts[action] || 0) + 1;
  }

  // Check for streak
  const { newStreak, streakBroken } = calculateStreak(state.currentStreak, state.lastActivityDate);

  const newState: UserGamificationState = {
    ...state,
    xp: newXP,
    level: newLevel.level,
    currentStreak: newStreak,
    longestStreak: Math.max(state.longestStreak, newStreak),
    lastActivityDate: new Date().toISOString().split('T')[0],
    actionCounts: newActionCounts,
  };

  // Check for new achievements
  const newAchievements = checkNewAchievements(state, newState);
  newState.achievements = [...state.achievements, ...newAchievements.map((a) => a.id)];

  // Add XP from new achievements
  const achievementXP = newAchievements.reduce((sum, a) => sum + a.xpReward, 0);
  if (achievementXP > 0) {
    newState.xp += achievementXP;
    newState.level = calculateLevel(newState.xp).level;
  }

  return { newState, newAchievements };
};

/**
 * Check for new achievements based on state change
 */
export const checkNewAchievements = (
  oldState: UserGamificationState,
  newState: UserGamificationState
): Achievement[] => {
  const newAchievements: Achievement[] = [];

  for (const achievement of ACHIEVEMENTS) {
    // Skip already earned achievements
    if (oldState.achievements.includes(achievement.id)) continue;

    const earned = checkAchievementEarned(achievement, newState);
    if (earned) {
      newAchievements.push(achievement);
    }
  }

  return newAchievements;
};

/**
 * Check if a specific achievement is earned
 */
const checkAchievementEarned = (achievement: Achievement, state: UserGamificationState): boolean => {
  const { type, action, count } = achievement.requirement;

  switch (type) {
    case 'streak':
      return state.currentStreak >= (count || 0);

    case 'xp':
      return state.xp >= (count || 0);

    case 'action_count':
      return (state.actionCounts[action || ''] || 0) >= (count || 0);

    case 'level':
      return state.level >= (count || 0);

    case 'special':
      // Special achievements are checked elsewhere
      return false;

    default:
      return false;
  }
};

/**
 * Get achievement by ID
 */
export const getAchievementById = (id: string): Achievement | undefined => {
  return ACHIEVEMENTS.find((a) => a.id === id);
};

/**
 * Get user's earned achievements
 */
export const getEarnedAchievements = (achievementIds: string[]): Achievement[] => {
  return achievementIds
    .map((id) => getAchievementById(id))
    .filter((a): a is Achievement => a !== undefined);
};

/**
 * Get next achievements to unlock (based on progress)
 */
export const getNextAchievements = (state: UserGamificationState, limit = 3): Achievement[] => {
  const unearned = ACHIEVEMENTS.filter((a) => !state.achievements.includes(a.id));

  // Sort by how close user is to earning them
  const withProgress = unearned.map((achievement) => {
    const progress = calculateAchievementProgress(achievement, state);
    return { achievement, progress };
  });

  return withProgress
    .sort((a, b) => b.progress - a.progress)
    .slice(0, limit)
    .map((item) => item.achievement);
};

/**
 * Calculate progress towards an achievement (0-100)
 */
export const calculateAchievementProgress = (
  achievement: Achievement,
  state: UserGamificationState
): number => {
  const { type, action, count } = achievement.requirement;

  if (!count) return 0;

  switch (type) {
    case 'streak':
      return Math.min((state.currentStreak / count) * 100, 100);

    case 'xp':
      return Math.min((state.xp / count) * 100, 100);

    case 'action_count':
      const actionCount = state.actionCounts[action || ''] || 0;
      return Math.min((actionCount / count) * 100, 100);

    case 'level':
      return Math.min((state.level / count) * 100, 100);

    default:
      return 0;
  }
};

/**
 * Get rarity color
 */
export const getRarityColor = (rarity: Achievement['rarity']): string => {
  switch (rarity) {
    case 'common':
      return '#6B7280'; // gray
    case 'uncommon':
      return '#10B981'; // green
    case 'rare':
      return '#3B82F6'; // blue
    case 'epic':
      return '#8B5CF6'; // purple
    case 'legendary':
      return '#F59E0B'; // amber/gold
    default:
      return '#6B7280';
  }
};

/**
 * Get rarity label
 */
export const getRarityLabel = (rarity: Achievement['rarity'], language: Language): string => {
  const labels: Record<Achievement['rarity'], Record<Language, string>> = {
    common: { ro: 'Comun', en: 'Common', ru: 'Обычный' },
    uncommon: { ro: 'Neobișnuit', en: 'Uncommon', ru: 'Необычный' },
    rare: { ro: 'Rar', en: 'Rare', ru: 'Редкий' },
    epic: { ro: 'Epic', en: 'Epic', ru: 'Эпический' },
    legendary: { ro: 'Legendar', en: 'Legendary', ru: 'Легендарный' },
  };

  return labels[rarity][language];
};

// Weekly challenge definitions
export interface WeeklyChallenge {
  id: string;
  name: Record<Language, string>;
  description: Record<Language, string>;
  requirement: {
    action: string;
    count: number;
  };
  xpReward: number;
  startDate: Date;
  endDate: Date;
}

/**
 * Generate weekly challenges based on current date
 */
export const generateWeeklyChallenges = (): WeeklyChallenge[] => {
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  // Rotate through different challenges based on week number
  const weekNumber = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000));

  const challengePool: Omit<WeeklyChallenge, 'startDate' | 'endDate'>[] = [
    {
      id: 'weekly_readings',
      name: { ro: 'Explorator', en: 'Explorer', ru: 'Исследователь' },
      description: {
        ro: 'Completează 5 lectări numerologice săptămâna aceasta',
        en: 'Complete 5 numerology readings this week',
        ru: 'Завершите 5 нумерологических анализов на этой неделе',
      },
      requirement: { action: 'reading', count: 5 },
      xpReward: 150,
    },
    {
      id: 'weekly_compatibility',
      name: { ro: 'Cupid', en: 'Cupid', ru: 'Купидон' },
      description: {
        ro: 'Analizează 3 compatibilități săptămâna aceasta',
        en: 'Check 3 compatibilities this week',
        ru: 'Проверьте 3 совместимости на этой неделе',
      },
      requirement: { action: 'compatibility', count: 3 },
      xpReward: 100,
    },
    {
      id: 'weekly_journal',
      name: { ro: 'Scriitor', en: 'Writer', ru: 'Писатель' },
      description: {
        ro: 'Scrie 5 intrări în jurnal săptămâna aceasta',
        en: 'Write 5 journal entries this week',
        ru: 'Напишите 5 записей в дневнике на этой неделе',
      },
      requirement: { action: 'journal', count: 5 },
      xpReward: 125,
    },
    {
      id: 'weekly_predictions',
      name: { ro: 'Oracol', en: 'Oracle', ru: 'Оракул' },
      description: {
        ro: 'Consultă 7 previziuni zilnice',
        en: 'Check 7 daily predictions',
        ru: 'Просмотрите 7 ежедневных прогнозов',
      },
      requirement: { action: 'prediction', count: 7 },
      xpReward: 100,
    },
  ];

  // Select challenges for this week (2 at a time)
  const challenge1Index = weekNumber % challengePool.length;
  const challenge2Index = (weekNumber + 1) % challengePool.length;

  return [
    { ...challengePool[challenge1Index], startDate: startOfWeek, endDate: endOfWeek },
    { ...challengePool[challenge2Index], startDate: startOfWeek, endDate: endOfWeek },
  ];
};
