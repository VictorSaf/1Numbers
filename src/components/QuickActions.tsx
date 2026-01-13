// Quick Actions Component
// Provides fast access to frequently used features

import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import {
  Calculator,
  Heart,
  Calendar,
  Sparkles,
  Grid3X3,
  Gem,
  Users,
  BookOpen,
} from 'lucide-react';

interface QuickAction {
  id: string;
  icon: React.ReactNode;
  label: Record<string, string>;
  href: string;
  color: string;
  bgColor: string;
}

const quickActions: QuickAction[] = [
  {
    id: 'calculator',
    icon: <Calculator className="h-5 w-5" />,
    label: { en: 'Calculator', ro: 'Calculator', ru: 'Калькулятор' },
    href: '/',
    color: 'text-primary',
    bgColor: 'bg-primary/10 hover:bg-primary/20',
  },
  {
    id: 'compatibility',
    icon: <Heart className="h-5 w-5" />,
    label: { en: 'Compatibility', ro: 'Compatibilitate', ru: 'Совместимость' },
    href: '/compatibility',
    color: 'text-pink-500',
    bgColor: 'bg-pink-500/10 hover:bg-pink-500/20',
  },
  {
    id: 'predictions',
    icon: <Calendar className="h-5 w-5" />,
    label: { en: 'Predictions', ro: 'Predicții', ru: 'Прогнозы' },
    href: '/predictions',
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10 hover:bg-purple-500/20',
  },
  {
    id: 'loShu',
    icon: <Grid3X3 className="h-5 w-5" />,
    label: { en: 'Lo Shu', ro: 'Lo Shu', ru: 'Ло Шу' },
    href: '/tools',
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10 hover:bg-amber-500/20',
  },
  {
    id: 'remedies',
    icon: <Gem className="h-5 w-5" />,
    label: { en: 'Remedies', ro: 'Remedii', ru: 'Средства' },
    href: '/remedies',
    color: 'text-green-500',
    bgColor: 'bg-green-500/10 hover:bg-green-500/20',
  },
  {
    id: 'angel',
    icon: <Sparkles className="h-5 w-5" />,
    label: { en: 'Angel #', ro: 'Îngeri #', ru: 'Ангел #' },
    href: '/angel-numbers',
    color: 'text-sky-500',
    bgColor: 'bg-sky-500/10 hover:bg-sky-500/20',
  },
  {
    id: 'friends',
    icon: <Users className="h-5 w-5" />,
    label: { en: 'Friends', ro: 'Prieteni', ru: 'Друзья' },
    href: '/friends',
    color: 'text-indigo-500',
    bgColor: 'bg-indigo-500/10 hover:bg-indigo-500/20',
  },
  {
    id: 'guide',
    icon: <BookOpen className="h-5 w-5" />,
    label: { en: 'Guide', ro: 'Ghid', ru: 'Гид' },
    href: '/guide',
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10 hover:bg-orange-500/20',
  },
];

export const QuickActions = () => {
  const { language } = useLanguage();

  const translations: Record<string, string> = {
    en: 'Quick Actions',
    ro: 'Acțiuni Rapide',
    ru: 'Быстрые Действия',
  };

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-muted-foreground px-1">
        {translations[language] || translations.en}
      </h3>
      <div className="grid grid-cols-4 gap-3">
        {quickActions.map((action) => (
          <Link key={action.id} to={action.href}>
            <div
              className={`flex flex-col items-center justify-center p-3 rounded-xl transition-all duration-200 ${action.bgColor}`}
            >
              <div className={action.color}>{action.icon}</div>
              <span className="text-xs font-medium mt-2 text-center">
                {action.label[language] || action.label.en}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;
