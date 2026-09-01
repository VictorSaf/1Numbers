import { useState, useEffect, useMemo } from 'react';
import { Sun, Moon, Calendar, TrendingUp, Sparkles } from 'lucide-react';
import { format } from 'date-fns';
import { ro, enUS, ru } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageLayout } from '@/components/layout/PageLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { useLanguage } from '@/contexts/LanguageContext';
import { Today } from '@/components/Today';
import { useProfile } from '@/hooks/use-profile';
import { 
  getDailyPrediction, 
  getMonthlyPrediction, 
  getUniversalDayEnergy,
  calculateWeeklyTheme,
  calculateAnnualTheme,
  calculateAnnualOpportunities,
  calculateAnnualChallenges
} from '@/lib/predictions';
import { DailyPredictionCard } from '@/components/DailyPredictionCard';
import { WeeklyMonthlyPredictionCard } from '@/components/WeeklyMonthlyPredictionCard';
import { BirthDateSelect } from "@/components/BirthDateSelect";
import { DayNavigator } from '@/components/predictions/DayNavigator';
import { useSelectedDay } from '@/hooks/use-selected-day';
import { getDayContent } from '@/lib/dayContent';

const locales = { ro, en: enUS, ru };

// The daily data carries energies as English keys ("change", "harmony"); the
// label beside them was translated but the value was not, producing "Energie:
// Change" in the Romanian UI.
const ENERGY_LABELS: Record<string, Record<string, string>> = {
  leadership:    { ro: 'Leadership',   en: 'Leadership',   ru: 'Лидерство' },
  cooperation:   { ro: 'Cooperare',    en: 'Cooperation',  ru: 'Сотрудничество' },
  creativity:    { ro: 'Creativitate', en: 'Creativity',   ru: 'Творчество' },
  stability:     { ro: 'Stabilitate',  en: 'Stability',    ru: 'Стабильность' },
  change:        { ro: 'Schimbare',    en: 'Change',       ru: 'Перемены' },
  harmony:       { ro: 'Armonie',      en: 'Harmony',      ru: 'Гармония' },
  introspection: { ro: 'Introspecție', en: 'Introspection',ru: 'Интроспекция' },
  abundance:     { ro: 'Abundență',    en: 'Abundance',    ru: 'Изобилие' },
  completion:    { ro: 'Împlinire',    en: 'Completion',   ru: 'Завершение' },
};

