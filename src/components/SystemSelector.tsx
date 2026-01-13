// SystemSelector Component
// Toggle between Pythagorean and Chaldean numerology systems

import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Info } from 'lucide-react';

export type NumerologySystem = 'pythagorean' | 'chaldean';

interface SystemSelectorProps {
  selectedSystem: NumerologySystem;
  onSystemChange: (system: NumerologySystem) => void;
  showDescription?: boolean;
}

export const SystemSelector = ({
  selectedSystem,
  onSystemChange,
  showDescription = false,
}: SystemSelectorProps) => {
  const { language } = useLanguage();

  const translations: Record<string, Record<string, string>> = {
    ro: {
      pythagorean: 'Pitagoreic',
      chaldean: 'Caldean',
      pythagoreanDesc: 'Sistem modern bazat pe matematica lui Pitagora. Folosește valori 1-9 pentru litere.',
      chaldeanDesc: 'Sistem antic babilonian. Folosește valori 1-8 (9 este sacru). Mai focusat pe vibrații.',
      mostPopular: 'Cel Mai Popular',
      ancient: 'Antic',
      selectSystem: 'Selectează Sistemul',
      systemInfo: 'Sistemele diferă în modul de calcul al valorilor literelor și interpretarea numerelor compuse.',
    },
    en: {
      pythagorean: 'Pythagorean',
      chaldean: 'Chaldean',
      pythagoreanDesc: 'Modern system based on Pythagorean mathematics. Uses values 1-9 for letters.',
      chaldeanDesc: 'Ancient Babylonian system. Uses values 1-8 (9 is sacred). More focused on vibrations.',
      mostPopular: 'Most Popular',
      ancient: 'Ancient',
      selectSystem: 'Select System',
      systemInfo: 'Systems differ in how letter values are calculated and how compound numbers are interpreted.',
    },
    ru: {
      pythagorean: 'Пифагорейская',
      chaldean: 'Халдейская',
      pythagoreanDesc: 'Современная система на основе математики Пифагора. Использует значения 1-9 для букв.',
      chaldeanDesc: 'Древняя вавилонская система. Использует значения 1-8 (9 священно). Больше внимания вибрациям.',
      mostPopular: 'Самая Популярная',
      ancient: 'Древняя',
      selectSystem: 'Выберите Систему',
      systemInfo: 'Системы различаются способом расчета значений букв и интерпретацией составных чисел.',
    },
  };

  const t = translations[language] || translations.en;

  if (showDescription) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold">{t.selectSystem}</h3>
          <Tooltip>
            <TooltipTrigger>
              <Info className="h-4 w-4 text-muted-foreground" />
            </TooltipTrigger>
            <TooltipContent>
              <p className="max-w-xs">{t.systemInfo}</p>
            </TooltipContent>
          </Tooltip>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {/* Pythagorean Card */}
          <Card
            className={`cursor-pointer transition-all hover:border-primary/50 ${
              selectedSystem === 'pythagorean'
                ? 'border-primary bg-primary/5 ring-2 ring-primary'
                : ''
            }`}
            onClick={() => onSystemChange('pythagorean')}
          >
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-lg">{t.pythagorean}</h4>
                <Badge variant="secondary">{t.mostPopular}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">{t.pythagoreanDesc}</p>
              <div className="mt-4 flex gap-1">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                  <div
                    key={n}
                    className="w-6 h-6 rounded bg-primary/20 flex items-center justify-center text-xs font-mono"
                  >
                    {n}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Chaldean Card */}
          <Card
            className={`cursor-pointer transition-all hover:border-primary/50 ${
              selectedSystem === 'chaldean'
                ? 'border-primary bg-primary/5 ring-2 ring-primary'
                : ''
            }`}
            onClick={() => onSystemChange('chaldean')}
          >
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-lg">{t.chaldean}</h4>
                <Badge variant="outline">{t.ancient}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">{t.chaldeanDesc}</p>
              <div className="mt-4 flex gap-1">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                  <div
                    key={n}
                    className="w-6 h-6 rounded bg-amber-500/20 flex items-center justify-center text-xs font-mono"
                  >
                    {n}
                  </div>
                ))}
                <div className="w-6 h-6 rounded bg-amber-500/10 flex items-center justify-center text-xs font-mono text-muted-foreground">
                  9*
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Compact toggle version
  return (
    <div className="flex items-center gap-2 p-1 bg-muted rounded-lg">
      <Button
        variant={selectedSystem === 'pythagorean' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onSystemChange('pythagorean')}
        className="flex-1"
      >
        {t.pythagorean}
      </Button>
      <Button
        variant={selectedSystem === 'chaldean' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onSystemChange('chaldean')}
        className="flex-1"
      >
        {t.chaldean}
      </Button>
    </div>
  );
};

export default SystemSelector;
