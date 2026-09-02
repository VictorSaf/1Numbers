import { useMemo, useState, lazy, Suspense, useEffect } from "react";
import { ArrowLeft, Star, BarChart3, Target, Mountain, AlertTriangle, Sparkles, CalendarCheck, Type, Grid3x3, Compass, CalendarRange, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NumberCard } from "./NumberCard";
import { PinnacleCard } from "./PinnacleCard";
import { KarmicDebtCard } from "./KarmicDebtCard";
import { PersonalCycleCard } from "./PersonalCycleCard";
import { LuckyDatesCard } from "./LuckyDatesCard";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";
import { lifePath as lifePathPlus } from "@/lib/numerology-plus/pythagorean";
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
import { Link } from "react-router-dom";
import { Chapter, Block, type ChapterMeta } from "@/components/numerology/Chapter";
import { Frontispiciu } from "@/components/numerology/Frontispiciu";
import { PlateEcho } from "@/components/numerology/PlateEcho";
import { buildDial } from "@/lib/dial";
import { LetterMap } from "@/components/numerology/LetterMap";
import { ChapterNav } from "@/components/numerology/ChapterNav";
import { Deeper } from "@/components/numerology/Deeper";
import { TwoAnswers } from "@/components/numerology/TwoAnswers";
import { SaveMapButton } from "@/components/numerology/SaveMapButton";
import { DeepReading } from "@/components/DeepReading";
import { VedicNumbers } from "@/components/numerology/VedicNumbers";
import { KuaNumber } from "@/components/numerology/KuaNumber";
import { KabbalahNumbers } from "@/components/numerology/KabbalahNumbers";
import { WhenVisible } from "@/components/WhenVisible";
import {
  CHAPTER_SELF, CHAPTER_TENSION, CHAPTER_LESSONS, CHAPTER_NOW,
} from "@/components/numerology/chapterKeys";

// Lazy load heavy chart components (Recharts)
const ExpressionPlanes = lazy(() => import("@/components/numerology/ExpressionPlanes"));
const TransitsTimeline = lazy(() => import("@/components/numerology/TransitsTimeline"));
const Biorhythms = lazy(() => import("@/components/numerology/Biorhythms"));
const DestinyMatrix = lazy(() => import("@/components/numerology/DestinyMatrix"));
const NewNumbers = lazy(() => import("@/components/numerology/NewNumbers"));
const LetterStones = lazy(() => import("@/components/numerology/LetterStones"));
const Contradictions = lazy(() => import("@/components/numerology/Contradictions"));
const NumerologyRadarChart = lazy(() => import("./charts/NumerologyRadarChart").then(m => ({ default: m.NumerologyRadarChart })));

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

// Once per device, not once per page view.
//
// The reduction is worth watching the first time and tiresome every time after,
// so the flag is written the moment the first reading renders. A visitor who
// cannot write to localStorage simply never sees it, which is the right way for
// this to fail.
const SEEN_KEY = 'seen-first-reading';

const useFirstReading = () => {
  const [first] = useState(() => {
    try {
      if (localStorage.getItem(SEEN_KEY)) return false;
      localStorage.setItem(SEEN_KEY, '1');
      return true;
    } catch {
      return false;
    }
  });
  return first;
};

