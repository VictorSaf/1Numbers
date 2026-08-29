// Bento Dashboard Component
// Main dashboard layout with all numerology insights

import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { BentoGrid } from './BentoGrid';
import { BentoCard } from './BentoCard';
import { NumberSpotlight } from './NumberSpotlight';
import { InsightCard } from './InsightCard';
import { MiniLoShuGrid } from './MiniLoShuGrid';
import { MiniCalendar } from './MiniCalendar';
import { CycleProgress } from './CycleProgress';
import { DashboardSkeleton } from './DashboardSkeleton';
import { QuickActions } from '@/components/QuickActions';
import { StreakDisplay } from '@/components/StreakDisplay';
import {
  calculateLifePathNumber,
  calculateDestinyNumber,
  calculateSoulUrgeNumber,
  calculatePersonalityNumber,
  calculatePersonalYearNumber,
} from '@/lib/numerology';
import { calculatePersonalDayNumber, calculatePersonalMonthNumber } from '@/lib/personalCycles';
import { getRemedyForNumber } from '@/lib/remedies';
import {
  Sun,
  Sparkles,
  Grid3X3,
  Calendar,
  TrendingUp,
  Flame,
  Heart,
  Star,
  Compass,
  Moon,
} from 'lucide-react';

interface BentoDashboardProps {
  fullName: string;
  birthDate: Date;
  userName?: string;
  streak?: number;
}

