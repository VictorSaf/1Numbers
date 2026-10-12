// Push Notifications Service
// Handles browser push notifications for daily reminders and alerts

import { Language } from './translations';

export interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: Record<string, unknown>;
  actions?: NotificationAction[];
}

export interface NotificationAction {
  action: string;
  title: string;
  icon?: string;
}

export interface NotificationPreferences {
  enabled: boolean;
  dailyPrediction: boolean;
  dailyPredictionTime: string; // HH:MM format
  streakReminder: boolean;
  streakReminderTime: string;
  specialDates: boolean;
  achievements: boolean;
}

export const DEFAULT_PREFERENCES: NotificationPreferences = {
  enabled: false,
  dailyPrediction: true,
  dailyPredictionTime: '08:00',
  streakReminder: true,
  streakReminderTime: '20:00',
  specialDates: true,
  achievements: true,
};

// Check if notifications are supported
export const isNotificationSupported = (): boolean => {
  return 'Notification' in window && 'serviceWorker' in navigator;
};

// Check current permission status
export const getNotificationPermission = (): NotificationPermission | 'unsupported' => {
  if (!isNotificationSupported()) {
    return 'unsupported';
  }
  return Notification.permission;
};

// Request notification permission
export const requestNotificationPermission = async (): Promise<NotificationPermission> => {
  if (!isNotificationSupported()) {
    throw new Error('Notifications not supported');
  }

  const permission = await Notification.requestPermission();
  return permission;
};

// The registration push notifications attach to.
//
// This used to call register() itself, which was the only register() in the
// codebase and was reached only through a component with no importer -- so the
// PWA never installed. Registration now happens once, at startup, in
// lib/serviceWorker.ts; this waits for that one rather than racing it with a
// second call for the same scope.
export const getServiceWorkerRegistration = async (): Promise<ServiceWorkerRegistration | null> => {
  if (!('serviceWorker' in navigator)) {
    console.warn('Service workers not supported');
    return null;
  }

  try {
    return await navigator.serviceWorker.ready;
  } catch (error) {
    console.error('Service Worker not available:', error);
    return null;
  }
};

// Subscribe to push notifications
export const subscribeToPush = async (
  registration: ServiceWorkerRegistration,
  vapidPublicKey: string
): Promise<PushSubscription | null> => {
  try {
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
    });

    return subscription;
  } catch (error) {
    console.error('Push subscription failed:', error);
    return null;
  }
};

// Unsubscribe from push notifications
export const unsubscribeFromPush = async (
  registration: ServiceWorkerRegistration
): Promise<boolean> => {
  try {
    const subscription = await registration.pushManager.getSubscription();
    if (subscription) {
      await subscription.unsubscribe();
      return true;
    }
    return false;
  } catch (error) {
    console.error('Push unsubscription failed:', error);
    return false;
  }
};

// Show a local notification (for testing or immediate notifications)
export const showLocalNotification = async (
  payload: NotificationPayload
): Promise<void> => {
  if (!isNotificationSupported()) {
    throw new Error('Notifications not supported');
  }

  if (Notification.permission !== 'granted') {
    throw new Error('Notification permission not granted');
  }

  const registration = await navigator.serviceWorker.ready;

  const options: NotificationOptions & { actions?: unknown; vibrate?: number[] } = {
    body: payload.body,
    icon: payload.icon || '/icons/icon-192x192.png',
    badge: payload.badge || '/icons/badge-72x72.png',
    tag: payload.tag,
    data: payload.data,
    actions: payload.actions,
    vibrate: [200, 100, 200],
    requireInteraction: false,
  };
  await registration.showNotification(payload.title, options);
};

// Helper function to convert VAPID key
function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(new ArrayBuffer(rawData.length));

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}

