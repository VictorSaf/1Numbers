// Premium Tier Configuration
// Defines feature access and pricing for Free/Premium/Pro tiers

export type PremiumTier = 'free' | 'premium' | 'pro';

export interface TierPricing {
  monthly: number;
  yearly: number;
  yearlyDiscount: number; // percentage saved
  currency: string;
}

export interface TierFeature {
  id: string;
  name: Record<string, string>;
  description: Record<string, string>;
  included: boolean;
  limit?: number | 'unlimited';
}

export interface TierDefinition {
  id: PremiumTier;
  name: Record<string, string>;
  description: Record<string, string>;
  pricing: TierPricing | null;
  features: TierFeature[];
  badge?: string;
  highlighted?: boolean;
}

// Feature IDs for easy reference
export const FEATURES = {
  BASIC_CALCULATORS: 'basic_calculators',
  ADVANCED_CALCULATORS: 'advanced_calculators',
  DAILY_PREDICTIONS: 'daily_predictions',
  FULL_PREDICTIONS: 'full_predictions',
  LO_SHU_BASIC: 'lo_shu_basic',
  LO_SHU_FULL: 'lo_shu_full',
  CHALDEAN_SYSTEM: 'chaldean_system',
  COMPATIBILITY: 'compatibility',
  AI_CONSULTANT: 'ai_consultant',
  PDF_EXPORT: 'pdf_export',
  NO_ADS: 'no_ads',
  PRIORITY_SUPPORT: 'priority_support',
  BUSINESS_TOOLS: 'business_tools',
  API_ACCESS: 'api_access',
  WHITE_LABEL: 'white_label',
  EARLY_ACCESS: 'early_access',
  CUSTOM_REPORTS: 'custom_reports',
  LIVE_CONSULTATION: 'live_consultation',
} as const;

