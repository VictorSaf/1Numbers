// useNotifications Hook
// Manages push notification permissions, subscriptions, and preferences

import { useState, useEffect, useCallback } from 'react';
import {
  isNotificationSupported,
  getNotificationPermission,
  requestNotificationPermission,
  registerServiceWorker,
  subscribeToPush,
  unsubscribeFromPush,
  showLocalNotification,
  saveNotificationPreferences,
  loadNotificationPreferences,
  generateDailyPredictionNotification,
  generateStreakReminderNotification,
  generateAchievementNotification,
  type NotificationPreferences,
  type NotificationPayload,
  DEFAULT_PREFERENCES,
} from '@/lib/notifications';
import { useLanguage } from '@/contexts/LanguageContext';

interface UseNotificationsReturn {
  // Status
  isSupported: boolean;
  permission: NotificationPermission | 'unsupported';
  isSubscribed: boolean;
  isLoading: boolean;
  error: string | null;

  // Preferences
  preferences: NotificationPreferences;
  updatePreferences: (updates: Partial<NotificationPreferences>) => void;

  // Actions
  requestPermission: () => Promise<boolean>;
  subscribe: () => Promise<boolean>;
  unsubscribe: () => Promise<boolean>;
  sendTestNotification: () => Promise<void>;

  // Notification generators
  sendDailyPrediction: (personalDay: number) => Promise<void>;
  sendStreakReminder: (currentStreak: number) => Promise<void>;
  sendAchievementUnlock: (name: string, xp: number) => Promise<void>;
}

export const useNotifications = (): UseNotificationsReturn => {
  const { language } = useLanguage();
  const [isSupported] = useState(() => isNotificationSupported());
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>(() =>
    getNotificationPermission()
  );
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preferences, setPreferences] = useState<NotificationPreferences>(() =>
    loadNotificationPreferences()
  );
  const [swRegistration, setSwRegistration] = useState<ServiceWorkerRegistration | null>(null);

  // Initialize service worker on mount
  useEffect(() => {
    if (isSupported && permission === 'granted') {
      registerServiceWorker().then((registration) => {
        setSwRegistration(registration);
        if (registration) {
          // Check if already subscribed
          registration.pushManager.getSubscription().then((subscription) => {
            setIsSubscribed(!!subscription);
          });
        }
      });
    }
  }, [isSupported, permission]);

  // Request notification permission
  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!isSupported) {
      setError('Notifications not supported in this browser');
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await requestNotificationPermission();
      setPermission(result);

      if (result === 'granted') {
        // Register service worker after permission granted
        const registration = await registerServiceWorker();
        setSwRegistration(registration);
        return true;
      } else if (result === 'denied') {
        setError('Notification permission denied');
        return false;
      }

      return false;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to request permission');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isSupported]);

  // Subscribe to push notifications
  const subscribe = useCallback(async (): Promise<boolean> => {
    if (!swRegistration) {
      setError('Service worker not registered');
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Get VAPID public key from environment or use a placeholder
      const vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;

      if (!vapidPublicKey) {
        // For development, just mark as subscribed without actual push subscription
        console.warn('VAPID key not configured, using local notifications only');
        setIsSubscribed(true);
        updatePreferences({ enabled: true });
        return true;
      }

      const subscription = await subscribeToPush(swRegistration, vapidPublicKey);

      if (subscription) {
        // Send subscription to server
        try {
          await fetch('/api/notifications/subscribe', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
            },
            body: JSON.stringify({ subscription: subscription.toJSON() }),
          });
        } catch {
          console.warn('Failed to send subscription to server');
        }

        setIsSubscribed(true);
        updatePreferences({ enabled: true });
        return true;
      }

      return false;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to subscribe');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [swRegistration]);

  // Unsubscribe from push notifications
  const unsubscribe = useCallback(async (): Promise<boolean> => {
    if (!swRegistration) {
      setIsSubscribed(false);
      updatePreferences({ enabled: false });
      return true;
    }

    setIsLoading(true);
    setError(null);

    try {
      const success = await unsubscribeFromPush(swRegistration);

      if (success) {
        // Notify server
        try {
          await fetch('/api/notifications/unsubscribe', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
            },
          });
        } catch {
          console.warn('Failed to notify server of unsubscription');
        }
      }

      setIsSubscribed(false);
      updatePreferences({ enabled: false });
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to unsubscribe');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [swRegistration]);

  // Update preferences
  const updatePreferences = useCallback((updates: Partial<NotificationPreferences>) => {
    setPreferences((prev) => {
      const newPrefs = { ...prev, ...updates };
      saveNotificationPreferences(newPrefs);
      return newPrefs;
    });
  }, []);

  // Send test notification
  const sendTestNotification = useCallback(async (): Promise<void> => {
    if (permission !== 'granted') {
      throw new Error('Notification permission not granted');
    }

    const testPayload: NotificationPayload = {
      title: language === 'ro' ? 'Test Notificare' : language === 'ru' ? 'Тестовое Уведомление' : 'Test Notification',
      body: language === 'ro'
        ? 'Notificările funcționează corect!'
        : language === 'ru'
        ? 'Уведомления работают правильно!'
        : 'Notifications are working correctly!',
      tag: 'test',
      data: { type: 'test' },
    };

    await showLocalNotification(testPayload);
  }, [permission, language]);

  // Send daily prediction notification
  const sendDailyPrediction = useCallback(
    async (personalDay: number): Promise<void> => {
      if (permission !== 'granted' || !preferences.dailyPrediction) return;

      const payload = generateDailyPredictionNotification(personalDay, language);
      await showLocalNotification(payload);
    },
    [permission, preferences.dailyPrediction, language]
  );

  // Send streak reminder notification
  const sendStreakReminder = useCallback(
    async (currentStreak: number): Promise<void> => {
      if (permission !== 'granted' || !preferences.streakReminder) return;

      const payload = generateStreakReminderNotification(currentStreak, language);
      await showLocalNotification(payload);
    },
    [permission, preferences.streakReminder, language]
  );

  // Send achievement unlock notification
  const sendAchievementUnlock = useCallback(
    async (name: string, xp: number): Promise<void> => {
      if (permission !== 'granted' || !preferences.achievements) return;

      const payload = generateAchievementNotification(name, xp, language);
      await showLocalNotification(payload);
    },
    [permission, preferences.achievements, language]
  );

  return {
    isSupported,
    permission,
    isSubscribed,
    isLoading,
    error,
    preferences,
    updatePreferences,
    requestPermission,
    subscribe,
    unsubscribe,
    sendTestNotification,
    sendDailyPrediction,
    sendStreakReminder,
    sendAchievementUnlock,
  };
};

export default useNotifications;