// Notification content generators
export const generateDailyPredictionNotification = (
  personalDay: number,
  language: Language
): NotificationPayload => {
  const titles: Record<Language, string> = {
    ro: 'Energia Zilei Tale',
    en: 'Your Daily Energy',
    ru: 'Ваша Энергия Дня',
  };

  const bodies: Record<Language, Record<number, string>> = {
    ro: {
      1: 'Zi de început. Pornește ce amâni, și cere ajutorul înainte să ai nevoie de el.',
      2: 'Simți azi tensiunea din cameră înainte să fie spusă. Dezamorseaz-o fără să te ștergi pe tine.',
      3: 'Ce simți vrea azi să iasă în afară. Spune-o într-un singur loc, nu în zece.',
      4: 'Zi bună pentru ce se construiește încet. Ai grijă să nu folosești munca drept adăpost.',
      5: 'Stagnarea te costă azi mai mult decât riscul. Alege o direcție și du-o până la capăt.',
      6: 'Azi alții se sprijină pe tine. Ai grijă de ei fără să decizi în locul lor.',
      7: 'Zi de întrebări, nu de răspunsuri comode. Ai grijă să nu folosești analiza ca să nu simți.',
      8: 'Azi se măsoară. Uită-te la cifre, și ține minte că nu ele spun cât valorezi.',
      9: 'Vezi azi imaginea largă. Închide ce trebuie închis, chiar dacă nu iese perfect.',
    },
    en: {
      1: 'A day for beginnings. Start what you postpone, and ask for help before you need it.',
      2: 'Today you feel the tension before anyone names it. Defuse it without erasing yourself.',
      3: 'What you feel wants out today. Say it in one place, not in ten.',
      4: 'A good day for what is built slowly. Watch that work does not become a place to hide.',
      5: 'Standing still costs you more than the risk today. Pick one direction and finish it.',
      6: 'People lean on you today. Care for them without deciding for them.',
      7: 'A day for questions, not for comfortable answers. Watch that analysis is not a way to not feel.',
      8: 'Today things get measured. Look at the numbers, and remember they do not say what you are worth.',
      9: 'You see the whole picture today. Close what needs closing, even if it is not perfect.',
    },
    ru: {
      1: 'День начала. Начните то, что откладываете, и попросите помощь до того, как она понадобится.',
      2: 'Сегодня вы чувствуете напряжение раньше слов. Снимите его, не стирая себя.',
      3: 'То, что вы чувствуете, просится наружу. Скажите это в одном месте, а не в десяти.',
      4: 'Хороший день для того, что строится медленно. Следите, чтобы работа не стала укрытием.',
      5: 'Сегодня застой обходится дороже риска. Выберите одно направление и доведите его до конца.',
      6: 'Сегодня на вас опираются. Позаботьтесь о других, не решая за них.',
      7: 'День вопросов, а не удобных ответов. Следите, чтобы анализ не заменял чувство.',
      8: 'Сегодня всё измеряется. Смотрите на цифры и помните: они не говорят, чего вы стоите.',
      9: 'Сегодня вы видите картину целиком. Закройте то, что пора закрыть, даже если оно не идеально.',
    },
  };

  const dayKey = personalDay > 9 ? (personalDay % 9 || 9) : personalDay;

  return {
    title: titles[language],
    body: bodies[language][dayKey],
    tag: 'daily-prediction',
    data: {
      type: 'daily-prediction',
      personalDay,
      url: '/azi',
    },
    actions: [
      {
        action: 'view',
        title: language === 'ro' ? 'Vezi Detalii' : language === 'ru' ? 'Подробнее' : 'View Details',
      },
    ],
  };
};

export const generateStreakReminderNotification = (
  currentStreak: number,
  language: Language
): NotificationPayload => {
  const titles: Record<Language, string> = {
    ro: 'Nu uita de seria ta!',
    en: 'Don\'t forget your streak!',
    ru: 'Не забудьте о серии!',
  };

  const bodies: Record<Language, string> = {
    ro: currentStreak > 0
      ? `Ai o serie de ${currentStreak} zile! Intră azi pentru a o continua.`
      : 'Începe o nouă serie astăzi! Vizitează aplicația pentru energia zilnică.',
    en: currentStreak > 0
      ? `You have a ${currentStreak}-day streak! Log in today to continue it.`
      : 'Start a new streak today! Visit the app for your daily energy.',
    ru: currentStreak > 0
      ? `У вас серия ${currentStreak} дней! Войдите сегодня, чтобы продолжить.`
      : 'Начните новую серию сегодня! Посетите приложение для ежедневной энергии.',
  };

  return {
    title: titles[language],
    body: bodies[language],
    tag: 'streak-reminder',
    data: {
      type: 'streak-reminder',
      currentStreak,
      url: '/',
    },
    actions: [
      {
        action: 'open',
        title: language === 'ro' ? 'Deschide' : language === 'ru' ? 'Открыть' : 'Open',
      },
    ],
  };
};

export const generateAchievementNotification = (
  achievementName: string,
  xpAwarded: number,
  language: Language
): NotificationPayload => {
  const titles: Record<Language, string> = {
    ro: 'Realizare Deblocată!',
    en: 'Achievement Unlocked!',
    ru: 'Достижение Разблокировано!',
  };

  const bodies: Record<Language, string> = {
    ro: `Ai obținut "${achievementName}" și ${xpAwarded} XP!`,
    en: `You earned "${achievementName}" and ${xpAwarded} XP!`,
    ru: `Вы получили "${achievementName}" и ${xpAwarded} XP!`,
  };

  return {
    title: titles[language],
    body: bodies[language],
    tag: 'achievement',
    data: {
      type: 'achievement',
      achievementName,
      xpAwarded,
      url: '/eu',
    },
  };
};

// Save notification preferences to localStorage
export const saveNotificationPreferences = (preferences: NotificationPreferences): void => {
  localStorage.setItem('notification_preferences', JSON.stringify(preferences));
};

// Load notification preferences from localStorage
export const loadNotificationPreferences = (): NotificationPreferences => {
  const saved = localStorage.getItem('notification_preferences');
  if (saved) {
    try {
      return { ...DEFAULT_PREFERENCES, ...JSON.parse(saved) };
    } catch {
      return DEFAULT_PREFERENCES;
    }
  }
  return DEFAULT_PREFERENCES;
};