// Tier Definitions
export const TIERS: TierDefinition[] = [
  {
    id: 'free',
    name: {
      en: 'Free',
      ro: 'Gratuit',
      ru: 'Бесплатно',
    },
    description: {
      en: 'Essential numerology tools to get started',
      ro: 'Instrumente esențiale de numerologie pentru început',
      ru: 'Основные инструменты нумерологии для начала',
    },
    pricing: null,
    features: [
      {
        id: FEATURES.BASIC_CALCULATORS,
        name: { en: 'Basic Calculators', ro: 'Calculatoare de Bază', ru: 'Базовые Калькуляторы' },
        description: {
          en: 'Life Path, Destiny, Soul Urge, Personality',
          ro: 'Life Path, Destin, Suflet, Personalitate',
          ru: 'Путь Жизни, Судьба, Душа, Личность',
        },
        included: true,
      },
      {
        id: FEATURES.DAILY_PREDICTIONS,
        name: { en: 'Daily Predictions', ro: 'Predicții Zilnice', ru: 'Ежедневные Прогнозы' },
        description: {
          en: 'Limited daily forecasts',
          ro: 'Predicții zilnice limitate',
          ru: 'Ограниченные ежедневные прогнозы',
        },
        included: true,
        limit: 1,
      },
      {
        id: FEATURES.LO_SHU_BASIC,
        name: { en: 'Lo Shu Grid Basic', ro: 'Lo Shu Grid Basic', ru: 'Сетка Ло Шу Базовая' },
        description: {
          en: 'Basic grid visualization',
          ro: 'Vizualizare grid de bază',
          ru: 'Базовая визуализация сетки',
        },
        included: true,
      },
      {
        id: FEATURES.COMPATIBILITY,
        name: { en: 'Compatibility', ro: 'Compatibilitate', ru: 'Совместимость' },
        description: {
          en: '3 compatibility checks per month',
          ro: '3 verificări compatibilitate pe lună',
          ru: '3 проверки совместимости в месяц',
        },
        included: true,
        limit: 3,
      },
      {
        id: FEATURES.NO_ADS,
        name: { en: 'Ad-Free', ro: 'Fără Reclame', ru: 'Без Рекламы' },
        description: {
          en: 'Browse without advertisements',
          ro: 'Navigare fără reclame',
          ru: 'Просмотр без рекламы',
        },
        included: false,
      },
    ],
  },
  {
    id: 'premium',
    name: {
      en: 'Premium',
      ro: 'Premium',
      ru: 'Премиум',
    },
    description: {
      en: 'Complete numerology experience for enthusiasts',
      ro: 'Experiența completă de numerologie pentru entuziaști',
      ru: 'Полный опыт нумерологии для энтузиастов',
    },
    pricing: {
      monthly: 4.99,
      yearly: 39.99,
      yearlyDiscount: 33,
      currency: 'EUR',
    },
    highlighted: true,
    badge: '⭐',
    features: [
      {
        id: FEATURES.BASIC_CALCULATORS,
        name: { en: 'All Calculators', ro: 'Toate Calculatoarele', ru: 'Все Калькуляторы' },
        description: {
          en: 'All basic + advanced numerology tools',
          ro: 'Toate instrumentele de bază + avansate',
          ru: 'Все базовые + продвинутые инструменты',
        },
        included: true,
      },
      {
        id: FEATURES.FULL_PREDICTIONS,
        name: { en: 'Full Predictions', ro: 'Predicții Complete', ru: 'Полные Прогнозы' },
        description: {
          en: 'Daily, weekly, monthly, yearly forecasts',
          ro: 'Predicții zilnice, săptămânale, lunare, anuale',
          ru: 'Ежедневные, еженедельные, месячные, годовые прогнозы',
        },
        included: true,
      },
      {
        id: FEATURES.LO_SHU_FULL,
        name: { en: 'Lo Shu Grid Complete', ro: 'Lo Shu Grid Complet', ru: 'Сетка Ло Шу Полная' },
        description: {
          en: 'Full analysis with remedies',
          ro: 'Analiză completă cu remedii',
          ru: 'Полный анализ с рекомендациями',
        },
        included: true,
      },
      {
        id: FEATURES.CHALDEAN_SYSTEM,
        name: { en: 'Chaldean System', ro: 'Sistemul Chaldean', ru: 'Халдейская Система' },
        description: {
          en: 'Alternative numerology system',
          ro: 'Sistem alternativ de numerologie',
          ru: 'Альтернативная система нумерологии',
        },
        included: true,
      },
      {
        id: FEATURES.COMPATIBILITY,
        name: { en: 'Unlimited Compatibility', ro: 'Compatibilitate Nelimitată', ru: 'Безлимитная Совместимость' },
        description: {
          en: 'Unlimited compatibility checks',
          ro: 'Verificări nelimitate de compatibilitate',
          ru: 'Неограниченные проверки совместимости',
        },
        included: true,
        limit: 'unlimited',
      },
      {
        id: FEATURES.AI_CONSULTANT,
        name: { en: 'AI Consultant', ro: 'Consultant AI', ru: 'ИИ Консультант' },
        description: {
          en: '50 AI queries per month',
          ro: '50 întrebări AI pe lună',
          ru: '50 запросов к ИИ в месяц',
        },
        included: true,
        limit: 50,
      },
      {
        id: FEATURES.PDF_EXPORT,
        name: { en: 'PDF Export', ro: 'Export PDF', ru: 'Экспорт PDF' },
        description: {
          en: 'Download readings as PDF',
          ro: 'Descarcă lecturile ca PDF',
          ru: 'Скачать чтения в PDF',
        },
        included: true,
      },
      {
        id: FEATURES.NO_ADS,
        name: { en: 'Ad-Free', ro: 'Fără Reclame', ru: 'Без Рекламы' },
        description: {
          en: 'No advertisements',
          ro: 'Fără reclame',
          ru: 'Без рекламы',
        },
        included: true,
      },
      {
        id: FEATURES.PRIORITY_SUPPORT,
        name: { en: 'Priority Support', ro: 'Suport Prioritar', ru: 'Приоритетная Поддержка' },
        description: {
          en: 'Faster response times',
          ro: 'Timp de răspuns mai rapid',
          ru: 'Быстрое время отклика',
        },
        included: true,
      },
    ],
  },
  {
    id: 'pro',
    name: {
      en: 'Pro',
      ro: 'Pro',
      ru: 'Про',
    },
    description: {
      en: 'Professional tools for practitioners and consultants',
      ro: 'Instrumente profesionale pentru practicanți și consultanți',
      ru: 'Профессиональные инструменты для практиков и консультантов',
    },
    pricing: {
      monthly: 9.99,
      yearly: 79.99,
      yearlyDiscount: 33,
      currency: 'EUR',
    },
    badge: '👑',
    features: [
      {
        id: 'all_premium',
        name: { en: 'Everything in Premium', ro: 'Tot din Premium', ru: 'Всё из Премиум' },
        description: {
          en: 'All Premium features included',
          ro: 'Toate funcțiile Premium incluse',
          ru: 'Все функции Премиум включены',
        },
        included: true,
      },
      {
        id: FEATURES.AI_CONSULTANT,
        name: { en: 'Unlimited AI', ro: 'AI Nelimitat', ru: 'Безлимитный ИИ' },
        description: {
          en: 'Unlimited AI consultant queries',
          ro: 'Întrebări nelimitate pentru consultantul AI',
          ru: 'Неограниченные запросы к ИИ консультанту',
        },
        included: true,
        limit: 'unlimited',
      },
      {
        id: FEATURES.BUSINESS_TOOLS,
        name: { en: 'Business Tools', ro: 'Instrumente Business', ru: 'Бизнес Инструменты' },
        description: {
          en: 'Business name analysis, partnership compatibility',
          ro: 'Analiză nume business, compatibilitate parteneriate',
          ru: 'Анализ названия бизнеса, совместимость партнёрств',
        },
        included: true,
      },
      {
        id: FEATURES.API_ACCESS,
        name: { en: 'API Access', ro: 'Acces API', ru: 'Доступ к API' },
        description: {
          en: 'Developer API for integrations',
          ro: 'API pentru dezvoltatori și integrări',
          ru: 'API для разработчиков и интеграций',
        },
        included: true,
      },
      {
        id: FEATURES.WHITE_LABEL,
        name: { en: 'White Label Reports', ro: 'Rapoarte White Label', ru: 'White Label Отчёты' },
        description: {
          en: 'Branded reports for your clients',
          ro: 'Rapoarte personalizate pentru clienții tăi',
          ru: 'Брендированные отчёты для ваших клиентов',
        },
        included: true,
      },
      {
        id: FEATURES.CUSTOM_REPORTS,
        name: { en: 'Custom Reports', ro: 'Rapoarte Personalizate', ru: 'Персональные Отчёты' },
        description: {
          en: 'Create customized analysis reports',
          ro: 'Creează rapoarte de analiză personalizate',
          ru: 'Создавайте персонализированные отчёты анализа',
        },
        included: true,
      },
      {
        id: FEATURES.EARLY_ACCESS,
        name: { en: 'Early Access', ro: 'Acces Anticipat', ru: 'Ранний Доступ' },
        description: {
          en: 'Be first to try new features',
          ro: 'Fii primul care testează funcții noi',
          ru: 'Первыми пробуйте новые функции',
        },
        included: true,
      },
      {
        id: FEATURES.LIVE_CONSULTATION,
        name: { en: 'Consultation Credits', ro: 'Credite Consultații', ru: 'Кредиты Консультаций' },
        description: {
          en: '2 live consultation sessions/month',
          ro: '2 sesiuni de consultații live/lună',
          ru: '2 сессии живых консультаций/месяц',
        },
        included: true,
        limit: 2,
      },
    ],
  },
];

