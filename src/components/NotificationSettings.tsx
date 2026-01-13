// NotificationSettings Component
// Allows users to manage push notification preferences

import { useState } from 'react';
import { useNotifications } from '@/hooks/useNotifications';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Bell,
  BellOff,
  BellRing,
  Sun,
  Flame,
  Trophy,
  Calendar,
  Loader2,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react';

export const NotificationSettings = () => {
  const { language } = useLanguage();
  const {
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
  } = useNotifications();

  const [testSent, setTestSent] = useState(false);

  const translations: Record<string, Record<string, string>> = {
    ro: {
      title: 'Setări Notificări',
      description: 'Gestionează notificările push pentru a rămâne la curent cu energia ta zilnică',
      notSupported: 'Notificările push nu sunt suportate în acest browser.',
      permissionDenied: 'Permisiunea pentru notificări a fost refuzată. Activează-le din setările browserului.',
      enableNotifications: 'Activează Notificările',
      disableNotifications: 'Dezactivează Notificările',
      enabled: 'Notificările sunt active',
      disabled: 'Notificările sunt dezactivate',
      dailyPrediction: 'Previziune Zilnică',
      dailyPredictionDesc: 'Primește energia zilei tale în fiecare dimineață',
      streakReminder: 'Reminder Serie',
      streakReminderDesc: 'Fii notificat seara dacă nu ai vizitat aplicația',
      specialDates: 'Date Speciale',
      specialDatesDesc: 'Notificări pentru zile speciale numerologice',
      achievements: 'Realizări',
      achievementsDesc: 'Fii notificat când deblochezi o realizare',
      time: 'Ora',
      sendTest: 'Trimite Test',
      testSent: 'Notificare test trimisă!',
      requestPermission: 'Solicită Permisiune',
    },
    en: {
      title: 'Notification Settings',
      description: 'Manage push notifications to stay up to date with your daily energy',
      notSupported: 'Push notifications are not supported in this browser.',
      permissionDenied: 'Notification permission was denied. Enable it from browser settings.',
      enableNotifications: 'Enable Notifications',
      disableNotifications: 'Disable Notifications',
      enabled: 'Notifications are enabled',
      disabled: 'Notifications are disabled',
      dailyPrediction: 'Daily Prediction',
      dailyPredictionDesc: 'Receive your daily energy every morning',
      streakReminder: 'Streak Reminder',
      streakReminderDesc: 'Get notified in the evening if you haven\'t visited',
      specialDates: 'Special Dates',
      specialDatesDesc: 'Notifications for special numerological dates',
      achievements: 'Achievements',
      achievementsDesc: 'Get notified when you unlock an achievement',
      time: 'Time',
      sendTest: 'Send Test',
      testSent: 'Test notification sent!',
      requestPermission: 'Request Permission',
    },
    ru: {
      title: 'Настройки Уведомлений',
      description: 'Управляйте push-уведомлениями, чтобы быть в курсе вашей ежедневной энергии',
      notSupported: 'Push-уведомления не поддерживаются в этом браузере.',
      permissionDenied: 'Разрешение на уведомления было отклонено. Включите в настройках браузера.',
      enableNotifications: 'Включить Уведомления',
      disableNotifications: 'Отключить Уведомления',
      enabled: 'Уведомления включены',
      disabled: 'Уведомления отключены',
      dailyPrediction: 'Ежедневный Прогноз',
      dailyPredictionDesc: 'Получайте вашу ежедневную энергию каждое утро',
      streakReminder: 'Напоминание о Серии',
      streakReminderDesc: 'Получите уведомление вечером, если не посещали приложение',
      specialDates: 'Особые Даты',
      specialDatesDesc: 'Уведомления об особых нумерологических датах',
      achievements: 'Достижения',
      achievementsDesc: 'Получите уведомление при разблокировке достижения',
      time: 'Время',
      sendTest: 'Отправить Тест',
      testSent: 'Тестовое уведомление отправлено!',
      requestPermission: 'Запросить Разрешение',
    },
  };

  const t = translations[language] || translations.en;

  const handleEnableNotifications = async () => {
    if (permission !== 'granted') {
      const granted = await requestPermission();
      if (!granted) return;
    }
    await subscribe();
  };

  const handleDisableNotifications = async () => {
    await unsubscribe();
  };

  const handleSendTest = async () => {
    try {
      await sendTestNotification();
      setTestSent(true);
      setTimeout(() => setTestSent(false), 3000);
    } catch (err) {
      console.error('Failed to send test notification:', err);
    }
  };

  if (!isSupported) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <BellOff className="h-5 w-5 text-muted-foreground" />
            <CardTitle>{t.title}</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{t.notSupported}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-primary" />
          <CardTitle>{t.title}</CardTitle>
        </div>
        <CardDescription>{t.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Permission denied warning */}
        {permission === 'denied' && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{t.permissionDenied}</AlertDescription>
          </Alert>
        )}

        {/* Error display */}
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Main toggle */}
        <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
          <div className="flex items-center gap-3">
            {isSubscribed ? (
              <BellRing className="h-5 w-5 text-green-500" />
            ) : (
              <BellOff className="h-5 w-5 text-muted-foreground" />
            )}
            <div>
              <p className="font-medium">
                {isSubscribed ? t.enabled : t.disabled}
              </p>
            </div>
          </div>
          <Button
            onClick={isSubscribed ? handleDisableNotifications : handleEnableNotifications}
            disabled={isLoading || permission === 'denied'}
            variant={isSubscribed ? 'outline' : 'default'}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : isSubscribed ? (
              t.disableNotifications
            ) : permission !== 'granted' ? (
              t.requestPermission
            ) : (
              t.enableNotifications
            )}
          </Button>
        </div>

        {/* Notification preferences */}
        {isSubscribed && (
          <div className="space-y-4">
            {/* Daily Prediction */}
            <div className="flex items-center justify-between p-3 rounded-lg border">
              <div className="flex items-center gap-3">
                <Sun className="h-5 w-5 text-amber-500" />
                <div>
                  <Label htmlFor="daily-prediction" className="font-medium">
                    {t.dailyPrediction}
                  </Label>
                  <p className="text-sm text-muted-foreground">{t.dailyPredictionDesc}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Input
                  type="time"
                  value={preferences.dailyPredictionTime}
                  onChange={(e) => updatePreferences({ dailyPredictionTime: e.target.value })}
                  className="w-24"
                  disabled={!preferences.dailyPrediction}
                />
                <Switch
                  id="daily-prediction"
                  checked={preferences.dailyPrediction}
                  onCheckedChange={(checked) => updatePreferences({ dailyPrediction: checked })}
                />
              </div>
            </div>

            {/* Streak Reminder */}
            <div className="flex items-center justify-between p-3 rounded-lg border">
              <div className="flex items-center gap-3">
                <Flame className="h-5 w-5 text-orange-500" />
                <div>
                  <Label htmlFor="streak-reminder" className="font-medium">
                    {t.streakReminder}
                  </Label>
                  <p className="text-sm text-muted-foreground">{t.streakReminderDesc}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Input
                  type="time"
                  value={preferences.streakReminderTime}
                  onChange={(e) => updatePreferences({ streakReminderTime: e.target.value })}
                  className="w-24"
                  disabled={!preferences.streakReminder}
                />
                <Switch
                  id="streak-reminder"
                  checked={preferences.streakReminder}
                  onCheckedChange={(checked) => updatePreferences({ streakReminder: checked })}
                />
              </div>
            </div>

            {/* Special Dates */}
            <div className="flex items-center justify-between p-3 rounded-lg border">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-purple-500" />
                <div>
                  <Label htmlFor="special-dates" className="font-medium">
                    {t.specialDates}
                  </Label>
                  <p className="text-sm text-muted-foreground">{t.specialDatesDesc}</p>
                </div>
              </div>
              <Switch
                id="special-dates"
                checked={preferences.specialDates}
                onCheckedChange={(checked) => updatePreferences({ specialDates: checked })}
              />
            </div>

            {/* Achievements */}
            <div className="flex items-center justify-between p-3 rounded-lg border">
              <div className="flex items-center gap-3">
                <Trophy className="h-5 w-5 text-yellow-500" />
                <div>
                  <Label htmlFor="achievements" className="font-medium">
                    {t.achievements}
                  </Label>
                  <p className="text-sm text-muted-foreground">{t.achievementsDesc}</p>
                </div>
              </div>
              <Switch
                id="achievements"
                checked={preferences.achievements}
                onCheckedChange={(checked) => updatePreferences({ achievements: checked })}
              />
            </div>

            {/* Test notification button */}
            <div className="pt-4 border-t">
              <Button
                variant="outline"
                onClick={handleSendTest}
                disabled={!isSubscribed}
                className="w-full"
              >
                {testSent ? (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                    {t.testSent}
                  </>
                ) : (
                  <>
                    <Bell className="h-4 w-4 mr-2" />
                    {t.sendTest}
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default NotificationSettings;
