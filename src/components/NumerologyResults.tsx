import { useMemo, lazy, Suspense, useEffect } from "react";
import { ArrowLeft, Star, BarChart3, Target, Mountain, AlertTriangle, Sparkles, CalendarCheck, Type } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NumberCard } from "./NumberCard";
import { PinnacleCard } from "./PinnacleCard";
import { KarmicDebtCard } from "./KarmicDebtCard";
import { PersonalCycleCard } from "./PersonalCycleCard";
import { LuckyDatesCard } from "./LuckyDatesCard";
import { NameAnalysisCard } from "./NameAnalysisCard";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";
import {
  calculateLifePathNumber,
  calculateDestinyNumber,
  calculateSoulUrgeNumber,
  calculatePersonalityNumber,
  calculatePersonalYearNumber,
} from "@/lib/numerology";
import { calculatePinnacles, calculateChallenges } from "@/lib/pinnacles";
import { calculateKarmicDebts, calculateKarmicLessons, KARMIC_LESSON_MEANINGS } from "@/lib/karmic";
import { generateShareableLink } from "@/lib/sharing";
import { ExportMenu } from "./ExportMenu";
import { ShareButtons } from "./ShareButtons";
import { track } from '@/lib/analytics';
import { ResultSection } from "@/components/ResultSection";
import { useAuth } from "@/contexts/AuthContext";

// Lazy load heavy chart components (Recharts)
const NumerologyRadarChart = lazy(() => import("./charts/NumerologyRadarChart").then(m => ({ default: m.NumerologyRadarChart })));
const NumberDistributionChart = lazy(() => import("./charts/NumberDistributionChart").then(m => ({ default: m.NumberDistributionChart })));

// Chart loading skeleton
const ChartSkeleton = () => (
  <div className="h-64 flex items-center justify-center">
    <div className="animate-pulse flex flex-col items-center gap-2">
      <div className="w-32 h-32 rounded-full bg-primary/10 border border-primary/20" />
      <div className="h-3 w-24 bg-primary/10 rounded" />
    </div>
  </div>
);

interface NumerologyResultsProps {
  fullName: string;
  birthDate: Date;
  onReset: () => void;
}