// One-time purchase products
export interface OneTimePurchase {
  id: string;
  name: Record<string, string>;
  description: Record<string, string>;
  price: number;
  currency: string;
  type: 'report' | 'analysis' | 'consultation';
}

export const ONE_TIME_PURCHASES: OneTimePurchase[] = [
  {
    id: 'full_pdf_report',
    name: {
      en: 'Complete PDF Report',
      ro: 'Raport PDF Complet',
      ru: 'Полный PDF Отчёт',
    },
    description: {
      en: 'Comprehensive numerology report with all calculations',
      ro: 'Raport complet de numerologie cu toate calculele',
      ru: 'Полный отчёт по нумерологии со всеми расчётами',
    },
    price: 2.99,
    currency: 'EUR',
    type: 'report',
  },
  {
    id: 'lo_shu_analysis',
    name: {
      en: 'Lo Shu Grid Analysis',
      ro: 'Analiză Lo Shu Grid',
      ru: 'Анализ Сетки Ло Шу',
    },
    description: {
      en: 'Detailed Lo Shu grid interpretation with remedies',
      ro: 'Interpretare detaliată Lo Shu cu remedii',
      ru: 'Детальная интерпретация сетки Ло Шу с рекомендациями',
    },
    price: 1.99,
    currency: 'EUR',
    type: 'analysis',
  },
  {
    id: 'compatibility_deep',
    name: {
      en: 'Compatibility Deep Dive',
      ro: 'Analiză Compatibilitate Aprofundată',
      ru: 'Глубокий Анализ Совместимости',
    },
    description: {
      en: 'In-depth compatibility analysis with guidance',
      ro: 'Analiză aprofundată de compatibilitate cu ghidare',
      ru: 'Глубокий анализ совместимости с рекомендациями',
    },
    price: 1.99,
    currency: 'EUR',
    type: 'analysis',
  },
  {
    id: 'year_forecast',
    name: {
      en: 'Year Forecast Report',
      ro: 'Raport Previziuni Anuale',
      ru: 'Отчёт Годового Прогноза',
    },
    description: {
      en: 'Detailed predictions for the entire year',
      ro: 'Predicții detaliate pentru întregul an',
      ru: 'Детальные прогнозы на весь год',
    },
    price: 3.99,
    currency: 'EUR',
    type: 'report',
  },
  {
    id: 'business_analysis',
    name: {
      en: 'Business Name Analysis',
      ro: 'Analiză Nume Business',
      ru: 'Анализ Названия Бизнеса',
    },
    description: {
      en: 'Complete business numerology with recommendations',
      ro: 'Numerologie completă pentru business cu recomandări',
      ru: 'Полная бизнес-нумерология с рекомендациями',
    },
    price: 4.99,
    currency: 'EUR',
    type: 'analysis',
  },
  {
    id: 'live_consultation_30',
    name: {
      en: '30-Min Live Consultation',
      ro: 'Consultație Live 30 Min',
      ru: '30-Мин Живая Консультация',
    },
    description: {
      en: 'One-on-one session with a numerology expert',
      ro: 'Sesiune individuală cu un expert în numerologie',
      ru: 'Индивидуальная сессия с экспертом по нумерологии',
    },
    price: 29.99,
    currency: 'EUR',
    type: 'consultation',
  },
];