const Predictions = () => {
  const { language, t } = useLanguage();
  const { profileData, hasProfile, loading: profileLoading } = useProfile();
  const [birthDate, setBirthDate] = useState<Date>();
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  // Load profile data on mount
  useEffect(() => {
    if (hasProfile && profileData && !birthDate) {
      setBirthDate(profileData.birthDate);
    }
  }, [hasProfile, profileData, birthDate]);

  const dateLocale = locales[language];
  // `today` rămâne ancora: orizontul se măsoară din el, iar cardul de zi
  // universală de mai sus e despre ziua reală. Ce s-a schimbat e că ziua
  // *citită* nu mai e obligată să fie aceeași -- se alege, și alegerea stă în
  // adresă. Memoizat pentru că e dependență în `useSelectedDay`; fără asta,
  // fiecare render ar produce altă ancoră.
  const today = useMemo(() => new Date(), []);
  const { selectedDay, selectDay } = useSelectedDay(today);

  const labels = {
    ro: {
      title: 'Previziuni Numerologice',
      subtitle: 'Descoperă energia zilei și a lunii tale personale',
      label: 'Previziuni',
      enterBirthDate: 'Introdu data nașterii pentru previziuni personalizate',
      selectBirthDate: 'Selectează data nașterii',
      daily: 'Ziua',
      monthly: 'Luna Curentă',
      universalDay: 'Ziua Universală',
      personalDay: 'Ziua Ta Personală',
      personalMonth: 'Luna Ta Personală',
      energy: 'Energie',
      focus: 'Focus',
      advice: 'Sfat',
      luckyHours: 'Ore Norocoase',
      challenges: 'Provocări',
      opportunities: 'Oportunități',
      theme: 'Temă',
      overview: 'Prezentare',
      career: 'Carieră',
      relationships: 'Relații',
      health: 'Sănătate',
      finances: 'Finanțe',
      spirituality: 'Spiritualitate',
      keyDays: 'Zile Cheie',
      backToCalculator: 'Înapoi la Calculator',
    },
    en: {
      title: 'Numerology Predictions',
      subtitle: 'Discover your personal day and month energy',
      label: 'Predictions',
      enterBirthDate: 'Enter your birth date for personalized predictions',
      selectBirthDate: 'Select birth date',
      daily: 'The day',
      monthly: 'This Month',
      universalDay: 'Universal Day',
      personalDay: 'Your Personal Day',
      personalMonth: 'Your Personal Month',
      energy: 'Energy',
      focus: 'Focus',
      advice: 'Advice',
      luckyHours: 'Lucky Hours',
      challenges: 'Challenges',
      opportunities: 'Opportunities',
      theme: 'Theme',
      overview: 'Overview',
      career: 'Career',
      relationships: 'Relationships',
      health: 'Health',
      finances: 'Finances',
      spirituality: 'Spirituality',
      keyDays: 'Key Days',
      backToCalculator: 'Back to Calculator',
    },
    ru: {
      title: 'Нумерологические Прогнозы',
      subtitle: 'Откройте энергию вашего личного дня и месяца',
      label: 'Прогнозы',
      enterBirthDate: 'Введите дату рождения для персонализированных прогнозов',
      selectBirthDate: 'Выберите дату рождения',
      daily: 'День',
      monthly: 'Этот месяц',
      universalDay: 'Универсальный День',
      personalDay: 'Ваш Личный День',
      personalMonth: 'Ваш Личный Месяц',
      energy: 'Энергия',
      focus: 'Фокус',
      advice: 'Совет',
      luckyHours: 'Удачные Часы',
      challenges: 'Вызовы',
      opportunities: 'Возможности',
      theme: 'Тема',
      overview: 'Обзор',
      career: 'Карьера',
      relationships: 'Отношения',
      health: 'Здоровье',
      finances: 'Финансы',
      spirituality: 'Духовность',
      keyDays: 'Ключевые Дни',
      backToCalculator: 'Назад к Калькулятору',
    }
  };

  const l = labels[language];
  const universalEnergy = getUniversalDayEnergy(today);
  const dailyPrediction = birthDate ? getDailyPrediction(birthDate, selectedDay) : null;
  const dayContent = birthDate ? getDayContent(birthDate, selectedDay, language) : null;
  const monthlyPrediction = birthDate ? getMonthlyPrediction(birthDate, selectedMonth, selectedYear) : null;
  
  // Calculate weekly prediction (start of current week - Monday)
  const getWeekStart = (date: Date): Date => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    return new Date(d.setDate(diff));
  };
  const weekStart = getWeekStart(today);
  const weeklyPrediction = birthDate ? calculateWeeklyTheme(birthDate, weekStart) : null;
  
  // Calculate annual predictions
  const annualTheme = birthDate ? calculateAnnualTheme(birthDate, selectedYear) : null;
  const annualOpportunities = birthDate ? calculateAnnualOpportunities(birthDate, selectedYear) : null;
  const annualChallenges = birthDate ? calculateAnnualChallenges(birthDate, selectedYear) : null;

  // Ziua ta, citită prin harta ta. Pagina asta calcula ziua personală corect
  // și apoi o descria singură: ziua 5 spunea același lucru unui Drum 6 și unui
  // Drum 1. Aia e o efemeridă -- adevărată despre toată lumea, deci despre
  // nimeni. Antetul dispare când ea e pe ecran, din același motiv ca la hartă:
  // un titlu deasupra unei descoperiri o transformă în raport.
  const mine = hasProfile && profileData ? profileData : null;

  return (
    <PageLayout>
      {!mine && (
        <PageHeader
          title={l.title}
          subtitle={l.subtitle}
          badge={{
            icon: <TrendingUp className="h-4 w-4 text-primary" />,
            label: l.label
          }}
        />
      )}

      {/* Main Content */}
      <main className="relative z-10 px-4 pb-16">
        {mine && (
          <div className="pt-2">
            <Today fullName={mine.fullName} birthDate={mine.birthDate} />
          </div>
        )}

        <div className="max-w-4xl mx-auto space-y-8 pt-4">
          
          {/* Universal Day Energy */}
          <div className="card-mystic rounded-xl p-6 text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Sun className="h-6 w-6 text-primary" />
              <h2 className="font-heading text-xl text-foreground">{l.universalDay}</h2>
            </div>
            <div className="number-display mx-auto mb-4">
              {universalEnergy.number}
            </div>
            <p className="text-muted-foreground capitalize">{l.energy}: {ENERGY_LABELS[universalEnergy.energy]?.[language] ?? universalEnergy.energy}</p>
            <p className="text-xs text-muted-foreground mt-2">
              {format(today, 'EEEE, d MMMM yyyy', { locale: dateLocale })}
            </p>
          </div>

          {/* Birth Date Selector */}
          {!birthDate && (
            <div className="card-mystic rounded-xl p-8 text-center">
              <Sparkles className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="font-heading text-xl text-foreground mb-2">{l.enterBirthDate}</h3>
              <BirthDateSelect value={birthDate} onChange={setBirthDate} />
            </div>
          )}

          {/* Personal Predictions */}
          {birthDate && (
            <Tabs defaultValue="daily" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6 bg-card/50">
                <TabsTrigger value="daily" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <Sun className="h-4 w-4 mr-2" />
                  {l.daily}
                </TabsTrigger>
                <TabsTrigger value="monthly" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <Moon className="h-4 w-4 mr-2" />
                  {l.monthly}
                </TabsTrigger>
              </TabsList>

              {/* Daily Tab */}
              <TabsContent value="daily" className="space-y-6">
                {dailyPrediction && birthDate && (
                  <>
                    <DayNavigator date={selectedDay} today={today} onChange={selectDay} />

                    {dayContent && (
                      <div className="card-mystic grid grid-cols-3 gap-3 rounded-xl p-4 text-center">
                        <div>
                          <p className="font-raleway text-xs text-muted-foreground">{t.today.personalDay}</p>
                          <p className="num text-2xl text-primary">{dayContent.personalDay}</p>
                        </div>
                        <div>
                          <p className="font-raleway text-xs text-muted-foreground">{t.today.personalMonth}</p>
                          <p className="num text-2xl text-foreground">{dayContent.personalMonth}</p>
                        </div>
                        <div>
                          <p className="font-raleway text-xs text-muted-foreground">{t.today.universalDay}</p>
                          <p className="num text-2xl text-foreground">{dayContent.universalDay}</p>
                        </div>
                        <div className="col-span-3 border-t border-border/40 pt-3 text-left">
                          <p className="font-heading text-sm text-primary">{dayContent.keywords}</p>
                          <p className="mt-1 text-sm text-foreground/90">{dayContent.meaning}</p>
                          <p className="mt-3 font-raleway text-xs text-muted-foreground">{t.today.advice}</p>
                          <p className="text-sm text-foreground/90">{dayContent.advice}</p>
                        </div>
                      </div>
                    )}

                    <DailyPredictionCard
                      prediction={dailyPrediction}
                      birthDate={birthDate}
                      date={selectedDay}
                    />
                    <div className="card-mystic rounded-xl p-6 space-y-6">
                      <div className="text-center">
                        <h3 className="font-heading text-lg text-muted-foreground">{l.personalDay}</h3>
                        <div className="number-display-large mx-auto my-4 animate-float">
                          {dailyPrediction.number}
                        </div>
                        <p className="text-primary font-heading text-xl capitalize">{dailyPrediction.energy}</p>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="p-4 rounded-lg bg-card/50 border border-border/30">
                          <h4 className="font-heading text-sm text-primary mb-2">{l.focus}</h4>
                          <p className="text-foreground/90 capitalize">{dailyPrediction.focus}</p>
                        </div>
                        <div className="p-4 rounded-lg bg-card/50 border border-border/30">
                          <h4 className="font-heading text-sm text-primary mb-2">{l.luckyHours}</h4>
                          <p className="text-foreground/90">{dailyPrediction.luckyHours.join(', ')}</p>
                        </div>
                      </div>

                      <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                        <h4 className="font-heading text-sm text-primary mb-2">{l.advice}</h4>
                        <p className="text-foreground/90">{dailyPrediction.advice}</p>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="p-4 rounded-lg bg-card/50 border border-border/30">
                          <h4 className="font-heading text-sm text-destructive/80 mb-2">{l.challenges}</h4>
                          <p className="text-foreground/80 text-sm">{dailyPrediction.challenges}</p>
                        </div>
                        <div className="p-4 rounded-lg bg-card/50 border border-border/30">
                          <h4 className="font-heading text-sm text-ok mb-2">{l.opportunities}</h4>
                          <p className="text-foreground/80 text-sm">{dailyPrediction.opportunities}</p>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </TabsContent>

              {/* Monthly Tab */}
              <TabsContent value="monthly" className="space-y-6">
                {monthlyPrediction && birthDate && (
                  <>
                    <WeeklyMonthlyPredictionCard
                      type="monthly"
                      monthlyData={monthlyPrediction}
                      birthDate={birthDate}
                      month={selectedMonth}
                      year={selectedYear}
                    />
                    {weeklyPrediction && (
                      <WeeklyMonthlyPredictionCard
                        type="weekly"
                        weeklyData={weeklyPrediction}
                        birthDate={birthDate}
                      />
                    )}
                    {annualTheme && (
                      <div className="card-mystic rounded-xl p-6 space-y-4">
                        <h3 className="font-heading text-xl text-gradient-gold">{l.personalMonth} - {selectedYear}</h3>
                        <div>
                          <h4 className="font-heading text-sm text-primary mb-2">{annualTheme.theme}</h4>
                          <p className="text-foreground/90">{annualTheme.description}</p>
                        </div>
                        {annualOpportunities && annualOpportunities.length > 0 && (
                          <div>
                            <h4 className="font-heading text-sm text-primary mb-2">Oportunități</h4>
                            <ul className="space-y-1">
                              {annualOpportunities.slice(0, 5).map((opp, index) => (
                                <li key={index} className="text-sm text-foreground/90 flex items-start gap-2">
                                  <span className="text-primary mt-1">•</span>
                                  <span>{opp}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {annualChallenges && annualChallenges.length > 0 && (
                          <div>
                            <h4 className="font-heading text-sm text-destructive/80 mb-2">Provocări</h4>
                            <ul className="space-y-1">
                              {annualChallenges.slice(0, 5).map((challenge, index) => (
                                <li key={index} className="text-sm text-foreground/80 flex items-start gap-2">
                                  <span className="text-destructive/80 mt-1">•</span>
                                  <span>{challenge}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                    <div className="card-mystic rounded-xl p-6 space-y-6">
                    <div className="text-center">
                      <h3 className="font-heading text-lg text-muted-foreground">{l.personalMonth}</h3>
                      <div className="number-display-large mx-auto my-4 animate-float">
                        {monthlyPrediction.number}
                      </div>
                      <p className="text-primary font-heading text-xl">{monthlyPrediction.theme}</p>
                    </div>

                    <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                      <h4 className="font-heading text-sm text-primary mb-2">{l.overview}</h4>
                      <p className="text-foreground/90">{monthlyPrediction.overview}</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="p-4 rounded-lg bg-card/50 border border-border/30">
                        <h4 className="font-heading text-sm text-primary mb-2">{l.career}</h4>
                        <p className="text-foreground/80 text-sm">{monthlyPrediction.career}</p>
                      </div>
                      <div className="p-4 rounded-lg bg-card/50 border border-border/30">
                        <h4 className="font-heading text-sm text-primary mb-2">{l.relationships}</h4>
                        <p className="text-foreground/80 text-sm">{monthlyPrediction.relationships}</p>
                      </div>
                      <div className="p-4 rounded-lg bg-card/50 border border-border/30">
                        <h4 className="font-heading text-sm text-primary mb-2">{l.health}</h4>
                        <p className="text-foreground/80 text-sm">{monthlyPrediction.health}</p>
                      </div>
                      <div className="p-4 rounded-lg bg-card/50 border border-border/30">
                        <h4 className="font-heading text-sm text-primary mb-2">{l.finances}</h4>
                        <p className="text-foreground/80 text-sm">{monthlyPrediction.finances}</p>
                      </div>
                    </div>

                    <div className="p-4 rounded-lg bg-card/50 border border-border/30">
                      <h4 className="font-heading text-sm text-primary mb-2">{l.spirituality}</h4>
                      <p className="text-foreground/80 text-sm">{monthlyPrediction.spirituality}</p>
                    </div>

                    <div className="p-4 rounded-lg bg-card/50 border border-border/30">
                      <h4 className="font-heading text-sm text-primary mb-2">{l.keyDays}</h4>
                      <div className="flex flex-wrap gap-2">
                        {monthlyPrediction.keyDays.map(day => (
                          <span key={day} className="px-3 py-1 rounded-full bg-primary/20 text-primary text-sm num">
                            {day}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  </>
                )}
              </TabsContent>
            </Tabs>
          )}

          {/* Change birth date button */}
          {birthDate && (
            <div className="text-center">
              <Button
                variant="outline"
                onClick={() => setBirthDate(undefined)}
                className="border-primary/30 text-primary hover:bg-primary/10"
              >
                <Calendar className="mr-2 h-4 w-4" />
                {l.selectBirthDate}
              </Button>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-6 border-t border-border mt-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-sm text-foreground/70 font-raleway">{t.footer}</p>
        </div>
      </footer>
    </PageLayout>
  );
};

export default Predictions;
