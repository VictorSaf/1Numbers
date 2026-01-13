// Streak Display Component
// Shows user's current streak with animations

import { useState, useEffect, memo } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Badge } from '@/components/ui/badge';
import { Flame, Trophy, Zap, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StreakDisplayProps {
  streak: number;
  showAnimation?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const StreakDisplay = memo(({ streak, showAnimation = true, size = 'md' }: StreakDisplayProps) => {
  const { language } = useLanguage();
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    if (showAnimation && streak > 0) {
      setAnimate(true);
      const timer = setTimeout(() => setAnimate(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [streak, showAnimation]);

  const translations: Record<string, Record<string, string>> = {
    ro: {
      day: 'zi',
      days: 'zile',
      streak: 'serie',
      keepGoing: 'Continuă așa!',
      amazing: 'Incredibil!',
      onFire: 'Ești în formă!',
    },
    en: {
      day: 'day',
      days: 'days',
      streak: 'streak',
      keepGoing: 'Keep going!',
      amazing: 'Amazing!',
      onFire: "You're on fire!",
    },
    ru: {
      day: 'день',
      days: 'дней',
      streak: 'серия',
      keepGoing: 'Продолжай!',
      amazing: 'Потрясающе!',
      onFire: 'Ты в ударе!',
    },
  };

  const t = translations[language] || translations.en;

  const getStreakMessage = () => {
    if (streak >= 30) return t.amazing;
    if (streak >= 7) return t.onFire;
    if (streak >= 3) return t.keepGoing;
    return '';
  };

  const getStreakIcon = () => {
    if (streak >= 30) return <Trophy className="h-4 w-4" />;
    if (streak >= 7) return <Star className="h-4 w-4" />;
    return <Flame className="h-4 w-4" />;
  };

  const getStreakColor = () => {
    if (streak >= 30) return 'from-amber-500 to-yellow-500';
    if (streak >= 7) return 'from-orange-500 to-red-500';
    return 'from-orange-400 to-orange-600';
  };

  const sizeClasses = {
    sm: {
      container: 'h-8 px-3 text-sm',
      icon: 'h-3 w-3',
      number: 'text-sm font-bold',
    },
    md: {
      container: 'h-10 px-4 text-base',
      icon: 'h-4 w-4',
      number: 'text-lg font-bold',
    },
    lg: {
      container: 'h-12 px-5 text-lg',
      icon: 'h-5 w-5',
      number: 'text-xl font-bold',
    },
  };

  const s = sizeClasses[size];

  if (streak === 0) {
    return (
      <Badge variant="outline" className={cn('gap-1', s.container)}>
        <Zap className={cn('text-muted-foreground', s.icon)} />
        <span className="text-muted-foreground">0 {t.days}</span>
      </Badge>
    );
  }

  return (
    <div className="relative inline-flex items-center">
      <Badge
        className={cn(
          'gap-2 border-0 bg-gradient-to-r text-white shadow-lg',
          getStreakColor(),
          s.container,
          animate && 'animate-bounce'
        )}
      >
        <span className={cn(animate && 'animate-pulse')}>
          {getStreakIcon()}
        </span>
        <span className={s.number}>{streak}</span>
        <span className="opacity-80">{streak === 1 ? t.day : t.days}</span>
      </Badge>
      {animate && streak >= 7 && (
        <>
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
          </span>
        </>
      )}
    </div>
  );
});

StreakDisplay.displayName = 'StreakDisplay';

// Compact streak for headers
export const StreakBadge = memo(({ streak }: { streak: number }) => {
  if (streak === 0) return null;

  return (
    <div className="flex items-center gap-1 text-orange-500">
      <Flame className="h-4 w-4" />
      <span className="font-bold">{streak}</span>
    </div>
  );
});

StreakBadge.displayName = 'StreakBadge';

export default StreakDisplay;