// Day meanings for insights
// Localized: this is the dashboard every signed-in user lands on, and these
// strings were English only, showing through in the Romanian and Russian UI.
type DayMeaning = { theme: string; message: string; detail: string };
const dayMeanings: Record<number, Record<string, DayMeaning>> = {
  1: {
    en: { theme: "New Beginnings", message: "Today favors bold action and fresh starts", detail: "Your energy supports leadership and initiative. Take charge of situations and trust your instincts." },
    ro: { theme: "Începuturi Noi", message: "Ziua favorizează acțiunea curajoasă și începuturile", detail: "Energia ta susține inițiativa și conducerea. Preia controlul situațiilor și ai încredere în instinct." },
    ru: { theme: "Новые начинания", message: "День благоприятен для смелых действий и новых стартов", detail: "Ваша энергия поддерживает лидерство и инициативу. Берите ситуацию в свои руки." },
  },
  2: {
    en: { theme: "Cooperation", message: "Partnership and patience serve you well", detail: "Work with others rather than alone. Diplomacy opens doors that force cannot." },
    ro: { theme: "Cooperare", message: "Parteneriatul și răbdarea îți sunt de folos", detail: "Lucrează cu ceilalți, nu singur. Diplomația deschide uși pe care forța nu le poate deschide." },
    ru: { theme: "Сотрудничество", message: "Партнёрство и терпение сегодня на вашей стороне", detail: "Работайте с другими, а не в одиночку. Дипломатия открывает двери, недоступные силе." },
  },
  3: {
    en: { theme: "Creative Expression", message: "Your creativity and communication shine", detail: "Express yourself through art, writing, or conversation. Social interactions bring joy." },
    ro: { theme: "Expresie Creativă", message: "Creativitatea și comunicarea ta strălucesc", detail: "Exprimă-te prin artă, scris sau conversație. Interacțiunile sociale îți aduc bucurie." },
    ru: { theme: "Творческое выражение", message: "Ваше творчество и общение сегодня ярки", detail: "Выражайте себя через искусство, письмо или беседу. Общение принесёт радость." },
  },
  4: {
    en: { theme: "Foundation Building", message: "Focus on practical matters today", detail: "Organize, plan, and build solid foundations. Hard work pays off on this day." },
    ro: { theme: "Construirea Fundației", message: "Concentrează-te azi pe lucrurile practice", detail: "Organizează, planifică și construiește temelii solide. Munca susținută dă roade azi." },
    ru: { theme: "Построение основы", message: "Сосредоточьтесь сегодня на практических делах", detail: "Организуйте, планируйте и стройте прочный фундамент. Усердный труд окупается." },
  },
  5: {
    en: { theme: "Change & Freedom", message: "Embrace adventure and flexibility", detail: "Unexpected opportunities may arise. Stay adaptable and open to new experiences." },
    ro: { theme: "Schimbare și Libertate", message: "Îmbrățișează aventura și flexibilitatea", detail: "Pot apărea oportunități neașteptate. Rămâi adaptabil și deschis la experiențe noi." },
    ru: { theme: "Перемены и свобода", message: "Примите приключения и гибкость", detail: "Могут появиться неожиданные возможности. Будьте гибкими и открытыми новому." },
  },
  6: {
    en: { theme: "Harmony & Service", message: "Family and responsibilities take center stage", detail: "Nurture loved ones and create beauty in your environment. Balance giving with receiving." },
    ro: { theme: "Armonie și Grijă", message: "Familia și responsabilitățile trec pe primul plan", detail: "Ai grijă de cei dragi și creează frumusețe în jurul tău. Echilibrează datul cu primitul." },
    ru: { theme: "Гармония и забота", message: "Семья и обязанности выходят на первый план", detail: "Заботьтесь о близких и создавайте красоту вокруг. Уравновешивайте отдачу и получение." },
  },
  7: {
    en: { theme: "Inner Wisdom", message: "Seek solitude for reflection", detail: "Study, meditate, or simply rest. Answers come from within rather than from others." },
    ro: { theme: "Înțelepciune Interioară", message: "Caută singurătatea pentru reflecție", detail: "Studiază, meditează sau odihnește-te. Răspunsurile vin dinăuntru, nu de la ceilalți." },
    ru: { theme: "Внутренняя мудрость", message: "Ищите уединение для размышлений", detail: "Учитесь, медитируйте или отдыхайте. Ответы приходят изнутри, а не от других." },
  },
  8: {
    en: { theme: "Power & Abundance", message: "Focus on goals, money, and achievement", detail: "A strong day for business decisions and negotiations. Claim what you have earned." },
    ro: { theme: "Putere și Abundență", message: "Concentrează-te pe obiective, bani și realizări", detail: "Zi puternică pentru decizii de afaceri și negocieri. Revendică ce ai câștigat." },
    ru: { theme: "Сила и изобилие", message: "Сосредоточьтесь на целях, деньгах и достижениях", detail: "Хороший день для деловых решений и переговоров. Требуйте заслуженное." },
  },
  9: {
    en: { theme: "Completion", message: "Let go of what no longer serves you", detail: "Finish what is unfinished and release the rest. Compassion and generosity are rewarded." },
    ro: { theme: "Împlinire", message: "Lasă în urmă ce nu-ți mai folosește", detail: "Termină ce ai lăsat neterminat și eliberează restul. Compasiunea și generozitatea sunt răsplătite." },
    ru: { theme: "Завершение", message: "Отпустите то, что больше не служит вам", detail: "Завершите незаконченное и отпустите остальное. Сострадание и щедрость вознаграждаются." },
  },
};

