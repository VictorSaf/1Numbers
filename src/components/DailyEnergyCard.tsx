// Daily Energy Card Component
// Shows personalized daily numerology insights prominently

import { useMemo, memo } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sun, Moon, Star, Sparkles, ArrowRight, Palette, Gem } from 'lucide-react';
import { calculatePersonalDayNumber, calculateUniversalDay } from '@/lib/personalCycles';
import { getRemedyForNumber } from '@/lib/remedies';
import { Link } from 'react-router-dom';

interface DailyEnergyCardProps {
  birthDate: Date;
  userName?: string;
}

export const DailyEnergyCard = memo(({ birthDate, userName }: DailyEnergyCardProps) => {
  const { language } = useLanguage();
  const today = new Date();

  const dailyData = useMemo(() => {
    const personalDay = calculatePersonalDayNumber(birthDate, today);
    const universalDay = calculateUniversalDay(today);
    const remedy = getRemedyForNumber(personalDay, language);

    return {
      personalDay,
      universalDay,
      remedy,
    };
  }, [birthDate, language]);

  const translations: Record<string, Record<string, string>> = {
    ro: {
      greeting: 'Bună dimineața',
      greetingAfternoon: 'Bună ziua',
      greetingEvening: 'Bună seara',
      todayEnergy: 'Energia Ta de Azi',
      personalDay: 'Zi Personală',
      universalDay: 'Zi Universală',
      luckyColor: 'Culoare Norocoasă',
      luckyStone: 'Piatră Norocoasă',
      viewMore: 'Vezi Predicția Completă',
      tip: 'Sfatul Zilei',
    },
    en: {
      greeting: 'Good morning',
      greetingAfternoon: 'Good afternoon',
      greetingEvening: 'Good evening',
      todayEnergy: "Your Energy Today",
      personalDay: 'Personal Day',
      universalDay: 'Universal Day',
      luckyColor: 'Lucky Color',
      luckyStone: 'Lucky Stone',
      viewMore: 'View Full Prediction',
      tip: 'Daily Tip',
    },
    ru: {
      greeting: 'Доброе утро',
      greetingAfternoon: 'Добрый день',
      greetingEvening: 'Добрый вечер',
      todayEnergy: 'Ваша Энергия Сегодня',
      personalDay: 'Личный День',
      universalDay: 'Универсальный День',
      luckyColor: 'Счастливый Цвет',
      luckyStone: 'Счастливый Камень',
      viewMore: 'Полный Прогноз',
      tip: 'Совет Дня',
    },
  };

  const t = translations[language] || translations.en;

  // Get greeting based on time
  const getGreeting = () => {
    const hour = today.getHours();
    if (hour < 12) return t.greeting;
    if (hour < 18) return t.greetingAfternoon;
    return t.greetingEvening;
  };

  // Day number meanings
  const dayMeanings: Record<number, Record<string, { theme: string; tip: string }>> = {
    1: {
      en: { theme: 'New Beginnings', tip: 'Take initiative today. Start something new.' },
      ro: { theme: 'Începuturi Noi', tip: 'Ia inițiativa azi. Începe ceva nou.' },
      ru: { theme: 'Новые Начала', tip: 'Проявите инициативу сегодня. Начните что-то новое.' },
    },
    2: {
      en: { theme: 'Cooperation', tip: 'Focus on partnerships and diplomacy.' },
      ro: { theme: 'Cooperare', tip: 'Concentrează-te pe parteneriate și diplomație.' },
      ru: { theme: 'Сотрудничество', tip: 'Сосредоточьтесь на партнёрстве и дипломатии.' },
    },
    3: {
      en: { theme: 'Creativity', tip: 'Express yourself creatively. Communicate openly.' },
      ro: { theme: 'Creativitate', tip: 'Exprimă-te creativ. Comunică deschis.' },
      ru: { theme: 'Креативность', tip: 'Выражайте себя творчески. Общайтесь открыто.' },
    },
    4: {
      en: { theme: 'Foundation', tip: 'Focus on practical matters and organization.' },
      ro: { theme: 'Fundament', tip: 'Concentrează-te pe aspecte practice și organizare.' },
      ru: { theme: 'Фундамент', tip: 'Сосредоточьтесь на практических вопросах и организации.' },
    },
    5: {
      en: { theme: 'Change', tip: 'Embrace change and seek new experiences.' },
      ro: { theme: 'Schimbare', tip: 'Îmbrățișează schimbarea și caută experiențe noi.' },
      ru: { theme: 'Перемены', tip: 'Примите перемены и ищите новый опыт.' },
    },
    6: {
      en: { theme: 'Harmony', tip: 'Focus on family, home, and responsibilities.' },
      ro: { theme: 'Armonie', tip: 'Concentrează-te pe familie, casă și responsabilități.' },
      ru: { theme: 'Гармония', tip: 'Сосредоточьтесь на семье, доме и обязанностях.' },
    },
    7: {
      en: { theme: 'Reflection', tip: 'Take time for introspection and spiritual growth.' },
      ro: { theme: 'Reflecție', tip: 'Ia-ți timp pentru introspecție și creștere spirituală.' },
      ru: { theme: 'Размышление', tip: 'Найдите время для самоанализа и духовного роста.' },
    },
    8: {
      en: { theme: 'Achievement', tip: 'Focus on business and material success.' },
      ro: { theme: 'Realizare', tip: 'Concentrează-te pe afaceri și succes material.' },
      ru: { theme: 'Достижение', tip: 'Сосредоточьтесь на бизнесе и материальном успехе.' },
    },
    9: {
      en: { theme: 'Completion', tip: 'Tie up loose ends. Help others selflessly.' },
      ro: { theme: 'Finalizare', tip: 'Încheie treburile neterminate. Ajută-i pe alții dezinteresat.' },
      ru: { theme: 'Завершение', tip: 'Завершите незаконченные дела. Помогайте другим бескорыстно.' },
    },
  };

  const meaning = dayMeanings[dailyData.personalDay]?.[language] || dayMeanings[dailyData.personalDay]?.en;

  return (
    <Card className="overflow-hidden border-0 bg-gradient-to-br from-primary/10 via-purple-500/10 to-amber-500/10">
      <CardContent className="p-0">
        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-primary to-purple-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm">{getGreeting()}{userName ? `, ${userName.split(' ')[0]}` : ''}</p>
              <h2 className="text-2xl font-bold mt-1">{t.todayEnergy}</h2>
            </div>
            <div className="text-right">
              <p className="text-white/60 text-xs">
                {today.toLocaleDateString(language === 'ro' ? 'ro-RO' : language === 'ru' ? 'ru-RU' : 'en-US', {
                  weekday: 'long',
                  month: 'short',
                  day: 'numeric',
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="p-6 space-y-6">
          {/* Numbers row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 rounded-xl bg-background/80 backdrop-blur border">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center mx-auto mb-2 shadow-lg">
                <span className="text-2xl font-bold text-white">{dailyData.personalDay}</span>
              </div>
              <p className="text-sm font-medium">{t.personalDay}</p>
              {meaning && (
                <Badge variant="secondary" className="mt-2 text-xs">
                  {meaning.theme}
                </Badge>
              )}
            </div>
            <div className="text-center p-4 rounded-xl bg-background/80 backdrop-blur border">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center mx-auto mb-2 shadow-lg">
                <span className="text-2xl font-bold text-white">{dailyData.universalDay}</span>
              </div>
              <p className="text-sm font-medium">{t.universalDay}</p>
              <Badge variant="outline" className="mt-2 text-xs">
                <Sun className="h-3 w-3 mr-1" />
                Global
              </Badge>
            </div>
          </div>

          {/* Lucky items */}
          {dailyData.remedy && (
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-background/60 border">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: dailyData.remedy.colors.hex }}
                >
                  <Palette className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{t.luckyColor}</p>
                  <p className="font-medium text-sm">{dailyData.remedy.colors.primary}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-background/60 border">
                <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                  <Gem className="h-5 w-5 text-purple-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{t.luckyStone}</p>
                  <p className="font-medium text-sm">{dailyData.remedy.gemstones.primary}</p>
                </div>
              </div>
            </div>
          )}

          {/* Daily tip */}
          {meaning && (
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <div className="flex items-start gap-3">
                <Sparkles className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-amber-600 mb-1">{t.tip}</p>
                  <p className="text-sm">{meaning.tip}</p>
                </div>
              </div>
            </div>
          )}

          {/* Action button */}
          <Link to="/predictions">
            <Button variant="outline" className="w-full gap-2">
              {t.viewMore}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
});

DailyEnergyCard.displayName = 'DailyEnergyCard';

export default DailyEnergyCard;
