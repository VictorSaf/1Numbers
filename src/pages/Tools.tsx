import { useState, useEffect } from "react";
import { ChevronRight, ChevronDown, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { ToolTiles } from "@/components/tools/ToolTiles";
import { useSearchParams } from "react-router-dom";
import { lazy, Suspense } from "react";

// Absorbed from /angel-numbers, which was its own destination with a header
// link and nothing else to it. Lazy, because it carries its own directory of
// number meanings and most visitors here want the calendar.
const AngelNumbers = lazy(() => import("@/components/tools/AngelNumbers"));
import { Badge } from "@/components/ui/badge";
import { PageLayout } from "@/components/layout/PageLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { useLanguage } from "@/contexts/LanguageContext";
import { useProfile } from "@/hooks/use-profile";
import { compareNameChange, analyzeBusinessName } from "@/lib/nameAnalysis";
import { generateYearForecast, type YearForecast } from "@/lib/yearForecast";
import { format } from "date-fns";
import { parseCalendarDate } from "@/lib/calendarDate";
import { NumerologyCalendar } from "@/components/NumerologyCalendar";
import { LoShuGrid } from "@/components/LoShuGrid";
import { KeepNameButton } from "@/components/people/KeepNameButton";

const Tools = () => {
  const { language } = useLanguage();
  const { profileData, hasProfile } = useProfile();
  // The tab is in the query string: /unelte?s=angel is where the 301 from
  // /angel-numbers lands, and a link to one tool has to stay a link to that tool.
  const [params, setParams] = useSearchParams();
  // Fără `s`, pagina e LANSATORUL: șase uși, nu un document deschis la primul
  // capitol. `/unelte?s=angel` -- unde aterizează 301-ul de la /angel-numbers --
  // rămâne un link către unealta aceea.
  const requestedTab = params.get("s");
  const setActiveTab = (next: string | null) =>
    setParams(next ? { s: next } : {}, { replace: true });
  
  // Name Change State
  const [originalName, setOriginalName] = useState("");
  const [newName, setNewName] = useState("");
  const [nameComparison, setNameComparison] = useState<ReturnType<typeof compareNameChange> | null>(null);
  
  // Business Name State
  const [businessName, setBusinessName] = useState("");
  const [businessAnalysis, setBusinessAnalysis] = useState<ReturnType<typeof analyzeBusinessName> | null>(null);
  
  // Year Forecast State
  const [forecastBirthDate, setForecastBirthDate] = useState("");
  const [forecastYear, setForecastYear] = useState(new Date().getFullYear());
  const [yearForecast, setYearForecast] = useState<YearForecast | null>(null);
  const [expandedMonth, setExpandedMonth] = useState<number | null>(null);
  
  // Calendar State
  const [calendarBirthDate, setCalendarBirthDate] = useState("");
  const [calendarName, setCalendarName] = useState("");
  const [showCalendar, setShowCalendar] = useState(false);

  // Lo Shu Grid State
  const [loShuBirthDate, setLoShuBirthDate] = useState("");
  const [showLoShuGrid, setShowLoShuGrid] = useState(false);

  // Auto-populate profile data
  useEffect(() => {
    if (hasProfile && profileData) {
      const formattedDate = format(profileData.birthDate, 'yyyy-MM-dd');
      if (!calendarBirthDate) {
        setCalendarBirthDate(formattedDate);
        setCalendarName(profileData.fullName);
      }
      if (!forecastBirthDate) {
        setForecastBirthDate(formattedDate);
      }
      if (!loShuBirthDate) {
        setLoShuBirthDate(formattedDate);
      }
    }
  }, [hasProfile, profileData, calendarBirthDate, forecastBirthDate, loShuBirthDate]);

  const t = {
    ro: {
      title: "Instrumente Numerologice",
      subtitle: "Analize avansate pentru decizii importante",
      back: "Înapoi",
      allTools: "Toate uneltele",
      n_calendar: "Fiecare zi a lunii, cu cifra ei.",
      n_loshu: "Ce ai din belșug și ce lipsește, în pătratul chinezesc.",
      n_angel: "Ce înseamnă cifrele care ți se tot arată.",
      n_nameChange: "Ce se schimbă dacă îți schimbi numele.",
      n_business: "Cifra unui nume de firmă, înainte s-o înregistrezi.",
      n_forecast: "Anul care vine, lună cu lună.",
      nameChange: "Schimbare Nume",
      businessName: "Nume Afacere",
      yearForecast: "Previziune An",
      angelNumbers: "Numere Înger",
      calendar: "Calendar",
      showCalendar: "Afișează Calendarul",
      calendarSubtitle: "Introdu datele pentru a vedea calendarul tău personalizat",
      loShuGrid: "Grila Lo Shu",
      loShuSubtitle: "Analiza numerologiei chinezești bazată pe data nașterii",
      showLoShuGrid: "Arată Grila Lo Shu",
      fullName: "Numele complet",
      analyze: "Analizează",
      calculate: "Calculează",
      original: "Nume original",
      newNameLabel: "Nume nou",
      businessNameLabel: "Numele afacerii",
      birthDate: "Data nașterii",
      year: "Anul",
      impact: "Impact",
      positive: "Pozitiv",
      negative: "Negativ",
      neutral: "Neutru",
      mixed: "Mixt",
      before: "Înainte",
      after: "După",
      destiny: "Destin",
      soulUrge: "Suflet",
      personality: "Personalitate",
      vibrationalEnergy: "Energie Vibrațională",
      suitableFor: "Potrivit pentru",
      challenges: "Provocări",
      recommendations: "Recomandări",
      strong: "Puternică",
      moderate: "Moderată",
      weak: "Slabă",
      overallTheme: "Tema anului",
      keyMonths: "Luni cheie",
      monthlyForecast: "Previziuni lunare",
      energy: "Energie",
      focus: "Focus",
      opportunities: "Oportunități",
      advice: "Sfat",
    },
    en: {
      title: "Numerology Tools",
      subtitle: "Advanced analysis for important decisions",
      back: "Back",
      allTools: "All tools",
      n_calendar: "Every day of the month, with its own number.",
      n_loshu: "What you have in abundance and what is missing, in the Chinese square.",
      n_angel: "What the digits that keep showing up mean.",
      n_nameChange: "What changes if you change your name.",
      n_business: "A company name's number, before you register it.",
      n_forecast: "The year ahead, month by month.",
      nameChange: "Name Change",
      businessName: "Business Name",
      yearForecast: "Year Forecast",
      angelNumbers: "Angel Numbers",
      calendar: "Calendar",
      showCalendar: "Show Calendar",
      calendarSubtitle: "Enter your details to see your personalized calendar",
      loShuGrid: "Lo Shu Grid",
      loShuSubtitle: "Chinese numerology analysis based on birth date",
      showLoShuGrid: "Show Lo Shu Grid",
      fullName: "Full name",
      analyze: "Analyze",
      calculate: "Calculate",
      original: "Original name",
      newNameLabel: "New name",
      businessNameLabel: "Business name",
      birthDate: "Birth date",
      year: "Year",
      impact: "Impact",
      positive: "Positive",
      negative: "Negative",
      neutral: "Neutral",
      mixed: "Mixed",
      before: "Before",
      after: "After",
      destiny: "Destiny",
      soulUrge: "Soul",
      personality: "Personality",
      vibrationalEnergy: "Vibrational Energy",
      suitableFor: "Suitable for",
      challenges: "Challenges",
      recommendations: "Recommendations",
      strong: "Strong",
      moderate: "Moderate",
      weak: "Weak",
      overallTheme: "Year theme",
      keyMonths: "Key months",
      monthlyForecast: "Monthly forecast",
      energy: "Energy",
      focus: "Focus",
      opportunities: "Opportunities",
      advice: "Advice",
    },
    ru: {
      title: "Нумерологические инструменты",
      subtitle: "Расширенный анализ для важных решений",
      back: "Назад",
      allTools: "Все инструменты",
      n_calendar: "Каждый день месяца — со своим числом.",
      n_loshu: "Чего в избытке и чего не хватает — в китайском квадрате.",
      n_angel: "Что значат цифры, которые всё время попадаются.",
      n_nameChange: "Что изменится, если сменить имя.",
      n_business: "Число названия компании — до регистрации.",
      n_forecast: "Год впереди, месяц за месяцем.",
      nameChange: "Смена имени",
      businessName: "Название бизнеса",
      yearForecast: "Прогноз на год",
      angelNumbers: "Ангельские числа",
      calendar: "Календарь",
      showCalendar: "Показать Календарь",
      calendarSubtitle: "Введите данные, чтобы увидеть ваш персонализированный календарь",
      loShuGrid: "Сетка Ло Шу",
      loShuSubtitle: "Анализ китайской нумерологии на основе даты рождения",
      showLoShuGrid: "Показать Сетку Ло Шу",
      fullName: "Полное имя",
      analyze: "Анализировать",
      calculate: "Рассчитать",
      original: "Оригинальное имя",
      newNameLabel: "Новое имя",
      businessNameLabel: "Название бизнеса",
      birthDate: "Дата рождения",
      year: "Год",
      impact: "Влияние",
      positive: "Положительное",
      negative: "Отрицательное",
      neutral: "Нейтральное",
      mixed: "Смешанное",
      before: "До",
      after: "После",
      destiny: "Судьба",
      soulUrge: "Душа",
      personality: "Личность",
      vibrationalEnergy: "Вибрационная энергия",
      suitableFor: "Подходит для",
      challenges: "Вызовы",
      recommendations: "Рекомендации",
      strong: "Сильная",
      moderate: "Умеренная",
      weak: "Слабая",
      overallTheme: "Тема года",
      keyMonths: "Ключевые месяцы",
      monthlyForecast: "Месячный прогноз",
      energy: "Энергия",
      focus: "Фокус",
      opportunities: "Возможности",
      advice: "Совет",
    }
  }[language];

  const TOOLS = [
    { value: "calendar", label: t.calendar, note: t.n_calendar },
    { value: "loshu", label: t.loShuGrid, note: t.n_loshu },
    { value: "angel", label: t.angelNumbers, note: t.n_angel },
    { value: "name-change", label: t.nameChange, note: t.n_nameChange },
    { value: "business", label: t.businessName, note: t.n_business },
    { value: "forecast", label: t.yearForecast, note: t.n_forecast },
  ];
  // A bookmark to a tool that is gone (?s=optimizer, ?s=matrix) gets the
  // launcher, not a tab with nothing in it.
  const activeTab = TOOLS.some((tool) => tool.value === requestedTab) ? requestedTab : null;


  const handleNameCompare = () => {
    if (originalName && newName) {
      setNameComparison(compareNameChange(originalName, newName));
    }
  };

  const handleBusinessAnalyze = () => {
    if (businessName) {
      setBusinessAnalysis(analyzeBusinessName(businessName, language));
    }
  };

  const handleYearForecast = () => {
    const birthDate = parseCalendarDate(forecastBirthDate);
    if (birthDate) {
      setYearForecast(generateYearForecast(birthDate, forecastYear, language));
    }
  };

  // `<input type="date">` gives YYYY-MM-DD; `new Date()` would read it as UTC
  // midnight, the day before anywhere west of Greenwich.
  const calendarDate = parseCalendarDate(calendarBirthDate);
  const loShuDate = parseCalendarDate(loShuBirthDate);

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'positive': return 'text-ok';
      case 'negative': return 'text-crit';
      case 'mixed': return 'text-warn';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <PageLayout>
      <PageHeader
        title={t.title}
        subtitle={t.subtitle}
        badge={{
          icon: <Wrench className="h-4 w-4" />,
          label: t.title
        }}
      />

      <main className="relative z-10 px-4 pb-16">
        <div className="max-w-5xl mx-auto pt-4">
          {!activeTab ? (
            <ToolTiles tools={TOOLS} onOpen={setActiveTab} />
          ) : (
          <Tabs value={activeTab} className="w-full">
            {/* Întoarcerea la hol. Banda de file spunea „ești aici, printre
                altele"; o unealtă e o destinație, deci ce trebuie e drumul
                înapoi, nu celelalte cinci deschise permanent lângă ea. */}
            <button
              type="button"
              onClick={() => setActiveTab(null)}
              className="num mb-8 flex min-h-11 items-center gap-2.5 text-[0.68rem] uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:text-gilt"
            >
              <span aria-hidden="true">←</span>
              {t.allTools}
            </button>

            <TabsContent value="angel">
              <Suspense fallback={<div className="h-64 animate-pulse rounded-lg border border-line bg-sunken" />}>
                <AngelNumbers />
              </Suspense>
            </TabsContent>

            {/* Numerology Calendar */}
            <TabsContent value="calendar">
              <Card className="border-t-0">
                <CardHeader>
                  <CardTitle className="font-heading text-foreground">{t.calendar}</CardTitle>
                  <CardDescription>{t.calendarSubtitle}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>{t.birthDate}</Label>
                      <Input 
                        type="date" 
                        value={calendarBirthDate} 
                        onChange={(e) => setCalendarBirthDate(e.target.value)} 
                        className="input-mystic" 
                      />
                    </div>
                    <div>
                      <Label>{t.fullName}</Label>
                      <Input 
                        value={calendarName} 
                        onChange={(e) => setCalendarName(e.target.value)} 
                        placeholder="Ion Popescu"
                        className="input-mystic" 
                      />
                    </div>
                  </div>
                  <Button 
                    onClick={() => setShowCalendar(true)} 
                    className="w-full sm:w-auto"
                    disabled={!calendarBirthDate || !calendarName}
                  >
                    {t.showCalendar}
                  </Button>
                  
                  {showCalendar && calendarDate && calendarName && (
                    <div className="mt-6 animate-fade-in">
                      <NumerologyCalendar 
                        birthDate={calendarDate} 
                        fullName={calendarName} 
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Lo Shu Grid */}
            <TabsContent value="loshu">
              <Card className="border-t-0">
                <CardHeader>
                  <CardTitle className="font-heading text-foreground">{t.loShuGrid}</CardTitle>
                  <CardDescription>{t.loShuSubtitle}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>{t.birthDate}</Label>
                    <Input
                      type="date"
                      value={loShuBirthDate}
                      onChange={(e) => setLoShuBirthDate(e.target.value)}
                      className="input-mystic"
                    />
                  </div>
                  <Button
                    onClick={() => setShowLoShuGrid(true)}
                    className="w-full sm:w-auto"
                    disabled={!loShuBirthDate}
                  >
                    {t.showLoShuGrid}
                  </Button>

                  {showLoShuGrid && loShuDate && (
                    <div className="mt-6 animate-fade-in">
                      <LoShuGrid birthDate={loShuDate} />
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Name Change Analyzer */}
            <TabsContent value="name-change">
              <Card className="border-t-0">
                <CardHeader>
                  <CardTitle className="font-heading text-foreground">{t.nameChange}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>{t.original}</Label>
                      <Input value={originalName} onChange={(e) => setOriginalName(e.target.value)} className="input-mystic" />
                    </div>
                    <div>
                      <Label>{t.newNameLabel}</Label>
                      <Input value={newName} onChange={(e) => setNewName(e.target.value)} className="input-mystic" />
                    </div>
                  </div>
                  <Button onClick={handleNameCompare} className="w-full sm:w-auto">{t.analyze}</Button>
                  
                  {nameComparison && (
                    <div className="mt-6 space-y-4 animate-fade-in">
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">{t.impact}:</span>
                        <Badge className={getImpactColor(nameComparison.overallImpact)}>
                          {t[nameComparison.overallImpact as keyof typeof t]}
                        </Badge>
                      </div>
                      <p className="text-sm text-foreground/80">{nameComparison.summary[language]}</p>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <Card className="bg-card/50">
                          <CardHeader className="py-3"><CardTitle className="text-sm">{t.before}</CardTitle></CardHeader>
                          <CardContent className="space-y-2 text-sm">
                            <div>{t.destiny}: <span className="text-primary font-bold">{nameComparison.before.destinyNumber}</span></div>
                            <div>{t.soulUrge}: <span className="text-primary font-bold">{nameComparison.before.soulUrgeNumber}</span></div>
                            <div>{t.personality}: <span className="text-primary font-bold">{nameComparison.before.personalityNumber}</span></div>
                          </CardContent>
                        </Card>
                        <Card className="bg-card/50">
                          <CardHeader className="py-3"><CardTitle className="text-sm">{t.after}</CardTitle></CardHeader>
                          <CardContent className="space-y-2 text-sm">
                            <div>{t.destiny}: <span className="text-primary font-bold">{nameComparison.after.destinyNumber}</span> {nameComparison.changes.destiny.changed && <Badge variant="outline" className="ml-1 text-xs">!</Badge>}</div>
                            <div>{t.soulUrge}: <span className="text-primary font-bold">{nameComparison.after.soulUrgeNumber}</span> {nameComparison.changes.soulUrge.changed && <Badge variant="outline" className="ml-1 text-xs">!</Badge>}</div>
                            <div>{t.personality}: <span className="text-primary font-bold">{nameComparison.after.personalityNumber}</span> {nameComparison.changes.personality.changed && <Badge variant="outline" className="ml-1 text-xs">!</Badge>}</div>
                          </CardContent>
                        </Card>
                      </div>

                      <div className="flex justify-end pt-2">
                        <KeepNameButton name={newName} defaultCategory="eu" />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Business Name Analyzer */}
            <TabsContent value="business">
              <Card className="border-t-0">
                <CardHeader>
                  <CardTitle className="font-heading text-foreground">{t.businessName}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>{t.businessNameLabel}</Label>
                    <Input value={businessName} onChange={(e) => setBusinessName(e.target.value)} className="input-mystic" />
                  </div>
                  <Button onClick={handleBusinessAnalyze} className="w-full sm:w-auto">{t.analyze}</Button>
                  
                  {businessAnalysis && (
                    <div className="mt-6 space-y-4 animate-fade-in">
                      <div className="flex items-center gap-4">
                        <div className="number-display">{businessAnalysis.destinyNumber}</div>
                        <div>
                          <div className="text-lg font-heading text-foreground">{businessAnalysis.name}</div>
                          <Badge className={businessAnalysis.vibrationalEnergy === 'strong' ? 'text-ok' : businessAnalysis.vibrationalEnergy === 'moderate' ? 'text-warn' : 'text-crit'}>
                            {t.vibrationalEnergy}: {t[businessAnalysis.vibrationalEnergy]}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card className="bg-card/50">
                          <CardHeader className="py-3"><CardTitle className="text-sm text-ok">{t.suitableFor}</CardTitle></CardHeader>
                          <CardContent><ul className="text-sm space-y-1">{businessAnalysis.suitableFor.map((s, i) => <li key={i}>• {s}</li>)}</ul></CardContent>
                        </Card>
                        <Card className="bg-card/50">
                          <CardHeader className="py-3"><CardTitle className="text-sm text-warn">{t.challenges}</CardTitle></CardHeader>
                          <CardContent><ul className="text-sm space-y-1">{businessAnalysis.challenges.map((c, i) => <li key={i}>• {c}</li>)}</ul></CardContent>
                        </Card>
                        <Card className="bg-card/50">
                          <CardHeader className="py-3"><CardTitle className="text-sm text-foreground">{t.recommendations}</CardTitle></CardHeader>
                          <CardContent><ul className="text-sm space-y-1">{businessAnalysis.recommendations.map((r, i) => <li key={i}>• {r}</li>)}</ul></CardContent>
                        </Card>
                      </div>

                      <div className="flex justify-end pt-2">
                        <KeepNameButton name={businessName} defaultCategory="afacere" />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Year Forecast */}
            <TabsContent value="forecast">
              <Card className="border-t-0">
                <CardHeader>
                  <CardTitle className="font-heading text-foreground">{t.yearForecast}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>{t.birthDate}</Label>
                      <Input type="date" value={forecastBirthDate} onChange={(e) => setForecastBirthDate(e.target.value)} className="input-mystic" />
                    </div>
                    <div>
                      <Label>{t.year}</Label>
                      <Input type="number" value={forecastYear} onChange={(e) => setForecastYear(parseInt(e.target.value))} className="input-mystic" />
                    </div>
                  </div>
                  <Button onClick={handleYearForecast} className="w-full sm:w-auto">{t.calculate}</Button>
                  
                  {yearForecast && (
                    <div className="mt-6 space-y-4 animate-fade-in">
                      <div className="flex items-center gap-4">
                        <div className="number-display-large">{yearForecast.personalYearNumber}</div>
                        <div>
                          <div className="text-lg num text-foreground">{yearForecast.year}</div>
                          <p className="text-sm text-muted-foreground">{t.overallTheme}</p>
                        </div>
                      </div>
                      <p className="text-foreground/80">{yearForecast.overallTheme}</p>
                      
                      {yearForecast.keyMonths.length > 0 && (
                        <div className="flex gap-2 flex-wrap">
                          <span className="text-sm text-muted-foreground">{t.keyMonths}:</span>
                          {yearForecast.keyMonths.map(m => (
                            <Badge key={m} className="bg-sunken text-primary">{yearForecast.monthlyForecasts[m-1].monthName}</Badge>
                          ))}
                        </div>
                      )}
                      
                      <div className="space-y-2">
                        <h4 className="font-heading text-foreground">{t.monthlyForecast}</h4>
                        {yearForecast.monthlyForecasts.map((month) => (
                          <Card key={month.month} className="bg-card/30 cursor-pointer" onClick={() => setExpandedMonth(expandedMonth === month.month ? null : month.month)}>
                            <CardHeader className="py-3 flex flex-row items-center justify-between">
                              <div className="flex items-center gap-3">
                                <Badge variant="outline" className="text-primary">{month.personalMonthNumber}</Badge>
                                <span className="font-medium">{month.monthName}</span>
                                <span className="text-sm text-muted-foreground">- {month.energy}</span>
                              </div>
                              {expandedMonth === month.month ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                            </CardHeader>
                            {expandedMonth === month.month && (
                              <CardContent className="pt-0 space-y-2 text-sm animate-fade-in">
                                <div><span className="text-primary">{t.focus}:</span> {month.focus.join(', ')}</div>
                                <div><span className="text-ok">{t.opportunities}:</span> {month.opportunities.join(', ')}</div>
                                <div><span className="text-warn">{t.challenges}:</span> {month.challenges.join(', ')}</div>
                                <div><span className="text-muted-foreground">{t.advice}:</span> {month.advice}</div>
                              </CardContent>
                            )}
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
          )}
        </div>
      </main>
    </PageLayout>
  );
};

export default Tools;