export const BentoDashboard = ({
  fullName,
  birthDate,
  userName,
  streak = 0,
}: BentoDashboardProps) => {
  const { language, t } = useLanguage();
  const today = new Date();

  // Calculate all numbers
  const numbers = useMemo(() => ({
    lifePath: calculateLifePathNumber(birthDate),
    destiny: calculateDestinyNumber(fullName),
    soulUrge: calculateSoulUrgeNumber(fullName),
    personality: calculatePersonalityNumber(fullName),
    personalYear: calculatePersonalYearNumber(birthDate),
    personalMonth: calculatePersonalMonthNumber(birthDate, today.getFullYear(), today.getMonth() + 1),
    personalDay: calculatePersonalDayNumber(birthDate, today),
  }), [fullName, birthDate]);

  // Get today's insight
  const todayInsight = useMemo(() => {
    const entry = dayMeanings[numbers.personalDay] ?? dayMeanings[1];
    return entry[language] ?? entry.en;
  }, [numbers.personalDay]);

  // Get remedy for personal day
  const remedy = useMemo(() => {
    return getRemedyForNumber(numbers.personalDay, language);
  }, [numbers.personalDay, language]);

  // Translations
  const translations = useMemo(() => ({
    ro: {
      greeting: getGreeting('ro'),
      yourEnergy: 'Energia Ta',
      lifePath: 'Drum de Viață',
      destiny: 'Destin',
      soulUrge: 'Dorință Suflet',
      personality: 'Personalitate',
      personalYear: 'An Personal',
      personalMonth: 'Lună',
      personalDay: 'Zi',
      loShu: 'Grila Lo Shu',
      calendar: 'Calendar Lunar',
      streak: 'Serie',
      days: 'zile',
      quickActions: 'Acțiuni Rapide',
      todayInsight: 'Insight-ul Zilei',
      luckyColor: 'Culoare',
      luckyStone: 'Piatră',
    },
    en: {
      greeting: getGreeting('en'),
      yourEnergy: 'Your Energy',
      lifePath: 'Life Path',
      destiny: 'Destiny',
      soulUrge: 'Soul Urge',
      personality: 'Personality',
      personalYear: 'Personal Year',
      personalMonth: 'Month',
      personalDay: 'Day',
      loShu: 'Lo Shu Grid',
      calendar: 'Monthly Calendar',
      streak: 'Streak',
      days: 'days',
      quickActions: 'Quick Actions',
      todayInsight: "Today's Insight",
      luckyColor: 'Color',
      luckyStone: 'Stone',
    },
    ru: {
      greeting: getGreeting('ru'),
      yourEnergy: 'Ваша Энергия',
      lifePath: 'Путь Жизни',
      destiny: 'Судьба',
      soulUrge: 'Желание Души',
      personality: 'Личность',
      personalYear: 'Личный Год',
      personalMonth: 'Месяц',
      personalDay: 'День',
      loShu: 'Сетка Ло Шу',
      calendar: 'Месячный Календарь',
      streak: 'Серия',
      days: 'дней',
      quickActions: 'Быстрые Действия',
      todayInsight: 'Инсайт Дня',
      luckyColor: 'Цвет',
      luckyStone: 'Камень',
    },
  }), []);

  const text = translations[language as keyof typeof translations] || translations.en;

  function getGreeting(lang: string) {
    const hour = today.getHours();
    const greetings = {
      ro: hour < 12 ? 'Bună dimineața' : hour < 18 ? 'Bună ziua' : 'Bună seara',
      en: hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening',
      ru: hour < 12 ? 'Доброе утро' : hour < 18 ? 'Добрый день' : 'Добрый вечер',
    };
    return greetings[lang as keyof typeof greetings] || greetings.en;
  }

  const isMasterNumber = (num: number) => [11, 22, 33].includes(num);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-6">
      {/* Greeting */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-cinzel font-bold text-foreground">
          {text.greeting}
          {userName && <span className="text-primary">, {userName.split(' ')[0]}</span>}
        </h1>
        <p className="text-muted-foreground mt-1">
          {today.toLocaleDateString(language === 'ro' ? 'ro-RO' : language === 'ru' ? 'ru-RU' : 'en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </p>
      </div>

      {/* Bento Grid */}
      <BentoGrid columns={4} gap="md">
        {/* Daily Energy - Large Card */}
        <BentoCard
          title={text.yourEnergy}
          icon={Sun}
          iconColor="text-chart-3"
          colSpan={2}
          rowSpan={2}
          variant="highlight"
          animationDelay={0}
        >
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between mb-4">
              <CycleProgress
                currentValue={numbers.personalDay}
                label={text.personalDay}
                sublabel={todayInsight.theme}
                size="md"
              />
              <div className="flex flex-col items-end gap-2">
                <div className="flex items-center gap-3">
                  <div className="text-center">
                    <span className="text-2xl font-cinzel font-bold text-primary">
                      {numbers.personalMonth}
                    </span>
                    <p className="text-xs text-muted-foreground">{text.personalMonth}</p>
                  </div>
                  <div className="text-center">
                    <span className="text-2xl font-cinzel font-bold text-primary">
                      {numbers.personalYear}
                    </span>
                    <p className="text-xs text-muted-foreground">{text.personalYear}</p>
                  </div>
                </div>
              </div>
            </div>

            <InsightCard
              theme={todayInsight.theme}
              message={todayInsight.message}
              detail={todayInsight.detail}
              variant="default"
            />

            {remedy && (
              <div className="flex gap-4 mt-4 pt-4 border-t border-border/50">
                <div className="flex items-center gap-2">
                  <div
                    className="w-6 h-6 rounded-full"
                    style={{ backgroundColor: remedy.colors.hex }}
                  />
                  <div>
                    <p className="text-xs text-muted-foreground">{text.luckyColor}</p>
                    <p className="text-sm font-medium">{remedy.colors.primary}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">{text.luckyStone}</p>
                    <p className="text-sm font-medium">{remedy.gemstones.primary}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </BentoCard>

        {/* Life Path Number */}
        <BentoCard
          title={text.lifePath}
          icon={Compass}
          colSpan={1}
          animationDelay={100}
          interactive
        >
          <NumberSpotlight
            value={numbers.lifePath}
            label={text.lifePath}
            isMaster={isMasterNumber(numbers.lifePath)}
            size="md"
          />
        </BentoCard>

        {/* Destiny Number */}
        <BentoCard
          title={text.destiny}
          icon={Star}
          colSpan={1}
          animationDelay={150}
          interactive
        >
          <NumberSpotlight
            value={numbers.destiny}
            label={text.destiny}
            isMaster={isMasterNumber(numbers.destiny)}
            size="md"
          />
        </BentoCard>

        {/* Soul Urge */}
        <BentoCard
          title={text.soulUrge}
          icon={Heart}
          iconColor="text-chart-1"
          colSpan={1}
          animationDelay={200}
          interactive
        >
          <NumberSpotlight
            value={numbers.soulUrge}
            label={text.soulUrge}
            isMaster={isMasterNumber(numbers.soulUrge)}
            size="sm"
          />
        </BentoCard>

        {/* Personality */}
        <BentoCard
          title={text.personality}
          icon={Moon}
          iconColor="text-chart-4"
          colSpan={1}
          animationDelay={250}
          interactive
        >
          <NumberSpotlight
            value={numbers.personality}
            label={text.personality}
            isMaster={isMasterNumber(numbers.personality)}
            size="sm"
          />
        </BentoCard>

        {/* Lo Shu Grid */}
        <BentoCard
          title={text.loShu}
          icon={Grid3X3}
          iconColor="text-chart-5"
          colSpan={2}
          animationDelay={300}
          interactive
        >
          <Link to="/tools" className="block">
            <MiniLoShuGrid birthDate={birthDate} />
            <p className="text-xs text-center text-muted-foreground mt-3">
              Tap for full analysis
            </p>
          </Link>
        </BentoCard>

        {/* Streak */}
        <BentoCard
          title={text.streak}
          icon={Flame}
          iconColor="text-chart-2"
          colSpan={1}
          animationDelay={350}
        >
          <div className="flex flex-col items-center justify-center py-2">
            <StreakDisplay streak={streak} size="lg" />
          </div>
        </BentoCard>

        {/* Compatibility Quick Link */}
        <BentoCard
          title="Compatibility"
          icon={Heart}
          iconColor="text-chart-6"
          colSpan={1}
          animationDelay={400}
          interactive
        >
          <Link to="/compatibility" className="block text-center py-4">
            <Heart className="w-10 h-10 mx-auto text-chart-6 mb-2" />
            <p className="text-sm text-muted-foreground">Check compatibility</p>
          </Link>
        </BentoCard>

        {/* Quick Actions */}
        <BentoCard
          title={text.quickActions}
          icon={Sparkles}
          colSpan={2}
          animationDelay={450}
        >
          <QuickActions />
        </BentoCard>

        {/* Calendar */}
        <BentoCard
          title={text.calendar}
          icon={Calendar}
          iconColor="text-primary"
          colSpan={2}
          animationDelay={500}
        >
          <MiniCalendar birthDate={birthDate} />
        </BentoCard>
      </BentoGrid>
    </div>
  );
};

export default BentoDashboard;
