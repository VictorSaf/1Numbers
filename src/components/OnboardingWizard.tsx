// Onboarding Wizard Component
// Guides new users through initial setup with a "wow moment"

import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Star,
  User,
  Calendar,
  Compass,
  Check,
  X,
} from 'lucide-react';
import { calculateLifePathNumber, calculateDestinyNumber } from '@/lib/numerology';
import { cn } from '@/lib/utils';

interface OnboardingWizardProps {
  onComplete: (data: { fullName: string; birthDate: string }) => void;
  onSkip?: () => void;
}

type Step = 'welcome' | 'name' | 'birthdate' | 'reveal' | 'complete';

export const OnboardingWizard = ({ onComplete, onSkip }: OnboardingWizardProps) => {
  const { language } = useLanguage();
  const [currentStep, setCurrentStep] = useState<Step>('welcome');
  const [fullName, setFullName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [isRevealing, setIsRevealing] = useState(false);
  const [revealedNumber, setRevealedNumber] = useState<number | null>(null);

  const translations: Record<string, Record<string, string>> = {
    ro: {
      welcome: 'Bine ai venit!',
      welcomeSubtitle: 'Descoperă secretele numerelor tale',
      welcomeDesc: 'În doar câteva secunde, vei afla informații fascinante despre personalitatea și destinul tău.',
      start: 'Începe Călătoria',
      skip: 'Sari peste',
      nameStep: 'Cum te numești?',
      nameDesc: 'Numele tău complet ascunde vibrații numerice unice.',
      namePlaceholder: 'Numele tău complet',
      birthdateStep: 'Când te-ai născut?',
      birthdateDesc: 'Data nașterii tale dezvăluie Numărul Destinului.',
      revealStep: 'Numărul Tău de Destin',
      revealDesc: 'Acesta este numărul care îți ghidează viața...',
      calculating: 'Se calculează...',
      yourNumber: 'Numărul tău este',
      completeStep: 'Ești gata!',
      completeDesc: 'Acum poți explora toate instrumentele numerologice.',
      explore: 'Explorează Aplicația',
      back: 'Înapoi',
      next: 'Continuă',
      step: 'Pasul',
      of: 'din',
    },
    en: {
      welcome: 'Welcome!',
      welcomeSubtitle: 'Discover the secrets of your numbers',
      welcomeDesc: 'In just a few seconds, you\'ll learn fascinating insights about your personality and destiny.',
      start: 'Start Your Journey',
      skip: 'Skip',
      nameStep: 'What\'s your name?',
      nameDesc: 'Your full name holds unique numerical vibrations.',
      namePlaceholder: 'Your full name',
      birthdateStep: 'When were you born?',
      birthdateDesc: 'Your birth date reveals your Life Path Number.',
      revealStep: 'Your Life Path Number',
      revealDesc: 'This is the number that guides your life...',
      calculating: 'Calculating...',
      yourNumber: 'Your number is',
      completeStep: 'You\'re all set!',
      completeDesc: 'Now you can explore all the numerology tools.',
      explore: 'Explore the App',
      back: 'Back',
      next: 'Continue',
      step: 'Step',
      of: 'of',
    },
    ru: {
      welcome: 'Добро пожаловать!',
      welcomeSubtitle: 'Откройте секреты ваших чисел',
      welcomeDesc: 'Всего за несколько секунд вы узнаете увлекательные факты о вашей личности и судьбе.',
      start: 'Начать Путешествие',
      skip: 'Пропустить',
      nameStep: 'Как вас зовут?',
      nameDesc: 'Ваше полное имя хранит уникальные числовые вибрации.',
      namePlaceholder: 'Ваше полное имя',
      birthdateStep: 'Когда вы родились?',
      birthdateDesc: 'Ваша дата рождения раскрывает Число Жизненного Пути.',
      revealStep: 'Ваше Число Жизненного Пути',
      revealDesc: 'Это число, которое направляет вашу жизнь...',
      calculating: 'Вычисление...',
      yourNumber: 'Ваше число',
      completeStep: 'Вы готовы!',
      completeDesc: 'Теперь вы можете исследовать все инструменты нумерологии.',
      explore: 'Исследовать Приложение',
      back: 'Назад',
      next: 'Продолжить',
      step: 'Шаг',
      of: 'из',
    },
  };

  const t = translations[language] || translations.en;

  const steps: Step[] = ['welcome', 'name', 'birthdate', 'reveal', 'complete'];
  const currentStepIndex = steps.indexOf(currentStep);
  const progress = ((currentStepIndex) / (steps.length - 1)) * 100;

  const handleNext = () => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < steps.length) {
      if (steps[nextIndex] === 'reveal') {
        setIsRevealing(true);
        setCurrentStep('reveal');
        // Animate the reveal
        setTimeout(() => {
          const date = new Date(birthDate);
          const lifePath = calculateLifePathNumber(date);
          setRevealedNumber(lifePath);
          setIsRevealing(false);
        }, 2000);
      } else {
        setCurrentStep(steps[nextIndex]);
      }
    }
  };

  const handleBack = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(steps[prevIndex]);
    }
  };

  const handleComplete = () => {
    onComplete({ fullName, birthDate });
  };

  const canProceed = () => {
    switch (currentStep) {
      case 'name':
        return fullName.trim().length >= 2;
      case 'birthdate':
        return birthDate !== '';
      default:
        return true;
    }
  };

  // Number meanings for the reveal
  const numberMeanings: Record<number, Record<string, string>> = {
    1: { en: 'The Leader - Independent, ambitious, pioneering', ro: 'Liderul - Independent, ambițios, pionier', ru: 'Лидер - Независимый, амбициозный, первопроходец' },
    2: { en: 'The Diplomat - Cooperative, sensitive, harmonious', ro: 'Diplomatul - Cooperant, sensibil, armonios', ru: 'Дипломат - Кооперативный, чувствительный, гармоничный' },
    3: { en: 'The Creator - Expressive, artistic, joyful', ro: 'Creatorul - Expresiv, artistic, vesel', ru: 'Творец - Выразительный, артистичный, радостный' },
    4: { en: 'The Builder - Practical, reliable, disciplined', ro: 'Constructorul - Practic, de încredere, disciplinat', ru: 'Строитель - Практичный, надёжный, дисциплинированный' },
    5: { en: 'The Adventurer - Free-spirited, versatile, dynamic', ro: 'Aventurierul - Liber, versatil, dinamic', ru: 'Искатель приключений - Свободолюбивый, разносторонний, динамичный' },
    6: { en: 'The Nurturer - Caring, responsible, family-oriented', ro: 'Protectorul - Grijuliu, responsabil, orientat spre familie', ru: 'Заботливый - Заботливый, ответственный, семейный' },
    7: { en: 'The Seeker - Analytical, spiritual, introspective', ro: 'Căutătorul - Analitic, spiritual, introspectiv', ru: 'Искатель - Аналитический, духовный, интроспективный' },
    8: { en: 'The Achiever - Powerful, ambitious, successful', ro: 'Realizatorul - Puternic, ambițios, de succes', ru: 'Достигатор - Сильный, амбициозный, успешный' },
    9: { en: 'The Humanitarian - Compassionate, wise, generous', ro: 'Umanitarul - Compătimitor, înțelept, generos', ru: 'Гуманитарий - Сострадательный, мудрый, щедрый' },
    11: { en: 'The Visionary - Intuitive, inspiring, spiritual master', ro: 'Vizionarul - Intuitiv, inspirator, maestru spiritual', ru: 'Визионер - Интуитивный, вдохновляющий, духовный мастер' },
    22: { en: 'The Master Builder - Ambitious visionary, powerful manifestor', ro: 'Maestrul Constructor - Vizionar ambițios, manifestator puternic', ru: 'Мастер-строитель - Амбициозный визионер, могущественный создатель' },
    33: { en: 'The Master Teacher - Enlightened healer, selfless guide', ro: 'Maestrul Învățător - Vindecător iluminat, ghid altruist', ru: 'Мастер-учитель - Просветлённый целитель, бескорыстный наставник' },
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex items-center justify-center p-4">
      <Card className="w-full max-w-lg overflow-hidden">
        {/* Progress bar */}
        {currentStep !== 'welcome' && (
          <div className="px-6 pt-4">
            <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
              <span>{t.step} {currentStepIndex} {t.of} {steps.length - 1}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        <CardContent className="p-6">
          {/* Welcome Step */}
          {currentStep === 'welcome' && (
            <div className="text-center space-y-6 py-8">
              <div className="relative inline-block">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center mx-auto animate-pulse">
                  <Compass className="h-12 w-12 text-primary" />
                </div>
                <Sparkles className="h-6 w-6 text-amber-500 absolute -top-1 -right-1 animate-bounce" />
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-2">{t.welcome}</h1>
                <p className="text-xl text-primary font-medium">{t.welcomeSubtitle}</p>
              </div>
              <p className="text-muted-foreground max-w-sm mx-auto">
                {t.welcomeDesc}
              </p>
              <div className="flex flex-col gap-3 pt-4">
                <Button size="lg" onClick={handleNext} className="gap-2">
                  {t.start}
                  <ArrowRight className="h-4 w-4" />
                </Button>
                {onSkip && (
                  <Button variant="ghost" size="sm" onClick={onSkip}>
                    {t.skip}
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Name Step */}
          {currentStep === 'name' && (
            <div className="space-y-6 py-4">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <User className="h-8 w-8 text-primary" />
                </div>
                <h2 className="text-2xl font-bold">{t.nameStep}</h2>
                <p className="text-muted-foreground mt-2">{t.nameDesc}</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="fullName">{t.namePlaceholder}</Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="John Doe"
                  className="text-lg h-12"
                  autoFocus
                />
              </div>
              <div className="flex gap-3 pt-4">
                <Button variant="outline" onClick={handleBack} className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  {t.back}
                </Button>
                <Button
                  onClick={handleNext}
                  disabled={!canProceed()}
                  className="flex-1 gap-2"
                >
                  {t.next}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Birthdate Step */}
          {currentStep === 'birthdate' && (
            <div className="space-y-6 py-4">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-purple-500/10 flex items-center justify-center mx-auto mb-4">
                  <Calendar className="h-8 w-8 text-purple-500" />
                </div>
                <h2 className="text-2xl font-bold">{t.birthdateStep}</h2>
                <p className="text-muted-foreground mt-2">{t.birthdateDesc}</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="birthDate">Date</Label>
                <Input
                  id="birthDate"
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="text-lg h-12"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <Button variant="outline" onClick={handleBack} className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  {t.back}
                </Button>
                <Button
                  onClick={handleNext}
                  disabled={!canProceed()}
                  className="flex-1 gap-2"
                >
                  {t.next}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Reveal Step */}
          {currentStep === 'reveal' && (
            <div className="text-center space-y-6 py-8">
              <div>
                <h2 className="text-2xl font-bold">{t.revealStep}</h2>
                <p className="text-muted-foreground mt-2">{t.revealDesc}</p>
              </div>

              <div className="relative py-8">
                {isRevealing ? (
                  <div className="space-y-4">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center mx-auto animate-spin">
                      <Star className="h-10 w-10 text-white" />
                    </div>
                    <p className="text-muted-foreground animate-pulse">{t.calculating}</p>
                  </div>
                ) : (
                  <div className="space-y-4 animate-in fade-in zoom-in duration-500">
                    <div className="relative inline-block">
                      <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center mx-auto shadow-lg shadow-primary/30">
                        <span className="text-5xl font-bold text-white">{revealedNumber}</span>
                      </div>
                      <Sparkles className="h-8 w-8 text-amber-400 absolute -top-2 -right-2 animate-pulse" />
                      <Sparkles className="h-6 w-6 text-amber-400 absolute -bottom-1 -left-1 animate-pulse delay-150" />
                    </div>
                    <div>
                      <p className="text-lg font-medium">{t.yourNumber} <strong>{revealedNumber}</strong></p>
                      {revealedNumber && numberMeanings[revealedNumber] && (
                        <p className="text-primary font-medium mt-2">
                          {numberMeanings[revealedNumber][language] || numberMeanings[revealedNumber].en}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {!isRevealing && (
                <div className="flex gap-3 pt-4">
                  <Button variant="outline" onClick={handleBack} className="gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    {t.back}
                  </Button>
                  <Button onClick={handleNext} className="flex-1 gap-2">
                    {t.next}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Complete Step */}
          {currentStep === 'complete' && (
            <div className="text-center space-y-6 py-8">
              <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mx-auto">
                <Check className="h-10 w-10 text-green-500" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">{t.completeStep}</h2>
                <p className="text-muted-foreground mt-2">{t.completeDesc}</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-4 text-left space-y-2">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{fullName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{new Date(birthDate).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-primary" />
                  <span>Life Path: <strong className="text-primary">{revealedNumber}</strong></span>
                </div>
              </div>
              <Button size="lg" onClick={handleComplete} className="w-full gap-2">
                <Sparkles className="h-4 w-4" />
                {t.explore}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default OnboardingWizard;