// Utility functions
export function getTierById(tierId: PremiumTier): TierDefinition | undefined {
  return TIERS.find(t => t.id === tierId);
}

export function hasFeature(userTier: PremiumTier, featureId: string): boolean {
  const tier = getTierById(userTier);
  if (!tier) return false;

  // Pro includes all Premium features
  if (userTier === 'pro') {
    const premiumTier = getTierById('premium');
    const premiumHas = premiumTier?.features.some(f => f.id === featureId && f.included);
    if (premiumHas) return true;
  }

  return tier.features.some(f => f.id === featureId && f.included);
}

export function getFeatureLimit(userTier: PremiumTier, featureId: string): number | 'unlimited' | null {
  const tier = getTierById(userTier);
  if (!tier) return null;

  // Pro overrides for unlimited
  if (userTier === 'pro') {
    if (featureId === FEATURES.AI_CONSULTANT || featureId === FEATURES.COMPATIBILITY) {
      return 'unlimited';
    }
  }

  const feature = tier.features.find(f => f.id === featureId);
  return feature?.limit ?? null;
}

export function formatPrice(price: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(price);
}

export function calculateYearlySavings(tier: TierDefinition): number {
  if (!tier.pricing) return 0;
  const monthlyTotal = tier.pricing.monthly * 12;
  return monthlyTotal - tier.pricing.yearly;
}

// Feature comparison for upgrade prompts
export function getUpgradeFeatures(currentTier: PremiumTier, targetTier: PremiumTier): TierFeature[] {
  const current = getTierById(currentTier);
  const target = getTierById(targetTier);

  if (!current || !target) return [];

  const currentFeatureIds = new Set(
    current.features.filter(f => f.included).map(f => f.id)
  );

  return target.features.filter(f => f.included && !currentFeatureIds.has(f.id));
}
