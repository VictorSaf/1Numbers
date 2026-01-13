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

// Register service worker for push notifications
export const registerServiceWorker = async (): Promise<ServiceWorkerRegistration | null> => {
  if (!('serviceWorker' in navigator)) {
    console.warn('Service workers not supported');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
    });

    console.log('Service Worker registered:', registration.scope);
    return registration;
  } catch (error) {
    console.error('Service Worker registration failed:', error);
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

  await registration.showNotification(payload.title, {
    body: payload.body,
    icon: payload.icon || '/icons/icon-192x192.png',
    badge: payload.badge || '/icons/badge-72x72.png',
    tag: payload.tag,
    data: payload.data,
    actions: payload.actions,
    vibrate: [200, 100, 200],
    requireInteraction: false,
  });
};

// Helper function to convert VAPID key
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

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
      1: 'Astăzi este o zi perfectă pentru noi începuturi! Energia numărului 1 te susține.',
      2: 'Ziua favorizează cooperarea și relațiile armonioase. Fii diplomat!',
      3: 'Creativitatea ta este la maxim astăzi! Exprimă-te liber.',
      4: 'O zi excelentă pentru organizare și muncă practică.',
      5: 'Schimbarea și aventura sunt în aer! Fii deschis la nou.',
      6: 'Energia zilei se concentrează pe familie și iubire.',
      7: 'Zi ideală pentru introspecție și studiu profund.',
      8: 'Energia abundenței și succesului este puternică astăzi!',
      9: 'O zi pentru compasiune și încheierea ciclurilor.',
    },
    en: {
      1: 'Today is perfect for new beginnings! Number 1 energy supports you.',
      2: 'The day favors cooperation and harmonious relationships. Be diplomatic!',
      3: 'Your creativity is at its peak today! Express yourself freely.',
      4: 'An excellent day for organization and practical work.',
      5: 'Change and adventure are in the air! Be open to the new.',
      6: 'Today\'s energy focuses on family and love.',
      7: 'An ideal day for introspection and deep study.',
      8: 'The energy of abundance and success is strong today!',
      9: 'A day for compassion and completing cycles.',
    },
    ru: {
      1: 'Сегодня идеальный день для новых начинаний! Энергия числа 1 поддерживает вас.',
      2: 'День благоприятствует сотрудничеству и гармоничным отношениям. Будьте дипломатичны!',
      3: 'Ваша креативность на пике сегодня! Выражайте себя свободно.',
      4: 'Отличный день для организации и практической работы.',
      5: 'Перемены и приключения в воздухе! Будьте открыты новому.',
      6: 'Энергия дня сосредоточена на семье и любви.',
      7: 'Идеальный день для самоанализа и глубокого изучения.',
      8: 'Энергия изобилия и успеха сильна сегодня!',
      9: 'День для сострадания и завершения циклов.',
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
      url: '/predictions',
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
      url: '/profile',
    },
  };
};

export const generateSpecialDateNotification = (
  eventType: 'personal-year' | 'birthday' | 'pinnacle',
  language: Language
): NotificationPayload => {
  const content: Record<string, Record<Language, { title: string; body: string }>> = {
    'personal-year': {
      ro: {
        title: 'Începe un Nou An Personal!',
        body: 'Astăzi începe un nou ciclu în viața ta. Descoperă ce îți rezervă noul an personal!',
      },
      en: {
        title: 'A New Personal Year Begins!',
        body: 'Today marks the start of a new cycle in your life. Discover what your new personal year holds!',
      },
      ru: {
        title: 'Начинается Новый Личный Год!',
        body: 'Сегодня начинается новый цикл в вашей жизни. Узнайте, что приготовил новый личный год!',
      },
    },
    birthday: {
      ro: {
        title: 'La Mulți Ani!',
        body: 'Astăzi este ziua ta specială! Descoperă ce energie numerologică te așteaptă în noul an.',
      },
      en: {
        title: 'Happy Birthday!',
        body: 'Today is your special day! Discover what numerological energy awaits you in the new year.',
      },
      ru: {
        title: 'С Днём Рождения!',
        body: 'Сегодня ваш особенный день! Узнайте, какая нумерологическая энергия ждёт вас в новом году.',
      },
    },
    pinnacle: {
      ro: {
        title: 'Intri într-un Nou Vârf de Viață!',
        body: 'O nouă perioadă importantă începe în viața ta. Vezi ce provocări și oportunități te așteaptă!',
      },
      en: {
        title: 'Entering a New Life Pinnacle!',
        body: 'A new important period begins in your life. See what challenges and opportunities await!',
      },
      ru: {
        title: 'Начинается Новая Вершина Жизни!',
        body: 'Новый важный период начинается в вашей жизни. Узнайте, какие вызовы и возможности ждут!',
      },
    },
  };

  const { title, body } = content[eventType][language];

  return {
    title,
    body,
    tag: `special-date-${eventType}`,
    data: {
      type: 'special-date',
      eventType,
      url: '/predictions',
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

// Schedule a local notification (for demo/testing)
export const scheduleNotification = (
  payload: NotificationPayload,
  delayMs: number
): number => {
  const timeoutId = window.setTimeout(() => {
    showLocalNotification(payload).catch(console.error);
  }, delayMs);

  return timeoutId;
};

// Cancel a scheduled notification
export const cancelScheduledNotification = (timeoutId: number): void => {
  window.clearTimeout(timeoutId);
};