export const NumerologyResults = ({ fullName, birthDate, onReset }: NumerologyResultsProps) => {
  const { isAuthenticated } = useAuth();
  useEffect(() => { track('result_viewed'); }, []);
  const { t, language } = useLanguage();
  
  const results = useMemo(() => ({
    lifePath: calculateLifePathNumber(birthDate),
    destiny: calculateDestinyNumber(fullName),
    soulUrge: calculateSoulUrgeNumber(fullName),
    personality: calculatePersonalityNumber(fullName),
    personalYear: calculatePersonalYearNumber(birthDate),
  }), [fullName, birthDate]);

  const pinnacles = useMemo(() => calculatePinnacles(birthDate), [birthDate]);
  const challenges = useMemo(() => calculateChallenges(birthDate), [birthDate]);
  const karmicDebts = useMemo(() => calculateKarmicDebts(birthDate, fullName), [birthDate, fullName]);
  const karmicLessons = useMemo(() => calculateKarmicLessons(fullName), [fullName]);

  const currentYear = new Date().getFullYear();
  const currentAge = currentYear - birthDate.getFullYear();

  const sectionLabels = {
    pinnacles: { ro: "Pinnacle-uri și Provocări", en: "Pinnacles & Challenges", ru: "Пиннакли и Вызовы" },
    karmic: { ro: "Datorii Karmice", en: "Karmic Debts", ru: "Кармические Долги" },
    lessons: { ro: "Lecții Karmice", en: "Karmic Lessons", ru: "Кармические Уроки" },
    noDebts: { ro: "Nu ai datorii karmice detectate.", en: "No karmic debts detected.", ru: "Кармических долгов не обнаружено." },
    noLessons: { ro: "Toate numerele sunt prezente în nume.", en: "All numbers are present in your name.", ru: "Все числа присутствуют в имени." },
    luckyDates: { ro: "Date Favorabile", en: "Lucky Dates", ru: "Благоприятные Даты" },
    nameAnalysis: { ro: "Analiza Numelui", en: "Name Analysis", ru: "Анализ Имени" }
  };

  // Shown in place of a locked section so the visitor knows what is behind it.
  const teasers = {
    pinnacles: { ro: "Cele patru etape majore ale vieții tale și provocările fiecăreia.", en: "The four major stages of your life and the challenge of each.", ru: "Четыре главных этапа вашей жизни и вызов каждого." },
    karmic: { ro: "Datoriile 13, 14, 16 și 19 și ce înseamnă pentru tine.", en: "Debts 13, 14, 16 and 19 and what they mean for you.", ru: "Долги 13, 14, 16 и 19 и что они значат для вас." },
    lessons: { ro: "Numerele lipsă din numele tău și lecțiile pe care le indică.", en: "The numbers missing from your name and the lessons they point to.", ru: "Числа, отсутствующие в имени, и уроки, на которые они указывают." },
    luckyDates: { ro: "Zilele favorabile pentru decizii importante.", en: "The days that favour important decisions.", ru: "Дни, благоприятные для важных решений." },
    nameAnalysis: { ro: "Distribuția literelor, vocalelor și consoanelor din numele tău.", en: "The distribution of letters, vowels and consonants in your name.", ru: "Распределение букв, гласных и согласных в вашем имени." }
  };

  // Generate share data
  const shareUrl = generateShareableLink({
    fullName,
    birthDate: birthDate.toISOString()
  });
  
  const shareData = {
    title: `${fullName} - Numerology Report`,
    text: `Check out my numerology report! Life Path: ${results.lifePath}, Destiny: ${results.destiny}`,
    url: shareUrl
  };
  
  const reportData = {
    fullName,
    birthDate,
    language
  };

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4 opacity-0 animate-fade-in">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
          <Star className="h-4 w-4 text-primary" />
          <span className="text-sm font-raleway text-primary">{t.profileTitle}</span>
        </div>
        <h2 className="font-cinzel text-2xl md:text-3xl text-foreground">{fullName}</h2>
        <p className="text-muted-foreground">{t.profileSubtitle}</p>
        
        {/* Export and Share Buttons */}
        <div className="flex items-center justify-center gap-3 pt-4">
          <ExportMenu reportData={reportData} />
          <ShareButtons shareData={shareData} />
        </div>
      </div>

      {/* Core Numbers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <NumberCard title={t.lifePathTitle} number={results.lifePath} description={t.lifePathDesc} delay={100} isMain />
        <NumberCard title={t.destinyTitle} number={results.destiny} description={t.destinyDesc} delay={200} />
        <NumberCard title={t.soulUrgeTitle} number={results.soulUrge} description={t.soulUrgeDesc} delay={300} />
        <NumberCard title={t.personalityTitle} number={results.personality} description={t.personalityDesc} delay={400} />
        <NumberCard title={`${t.personalYearTitle} ${currentYear}`} number={results.personalYear} description={t.personalYearDesc} delay={500} />
      </div>

      {/* Personal Cycles */}
      <PersonalCycleCard birthDate={birthDate} delay={550} />

      {/* Pinnacles & Challenges */}
      <ResultSection
        className="opacity-0 animate-fade-in ds-delay-600"
        title={sectionLabels.pinnacles[language]}
        icon={<Mountain className="h-5 w-5 text-primary" />}
        locked={!isAuthenticated}
        teaser={teasers.pinnacles[language]}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {pinnacles.map((pinnacle, i) => (
            <PinnacleCard
              key={i}
              pinnacle={pinnacle}
              challenge={challenges[i]}
              isCurrentPeriod={currentAge >= pinnacle.startAge && currentAge <= pinnacle.endAge}
              delay={650 + i * 50}
            />
          ))}
        </div>
      </ResultSection>

      {/* Karmic Debts */}
      <ResultSection
        className="opacity-0 animate-fade-in ds-delay-900"
        title={sectionLabels.karmic[language]}
        icon={<AlertTriangle className="h-5 w-5 text-amber-500" />}
        locked={!isAuthenticated}
        teaser={teasers.karmic[language]}
      >
        {karmicDebts.length > 0 ? (
          <div className="space-y-4">
            {karmicDebts.map((debt, i) => (
              <KarmicDebtCard key={i} debt={debt} delay={900 + i * 50} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground p-4 rounded-xl bg-green-500/10 border border-green-500/20">
            ✓ {sectionLabels.noDebts[language]}
          </p>
        )}
      </ResultSection>

      {/* Karmic Lessons */}
      {karmicLessons.length > 0 && (
        <ResultSection
          className="opacity-0 animate-fade-in ds-delay-1000"
          title={sectionLabels.lessons[language]}
          icon={<Sparkles className="h-5 w-5 text-primary" />}
          locked={!isAuthenticated}
          teaser={teasers.lessons[language]}
        >
          <div className="flex flex-wrap gap-2">
            {karmicLessons.map((num) => (
              <div key={num} className="px-3 py-2 rounded-lg bg-muted/50 border border-border/50">
                <span className="font-cinzel text-primary mr-2">{num}</span>
                <span className="text-xs text-muted-foreground">{KARMIC_LESSON_MEANINGS[num]?.title[language]}</span>
              </div>
            ))}
          </div>
        </ResultSection>
      )}

      {/* Lucky Dates */}
      <ResultSection
        title={sectionLabels.luckyDates[language]}
        icon={<CalendarCheck className="h-5 w-5 text-primary" />}
        locked={!isAuthenticated}
        teaser={teasers.luckyDates[language]}
      >
        <LuckyDatesCard birthDate={birthDate} fullName={fullName} delay={1000} />
      </ResultSection>

      {/* Name Analysis */}
      <ResultSection
        className="opacity-0 animate-fade-in ds-delay-1100"
        title={sectionLabels.nameAnalysis[language]}
        icon={<Type className="h-5 w-5 text-primary" />}
        locked={!isAuthenticated}
        teaser={teasers.nameAnalysis[language]}
      >
        <NameAnalysisCard fullName={fullName} />
      </ResultSection>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 opacity-0 animate-fade-in ds-delay-1100">
        <div className="p-6 rounded-2xl bg-card/50 border border-border/50 backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-4">
            <Target className="h-5 w-5 text-primary" />
            <h3 className="font-cinzel text-lg text-foreground">
              {language === 'ro' ? 'Profilul Numerologic' : language === 'ru' ? 'Нумерологический Профиль' : 'Numerology Profile'}
            </h3>
          </div>
          <Suspense fallback={<ChartSkeleton />}>
            <NumerologyRadarChart lifePath={results.lifePath} destiny={results.destiny} soulUrge={results.soulUrge} personality={results.personality} personalYear={results.personalYear} />
          </Suspense>
        </div>
        <div className="p-6 rounded-2xl bg-card/50 border border-border/50 backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="h-5 w-5 text-primary" />
            <h3 className="font-cinzel text-lg text-foreground">
              {language === 'ro' ? 'Distribuția Numerelor' : language === 'ru' ? 'Распределение Чисел' : 'Number Distribution'}
            </h3>
          </div>
          <Suspense fallback={<ChartSkeleton />}>
            <NumberDistributionChart name={fullName} />
          </Suspense>
        </div>
      </div>

      <div className="flex justify-center pt-4 opacity-0 animate-fade-in ds-delay-1200">
        <Button onClick={onReset} variant="outline" className="border-primary/30 text-primary hover:bg-primary/10">
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t.calculateAgain}
        </Button>
      </div>
    </div>
  );
};
