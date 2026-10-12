import { Calendar, TrendingUp, Target } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { WeeklyPrediction, MonthlyPrediction, calculateMonthlyFocus, getMonthlyRecommendations } from '@/lib/predictions';
import { format } from 'date-fns';
import { ro, enUS, ru } from 'date-fns/locale';

const locales = { ro, en: enUS, ru };

interface WeeklyMonthlyPredictionCardProps {
  type: 'weekly' | 'monthly';
  weeklyData?: WeeklyPrediction;
  monthlyData?: MonthlyPrediction;
  birthDate: Date;
  month?: number;
  year?: number;
}

export const WeeklyMonthlyPredictionCard = ({
  type,
  weeklyData,
  monthlyData,
  birthDate,
  month,
  year
}: WeeklyMonthlyPredictionCardProps) => {
  const { language } = useLanguage();
  const locale = locales[language];

  const labels = {
    ro: {
      weekly: "Săptămâna, zi cu zi",
      monthly: "Luna",
      theme: "Temă",
      inMonth: (n: number) => `În luna ta personală ${n}`,
      personalDay: "Ziua personală",
      focus: "Pe ce să pui accent",
      recommendations: "Ce poți face"
    },
    en: {
      weekly: "The week, day by day",
      monthly: "The month",
      theme: "Theme",
      inMonth: (n: number) => `Inside your personal month ${n}`,
      personalDay: "Personal day",
      focus: "Where to put your attention",
      recommendations: "What you can do"
    },
    ru: {
      weekly: "Неделя по дням",
      monthly: "Месяц",
      theme: "Тема",
      inMonth: (n: number) => `Внутри вашего личного месяца ${n}`,
      personalDay: "Личный день",
      focus: "На что обратить внимание",
      recommendations: "Что можно сделать"
    }
  }[language];

  // Săptămâna nu are o cifră a ei: e șapte zile, fiecare cu cifra ei, în
  // luna personală în care începe. Cardul afișa o „temă a săptămânii" scoasă
  // din media celor șapte -- o cifră care nu există în niciun calcul.
  if (type === 'weekly' && weeklyData) {
    return (
      <Card className="card-mystic">
        <CardHeader>
          <CardTitle className="font-heading text-xl flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {labels.weekly}
          </CardTitle>
          <p className="num text-[0.68rem] uppercase tracking-[0.14em] text-muted-foreground">
            {format(weeklyData.weekStart, 'd MMM', { locale })} – {format(weeklyData.weekEnd, 'd MMM yyyy', { locale })}
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-heading text-sm text-muted-foreground mb-1">
              {labels.inMonth(weeklyData.personalMonth)}
            </h3>
            <p className="font-heading text-foreground">{weeklyData.monthTheme}</p>
          </div>

          <ol className="divide-y divide-line border-t border-line">
            {weeklyData.days.map((day) => (
              <li
                key={day.date.toISOString()}
                className="grid grid-cols-[6.5rem_2rem_1fr] items-baseline gap-3 py-2"
              >
                <span className="num text-[0.68rem] uppercase tracking-[0.14em] text-muted-foreground">
                  {format(day.date, 'EEE d MMM', { locale })}
                </span>
                <span
                  className="num text-lg text-primary"
                  aria-label={`${labels.personalDay} ${day.personalDay}`}
                >
                  {day.personalDay}
                </span>
                <span className="text-sm text-foreground/90">{day.line}</span>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>
    );
  }

  if (type === 'monthly' && monthlyData && month && year) {
    const focusAreas = calculateMonthlyFocus(birthDate, month, year, language);
    const recommendations = getMonthlyRecommendations(birthDate, month, year, language);

    return (
      <Card className="card-mystic">
        <CardHeader>
          <CardTitle className="font-heading text-xl flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {labels.monthly}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-heading text-sm text-foreground mb-2">{labels.theme}</h3>
            <p className="text-foreground font-medium">{monthlyData.theme}</p>
          </div>

          {focusAreas.length > 0 && (
            <div>
              <h3 className="font-heading text-sm text-foreground mb-2 flex items-center gap-2">
                <Target className="h-4 w-4" />
                {labels.focus}
              </h3>
              <div className="flex flex-wrap gap-2">
                {focusAreas.map((area, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {area}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {recommendations.length > 0 && (
            <div>
              <h3 className="font-heading text-sm text-foreground mb-2 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                {labels.recommendations}
              </h3>
              <ul className="space-y-2">
                {recommendations.slice(0, 5).map((rec, index) => (
                  <li key={index} className="text-sm text-foreground/90 flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return null;
};