export const NumerologyResults = ({ fullName, birthDate, onReset }: NumerologyResultsProps) => {
  useEffect(() => { track('result_viewed'); }, []);
  const isFirstReading = useFirstReading();
  const { t, language } = useLanguage();
  
  const results = useMemo(() => ({
    lifePath: calculateLifePathNumber(birthDate),
    destiny: calculateDestinyNumber(fullName),
    soulUrge: calculateSoulUrgeNumber(fullName),
    personality: calculatePersonalityNumber(fullName),
    personalYear: calculatePersonalYearNumber(birthDate),
  }), [fullName, birthDate]);

  // Same call the value came from, kept whole. lifePath() returns { raw, value }
  // and calculateLifePathNumber discards the raw.
  const lifePathRaw = useMemo(
    () => lifePathPlus({ day: birthDate.getDate(), month: birthDate.getMonth() + 1, year: birthDate.getFullYear() }).raw,
    [birthDate],
  );

  const pinnacles = useMemo(() => calculatePinnacles(birthDate), [birthDate]);
  const challenges = useMemo(() => calculateChallenges(birthDate), [birthDate]);
  const karmicDebts = useMemo(() => calculateKarmicDebts(birthDate, fullName), [birthDate, fullName]);
  const karmicLessons = useMemo(() => calculateKarmicLessons(fullName), [fullName]);

  const currentYear = new Date().getFullYear();
  const currentAge = currentYear - birthDate.getFullYear();

  // The five questions the reading answers, in order. The chapter is the unit
  // now: the page used to be fifteen blocks in the order they were written, ten
  // of them folded behind ten identical "Show" buttons.
  const CHAPTERS: Record<string, { title: Record<string, string>; question: Record<string, string> }> = {
    self: {
      title: { ro: "Cine ești", en: "Who you are", ru: "Кто вы" },
      question: {
        ro: "Din ce ești făcut, indiferent de an.",
        en: "What you are made of, whatever the year.",
        ru: "Из чего вы состоите, независимо от года.",
      },
    },
    tension: {
      title: { ro: "Ce se contrazice în tine", en: "What contradicts itself in you", ru: "Что в вас противоречит" },
      question: {
        ro: "Cele două lucruri din harta ta care nu se potrivesc.",
        en: "The two things in your map that do not fit together.",
        ru: "Две вещи в вашей карте, которые не сходятся.",
      },
    },
    lessons: {
      title: { ro: "Ce ai de învățat", en: "What you have to learn", ru: "Чему вам предстоит учиться" },
      question: {
        ro: "Ce lipsește din harta ta și de ce contează.",
        en: "What is missing from your map, and why it matters.",
        ru: "Чего не хватает в вашей карте и почему это важно.",
      },
    },
    now: {
      title: { ro: "Unde ești acum", en: "Where you are now", ru: "Где вы сейчас" },
      question: {
        ro: "Ce se întâmplă anul ăsta, luna asta, azi.",
        en: "What is happening this year, this month, today.",
        ru: "Что происходит в этом году, в этом месяце, сегодня.",
      },
    },
    ahead: {
      title: { ro: "Ce urmează", en: "What comes next", ru: "Что дальше" },
      question: {
        ro: "Harta întregii vieți, pe etape.",
        en: "The map of a whole life, in stages.",
        ru: "Карта всей жизни, по этапам.",
      },
    },
    /**
     * Tradițiile paralele stăteau la „Ce urmează”, unde nu răspundeau la
     * întrebarea capitolului: matricea, vedicul, kua și kabbala nu spun nimic
     * despre etapele vieții. Sunt aceeași dată de naștere citită prin alte
     * alfabete și alte reguli -- altă întrebare, deci alt capitol.
     */
    traditions: {
      title: { ro: "Aceeași hartă, alte tradiții", en: "The same map, other traditions", ru: "Та же карта, другие традиции" },
      question: {
        ro: "Ce spun despre tine sistemele care numără altfel.",
        en: "What the systems that count differently say about you.",
        ru: "Что о вас говорят системы, которые считают иначе.",
      },
    },
  };

  const chapters: ChapterMeta[] = Object.entries(CHAPTERS).map(([id, c]) => ({
    id,
    title: c.title[language] ?? c.title.en,
    question: c.question[language] ?? c.question.en,
  }));

  const sectionLabels = {
    pinnacles: { ro: "Pinnacle-uri și Provocări", en: "Pinnacles & Challenges", ru: "Пиннакли и Вызовы" },
    karmic: { ro: "Datorii Karmice", en: "Karmic Debts", ru: "Кармические Долги" },
    lessons: { ro: "Lecții Karmice", en: "Karmic Lessons", ru: "Кармические Уроки" },
    noDebts: { ro: "Nu ai datorii karmice detectate.", en: "No karmic debts detected.", ru: "Кармических долгов не обнаружено." },
    noLessons: { ro: "Toate numerele sunt prezente în nume.", en: "All numbers are present in your name.", ru: "Все числа присутствуют в имени." },
    luckyDates: { ro: "Date Favorabile", en: "Lucky Dates", ru: "Благоприятные Даты" },
    nameAnalysis: { ro: "Analiza Numelui", en: "Name Analysis", ru: "Анализ Имени" },
    newNumbers: { ro: "Numerele Noi", en: "The New Numbers", ru: "Новые Числа" },
    stones: { ro: "Cele trei litere", en: "The three letters", ru: "Три буквы" },
    planes: { ro: "Planurile de Expresie", en: "Planes of Expression", ru: "Планы Выражения" },
    matrix: { ro: "Matrița Destinului", en: "Destiny Matrix", ru: "Матрица Судьбы" },
    parallel: { ro: "Numărul compus caldeean", en: "The Chaldean compound number", ru: "Халдейское составное число" },
    vedic: { ro: "Numerologie vedică (Ank Jyotish)", en: "Vedic numerology (Ank Jyotish)", ru: "Ведическая нумерология (Анк Джьотиш)" },
    kua: { ro: "Numărul Kua (Feng Shui)", en: "The Kua number (Feng Shui)", ru: "Число Гуа (фэн-шуй)" },
    kabbalah: { ro: "Kabbalah", en: "Kabbalah", ru: "Каббала" },
    twoAnswers: { ro: "Unde harta se răspunde de două ori", en: "Where the map answers twice", ru: "Где карта отвечает дважды" },
    deeperSelf: { ro: "Cele trei litere și profilul complet", en: "The three letters and the full profile", ru: "Три буквы и полный профиль" },
    deeperLessons: { ro: "Pătratul Lo Shu, distribuția și planurile", en: "The Lo Shu square, distribution and planes", ru: "Квадрат Ло Шу, распределение и планы" },
    deeperNow: { ro: "Zilele favorabile și bioritmurile", en: "Lucky dates and biorhythms", ru: "Благоприятные дни и биоритмы" },
    openChaldean: { ro: "Deschide analiza caldeeană", en: "Open the Chaldean analysis", ru: "Открыть халдейский анализ" },
    transits: { ro: "Tranzite și Esență", en: "Transits and Essence", ru: "Транзиты и Сущность" },
    biorhythms: { ro: "Biorritmuri", en: "Biorhythms", ru: "Биоритмы" },
    core: { ro: "Numerele de bază", en: "The core numbers", ru: "Основные числа" },
    profile: { ro: "Profilul numerologic", en: "Numerology profile", ru: "Нумерологический профиль" },
    distribution: { ro: "Distribuția cifrelor", en: "Number distribution", ru: "Распределение чисел" },
    cycles: { ro: "Ciclurile personale", en: "Personal cycles", ru: "Личные циклы" },
    tension: { ro: "Punțile și echilibrul", en: "The bridges and the balance", ru: "Мосты и равновесие" },
    contradiction: { ro: "Ce nu se potrivește", en: "What does not fit", ru: "Что не сходится" },
    depth: { ro: "Ce e sub suprafață", en: "What sits under the surface", ru: "Что лежит под поверхностью" },
    // Ecourile NU repetă nota blocului de deasupra lor. Pusă de două ori, la
    // patru rânduri distanță, aceeași propoziție face pagina să pară scrisă de
    // două ori -- exact ce se reclamase la /azi.
    echoTension: {
      ro: "Nu se rezolvă — se traversează, în fiecare zi în care vrei ceva ce nu se vede pe tine.",
      en: "It does not get solved — it gets crossed, every day you want something that does not show on you.",
      ru: "Это не решается — это пересекают, каждый день, когда хотите того, чего по вам не видно.",
    },
    echoMissing: {
      ro: "Nu-ți vin de la sine. De-aia sunt lecții, nu însușiri.",
      en: "They do not come to you on their own. That is why they are lessons, not traits.",
      ru: "Они не даются сами. Потому это уроки, а не черты.",
    }
  };

  // One line per section, shown under its title whether it is open or closed.
  const teasers = {
    twoAnswers: {
      ro: "Aceleași întrebări, puse prin sisteme diferite — și ce înseamnă când răspunsurile nu coincid.",
      en: "The same questions put through different systems — and what it means when the answers do not match.",
      ru: "Одни и те же вопросы через разные системы — и что значит, когда ответы расходятся.",
    },
    pinnacles: { ro: "Cele patru etape majore ale vieții tale și provocările fiecăreia.", en: "The four major stages of your life and the challenge of each.", ru: "Четыре главных этапа вашей жизни и вызов каждого." },
    karmic: { ro: "Datoriile 13, 14, 16 și 19 și ce înseamnă pentru tine.", en: "Debts 13, 14, 16 and 19 and what they mean for you.", ru: "Долги 13, 14, 16 и 19 и что они значат для вас." },
    lessons: { ro: "Numerele lipsă din numele tău și lecțiile pe care le indică.", en: "The numbers missing from your name and the lessons they point to.", ru: "Числа, отсутствующие в имени, и уроки, на которые они указывают." },
    luckyDates: { ro: "Zilele favorabile pentru decizii importante.", en: "The days that favour important decisions.", ru: "Дни, благоприятные для важных решений." },
    nameAnalysis: { ro: "Distribuția literelor, vocalelor și consoanelor din numele tău.", en: "The distribution of letters, vowels and consonants in your name.", ru: "Распределение букв, гласных и согласных в вашем имени." },
    newNumbers: { ro: "Atitudine, Maturitate, Echilibru, Pasiune Ascunsă și încă zece.", en: "Attitude, Maturity, Balance, Hidden Passion and ten more.", ru: "Отношение, Зрелость, Баланс, Скрытая страсть и ещё десять." },
    stones: { ro: "Cum intri, cum închei, și ce simți înainte de gând.", en: "How you begin, how you finish, and what you feel before thought.", ru: "Как вы начинаете, как завершаете и что вы чувствуете до мысли." },
    planes: { ro: "Cum se distribuie literele numelui tău pe patru planuri și trei naturi.", en: "How the letters of your name spread across four planes and three natures.", ru: "Как буквы вашего имени распределяются по четырём планам и трём натурам." },
    matrix: { ro: "Cele nouă puncte ale octagramei, calculate din data nașterii.", en: "The nine points of the octagram, drawn from your birth date.", ru: "Девять точек октаграммы, рассчитанных по дате рождения." },
    vedic: { ro: "Mulank, Bhagyank și Naamank, planetele lor și cum se împacă între ele.", en: "Mulank, Bhagyank and Naamank, their planets, and how they get on.", ru: "Муланк, Бхагьянк и Нааманк, их планеты и то, как они уживаются." },
    kua: { ro: "Un număr Feng Shui derivat din anul nașterii și cele patru direcții pe care le deschide.", en: "A Feng Shui number drawn from the birth year, and the four directions it opens.", ru: "Число фэн-шуй, выведенное из года рождения, и четыре направления, которые оно открывает." },
    kabbalah: { ro: "Două sisteme cu același nume și nicio legătură între ele, puse una lângă alta.", en: "Two systems that share a name and nothing else, set side by side.", ru: "Две системы с общим названием и без всякой связи между собой, поставленные рядом." },
    parallel: { ro: "Aceleași litere, citite de alt sistem. Numărul compus caldeean spune altceva decât cel pitagoreic.", en: "The same letters, read by another system. The Chaldean compound says something the Pythagorean one does not.", ru: "Те же буквы, прочитанные другой системой. Халдейское составное число говорит не то же, что пифагорейское." },
    transits: { ro: "Ce literă îți guvernează fiecare an și când Esența întâlnește Anul Personal.", en: "Which letter governs each year, and when Essence meets the Personal Year.", ru: "Какая буква управляет каждым годом и когда Сущность встречает Личный год." },
    biorhythms: { ro: "Ciclurile fizic, emoțional și intelectual pe o lună în jurul zilei de azi.", en: "Physical, emotional and intellectual cycles across a month around today.", ru: "Физический, эмоциональный и интеллектуальный циклы за месяц вокруг сегодняшнего дня." },
    distribution: { ro: "Câte litere din numele tău cad pe fiecare cifră.", en: "How many letters of your name land on each digit.", ru: "Сколько букв вашего имени приходится на каждую цифру." },
    profile: { ro: "Cele cinci numere de bază, pe aceeași scară.", en: "The five core numbers, on one scale.", ru: "Пять основных чисел на одной шкале." },
    tension: { ro: "Distanța dintre cine ești pe dinăuntru și cine pari pe dinafară.", en: "The distance between who you are inside and who you appear to be.", ru: "Расстояние между тем, кто вы внутри, и тем, кем кажетесь." },
    contradiction: { ro: "Cele două numere care trag în direcții diferite, și ce închide distanța.", en: "The two numbers pulling different ways, and what closes the distance.", ru: "Два числа, тянущие в разные стороны, и что закрывает расстояние." },
    depth: { ro: "Pasiunea ascunsă și cifrele care lipsesc cu totul din nume.", en: "The hidden passion, and the digits missing from your name entirely.", ru: "Скрытая страсть и цифры, которых в имени нет вовсе." }
  };

  // Generate share data
  const shareUrl = generateShareableLink({
    fullName,
    birthDate: birthDate.toISOString()
  });
  
  // Hardcoded English, on a page that is otherwise fully translated -- and this
  // is the text that leaves the app, into someone else's feed.
  const SHARE_COPY = {
    ro: {
      title: (name: string) => `${name} — raport numerologic`,
      text: (lp: number, d: number) => `Raportul meu numerologic: Drumul Vieții ${lp}, Destin ${d}.`,
    },
    en: {
      title: (name: string) => `${name} — numerology report`,
      text: (lp: number, d: number) => `My numerology report: Life Path ${lp}, Destiny ${d}.`,
    },
    ru: {
      title: (name: string) => `${name} — нумерологический отчёт`,
      text: (lp: number, d: number) => `Мой нумерологический отчёт: Жизненный путь ${lp}, Судьба ${d}.`,
    },
  } as const;

  const share = SHARE_COPY[language as keyof typeof SHARE_COPY] ?? SHARE_COPY.en;

  const shareData = {
    title: share.title(fullName),
    text: share.text(results.lifePath, results.destiny),
    url: shareUrl
  };
  
  const reportData = {
    fullName,
    birthDate,
    language
  };

  const chartSkeleton = <ChartSkeleton />;

  // O singură figură pentru toată pagina: frontispiciul și cele două ecouri
  // arată același cadran. Calculat de trei ori, s-ar putea desincroniza.
  const figure = useMemo(() => buildDial(fullName, birthDate, language as "ro" | "en" | "ru"), [fullName, birthDate, language]);

  return (
    <div className="lg:grid lg:grid-cols-[13rem_minmax(0,1fr)] lg:gap-10">
      <ChapterNav chapters={chapters} />

      <div className="space-y-14">
        {/* Citirea întreagă stă înaintea capitolelor: ele explică fiecare număr
            separat, ea spune ce ies împreună. Cine citește de sus în jos
            întâlnește întâi întregul, apoi părțile.

            În coloana de conținut, nu lângă ea. Grila de aici are exact două
            coloane -- 13rem pentru navigație, restul pentru text -- iar pusă ca
            frate, citirea lua coloana navigației și împingea totul cu un loc
            mai încolo: pe desktop, tot raportul se strângea în treisprezece
            rem. Pe telefon nu se vedea nimic, fiindcă acolo grila nici nu e
            grilă. */}
        {/* Capul paginii era antetul unui document: o insignă, numele, un
            subtitlu fix și trei butoane. Nimic din el nu spunea nimic despre
            omul care tocmai își deschisese harta.
            „Calculate again" stă tot aici, lângă celelalte lucruri pe care le
            poți face cu o citire -- nu la sfârșitul ei. Ultimul lucru de pe
            pagină rămâne oferta de a păstra harta. */}
        <Frontispiciu
          fullName={fullName}
          birthDate={birthDate}
          actions={
            <>
              <ExportMenu reportData={reportData} />
              <ShareButtons shareData={shareData} />
              <Button
                onClick={onReset}
                variant="ghost"
                size="sm"
                className="text-plate-muted hover:bg-plate-2 hover:text-plate-ink"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                {t.calculateAgain}
              </Button>
            </>
          }
        />

        <DeepReading fullName={fullName} birthDate={birthDate} />

        {/* 1 — Cine ești */}
        <Chapter meta={chapters[0]} index={1}>
          <Block title={sectionLabels.core[language]} icon={<Star className="h-5 w-5 text-primary" />}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <NumberCard title={t.lifePathTitle} number={results.lifePath} raw={lifePathRaw} resolve={isFirstReading} delay={100} isMain />
              <NumberCard title={t.destinyTitle} number={results.destiny} delay={200} />
              <NumberCard title={t.soulUrgeTitle} number={results.soulUrge} delay={300} />
              <NumberCard title={t.personalityTitle} number={results.personality} delay={400} />
            </div>
          </Block>

          <Block title={sectionLabels.newNumbers[language]} icon={<Sparkles className="h-5 w-5 text-primary" />}>
            <Suspense fallback={chartSkeleton}>
              <NewNumbers fullName={fullName} birthDate={birthDate} keys={CHAPTER_SELF} />
            </Suspense>
          </Block>

          {/* Cele trei litere răspund la „cum intri", „cum închei", „ce simți
              înainte de gând" -- reflexe care nu depind de an, deci capitolul
              ăsta. Nu stau lângă LetterMap, în capitolul 3, doar pentru că și
              acolo e vorba de litere: acela răspunde la ce lipsește din hartă.
              Diagrama capitolului rămâne ultima. */}
          {/* Al doilea strat: adevărat, dar nu primul lucru de citit. Ce
              răspunde direct la „din ce ești făcut” -- miezul și numerele noi --
              rămâne mereu deschis. */}
          <Deeper label={sectionLabels.deeperSelf[language]}>
          <Block title={sectionLabels.stones[language]} icon={<Type className="h-5 w-5 text-primary" />} note={teasers.stones[language]}>
            <Suspense fallback={chartSkeleton}>
              <LetterStones fullName={fullName} birthDate={birthDate} />
            </Suspense>
          </Block>
          {/* The one diagram of this chapter: the five core numbers on one
              scale, which is the only place they can be seen against each
              other. It used to sit orphaned at the very bottom of the page. */}
          <Block title={sectionLabels.profile[language]} icon={<Target className="h-5 w-5 text-primary" />} note={teasers.profile[language]}>
            <WhenVisible fallback={chartSkeleton}>
              <Suspense fallback={chartSkeleton}>
                <NumerologyRadarChart lifePath={results.lifePath} destiny={results.destiny} soulUrge={results.soulUrge} personality={results.personality} personalYear={results.personalYear} />
              </Suspense>
            </WhenVisible>
          </Block>
          </Deeper>
        </Chapter>

        {/* 2 — Ce se contrazice în tine */}
        <Chapter meta={chapters[1]} index={2}>
          {/* The chapter's answer, before its parts. */}
          <Block title={sectionLabels.contradiction[language]} icon={<AlertTriangle className="h-5 w-5 text-warn" />} note={teasers.contradiction[language]}>
            {/* Cadranul se întoarce acolo unde coarda e chiar subiectul. */}
            {figure.chord && (
              <PlateEcho figure={figure}>
                <span className="num text-[0.63rem] uppercase tracking-[0.18em] text-plate-gilt">
                  {sectionLabels.contradiction[language]}
                </span>
                <p className="mt-3 font-heading text-lg leading-relaxed text-plate-ink sm:text-xl">
                  {figure.chord.fromLabel} <span className="num">{figure.chord.from}</span>,{" "}
                  {figure.chord.toLabel} <span className="num">{figure.chord.to}</span>.
                </p>
                <p className="mt-2 text-sm leading-relaxed text-plate-muted">
                  {sectionLabels.echoTension[language]}
                </p>
              </PlateEcho>
            )}
            <Suspense fallback={chartSkeleton}>
              <Contradictions fullName={fullName} birthDate={birthDate} />
            </Suspense>
          </Block>

          <Block title={sectionLabels.tension[language]} icon={<AlertTriangle className="h-5 w-5 text-warn" />} note={teasers.tension[language]}>
            <Suspense fallback={chartSkeleton}>
              <NewNumbers fullName={fullName} birthDate={birthDate} keys={CHAPTER_TENSION} />
            </Suspense>
          </Block>

          {/* Contradicțiile de deasupra sunt între două poziții ale aceleiași
              hărți. Astea sunt între două SISTEME care răspund la aceeași
              întrebare -- alt fel de dezacord, dar același capitol: „ce se
              contrazice în tine”. Existau de la început, împrăștiate prin
              raport, și nimic nu le punea față în față. */}
          <Block title={sectionLabels.twoAnswers[language]} icon={<AlertTriangle className="h-5 w-5 text-warn" />} note={teasers.twoAnswers[language]}>
            <TwoAnswers fullName={fullName} birthDate={birthDate} />
          </Block>
        </Chapter>

        {/* 3 — Ce ai de învățat */}
        <Chapter meta={chapters[2]} index={3}>
          <Block title={sectionLabels.karmic[language]} icon={<AlertTriangle className="h-5 w-5 text-warn" />} note={teasers.karmic[language]}>
            {karmicDebts.length > 0 ? (
              <div className="space-y-4">
                {karmicDebts.map((debt, i) => (
                  <KarmicDebtCard key={i} debt={debt} delay={i * 50} />
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground p-4 rounded-xl bg-ok/10 border border-ok/20">
                ✓ {sectionLabels.noDebts[language]}
              </p>
            )}
          </Block>

          {/* Al doilea ecou: aici subiectul sunt golurile, nu coarda. */}
          {figure.missing.length > 0 && (
            <PlateEcho figure={figure}>
              <span className="num text-[0.63rem] uppercase tracking-[0.18em] text-plate-gilt">
                {sectionLabels.lessons[language]}
              </span>
              <p className="mt-3 font-heading text-lg leading-relaxed text-plate-ink sm:text-xl">
                {figure.missing.map((n) => (
                  <span key={n} className="num mr-2">{n}</span>
                ))}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-plate-muted">
                {sectionLabels.echoMissing[language]}
              </p>
            </PlateEcho>
          )}

          <Block title={sectionLabels.lessons[language]} icon={<Sparkles className="h-5 w-5 text-primary" />} note={teasers.lessons[language]}>
            {karmicLessons.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {karmicLessons.map((num) => (
                  <div key={num} className="px-3 py-2 rounded-lg bg-muted/50 border border-border/50">
                    <span className="num text-primary mr-2">{num}</span>
                    <span className="text-xs text-muted-foreground">{KARMIC_LESSON_MEANINGS[num]?.title[language]}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground p-4 rounded-xl bg-ok/10 border border-ok/20">
                ✓ {sectionLabels.noLessons[language]}
              </p>
            )}
          </Block>

          {/* Al doilea strat. Ce răspunde la „ce lipsește din harta ta” --
              datoriile și lecțiile karmice -- rămâne deschis; grilele de aici
              arată aceleași absențe din alte unghiuri. */}
          <Deeper label={sectionLabels.deeperLessons[language]}>
          <Block title={sectionLabels.depth[language]} icon={<Grid3x3 className="h-5 w-5 text-primary" />} note={teasers.depth[language]}>
            <Suspense fallback={chartSkeleton}>
              <NewNumbers fullName={fullName} birthDate={birthDate} keys={CHAPTER_LESSONS} />
            </Suspense>
          </Block>

          {/* This chapter's one diagram: the inclusion table drawn, split by
              vowel and consonant. The plain distribution chart that used to sit
              at the foot of the page showed the same counts without the split,
              so it is gone rather than duplicated. Behind the visibility gate --
              it is the only Recharts mount in this chapter. */}
          <Block title={sectionLabels.distribution[language]} icon={<BarChart3 className="h-5 w-5 text-primary" />} note={teasers.distribution[language]}>
            <WhenVisible fallback={chartSkeleton}>
              <LetterMap fullName={fullName} />
            </WhenVisible>
          </Block>

          <Block title={sectionLabels.planes[language]} icon={<Grid3x3 className="h-5 w-5 text-primary" />} note={teasers.planes[language]}>
            <Suspense fallback={chartSkeleton}>
              <ExpressionPlanes fullName={fullName} />
            </Suspense>
          </Block>
          </Deeper>
        </Chapter>

        {/* 4 — Unde ești acum */}
        <Chapter meta={chapters[3]} index={4}>
          <Block title={sectionLabels.cycles[language]} icon={<CalendarCheck className="h-5 w-5 text-primary" />}>
            <div className="space-y-6">
              <NumberCard title={`${t.personalYearTitle} ${currentYear}`} number={results.personalYear} delay={100} />
              <PersonalCycleCard birthDate={birthDate} delay={150} />
            </div>
          </Block>

          <Block title={sectionLabels.transits[language]} icon={<CalendarRange className="h-5 w-5 text-primary" />} note={teasers.transits[language]}>
            <Suspense fallback={chartSkeleton}>
              <NewNumbers fullName={fullName} birthDate={birthDate} keys={CHAPTER_NOW} />
            </Suspense>
          </Block>

          {/* Al doilea strat. Ciclurile și tranzitele spun unde ești; zilele
              favorabile și bioritmurile sunt unelte, nu răspunsul. */}
          <Deeper label={sectionLabels.deeperNow[language]}>
          <Block title={sectionLabels.luckyDates[language]} icon={<CalendarCheck className="h-5 w-5 text-primary" />} note={teasers.luckyDates[language]}>
            <LuckyDatesCard birthDate={birthDate} fullName={fullName} delay={200} />
          </Block>

          {/* This chapter's diagram. Recharts lives inside it, so it stays behind
              the visibility gate like the other two. */}
          <Block title={sectionLabels.biorhythms[language]} icon={<Activity className="h-5 w-5 text-primary" />} note={teasers.biorhythms[language]}>
            <WhenVisible fallback={chartSkeleton}>
              <Suspense fallback={chartSkeleton}>
                <Biorhythms birthDate={birthDate} />
              </Suspense>
            </WhenVisible>
          </Block>
          </Deeper>
        </Chapter>

        {/* 5 — Ce urmează */}
        <Chapter meta={chapters[4]} index={5}>
          <Block title={sectionLabels.pinnacles[language]} icon={<Mountain className="h-5 w-5 text-primary" />} note={teasers.pinnacles[language]}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pinnacles.map((pinnacle, i) => (
                <PinnacleCard
                  key={i}
                  pinnacle={pinnacle}
                  challenge={challenges[i]}
                  isCurrentPeriod={currentAge >= pinnacle.startAge && currentAge <= pinnacle.endAge}
                  delay={i * 50}
                />
              ))}
            </div>
          </Block>

          <Block title={sectionLabels.transits[language]} icon={<CalendarRange className="h-5 w-5 text-primary" />} note={teasers.transits[language]}>
            <Suspense fallback={chartSkeleton}>
              <TransitsTimeline fullName={fullName} birthDate={birthDate} />
            </Suspense>
          </Block>

        </Chapter>

        {/* 6 — Aceeași hartă, alte tradiții
            Cele cinci blocuri de mai jos stăteau la „Ce urmează”, unde nu
            răspundeau la întrebarea capitolului: matricea, vedicul, kua și
            kabbala nu spun nimic despre etapele vieții. Sunt aceeași dată de
            naștere citită prin alte alfabete și alte reguli.
            Un Destin pitagoreic de 1 și unul caldeean de 5 nu se contrazic --
            sunt două citiri ale aceluiași nume prin alfabete formate în locuri
            diferite. De aceea stau împreună, și separat de restul. */}
        <Chapter meta={chapters[5]} index={6}>
          {/* Octograma. SVG inline, nu Recharts, deci nu are nevoie de poartă
              de vizibilitate. */}
          <Block title={sectionLabels.matrix[language]} icon={<Compass className="h-5 w-5 text-primary" />} note={teasers.matrix[language]}>
            <Suspense fallback={chartSkeleton}>
              <DestinyMatrix birthDate={birthDate} />
            </Suspense>
          </Block>

          {/* The engine's three parallel systems, inline at last.
              fullProfile computed vedic, kua and kabbalah from the day
              numerology-plus landed and nothing rendered any of them: a grep for
              vedicProfile, kuaNumber or hebrewGematria outside
              src/lib/numerology-plus came back empty. The comment that used to
              sit here promised these blocks and pointed at /chaldean instead. */}
          <Block title={sectionLabels.vedic[language]} icon={<Star className="h-5 w-5 text-primary" />} note={teasers.vedic[language]}>
            <VedicNumbers fullName={fullName} birthDate={birthDate} />
          </Block>

          <Block title={sectionLabels.kua[language]} icon={<Compass className="h-5 w-5 text-primary" />} note={teasers.kua[language]}>
            <KuaNumber birthDate={birthDate} />
          </Block>

          <Block title={sectionLabels.kabbalah[language]} icon={<Type className="h-5 w-5 text-primary" />} note={teasers.kabbalah[language]}>
            <KabbalahNumbers fullName={fullName} />
          </Block>

          {/* The Chaldean page keeps its link: it carries the 52-entry compound
              table, the favourable days and the business-name reading, none of
              which the three blocks above do. It is depth now, not the entrance. */}
          <Block title={sectionLabels.parallel[language]} icon={<Compass className="h-5 w-5 text-primary" />} note={teasers.parallel[language]}>
            <Link
              to="/chaldean"
              className="inline-flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-primary transition-colors hover:bg-primary/10"
            >
              {sectionLabels.openChaldean[language]}
            </Link>
          </Block>
        </Chapter>

        {/* The reading ends by offering to keep it, not to throw it away. */}
        <div className="flex justify-center border-t border-border/60 pt-10">
          <SaveMapButton fullName={fullName} birthDate={birthDate} />
        </div>
      </div>
    </div>
  );
};
