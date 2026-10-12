import { lazy, Suspense } from 'react';
import { useSearchParams } from 'react-router-dom';
import { BookOpen, GraduationCap, HelpCircle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageLayout } from '@/components/layout/PageLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { useLanguage } from '@/contexts/LanguageContext';

/**
 * The reading pages, in one place.
 *
 * /guide, /tutorials and /faq were separate destinations, and only the first
 * two ever had a link in the header. They answer one intent between them, so
 * they are one destination with three sections. The articles that were a fourth
 * are gone: one-sentence bodies under a "10 min" label (docs/produs/03-filtru.md).
 *
 * The section is in the query string rather than in component state so a link
 * to the questions is still a link to the questions: the 301s from the old
 * paths point at ?s=, which is the only way a bookmark keeps its meaning.
 */

const Guide = lazy(() => import('@/components/learn/NumerologyGuide'));
const Tutorials = lazy(() => import('@/components/learn/Tutorials'));
const FAQ = lazy(() => import('@/components/learn/FAQ'));

const COPY = {
  ro: {
    title: 'Învață',
    subtitle: 'Ce înseamnă numerele și cum se calculează.',
    badge: 'Ghid și tutoriale',
    ghid: 'Ghid',
    tutoriale: 'Tutoriale',
    intrebari: 'Întrebări',
  },
  en: {
    title: 'Learn',
    subtitle: 'What the numbers mean and how they are worked out.',
    badge: 'Guide and tutorials',
    ghid: 'Guide',
    tutoriale: 'Tutorials',
    intrebari: 'Questions',
  },
  ru: {
    title: 'Изучайте',
    subtitle: 'Что означают числа и как они вычисляются.',
    badge: 'Руководство и уроки',
    ghid: 'Руководство',
    tutoriale: 'Уроки',
    intrebari: 'Вопросы',
  },
} as const;

const SECTIONS = ['ghid', 'tutoriale', 'intrebari'] as const;
type Section = (typeof SECTIONS)[number];

const ICONS = {
  ghid: BookOpen,
  tutoriale: GraduationCap,
  intrebari: HelpCircle,
} as const;

const PanelSkeleton = () => (
  <div className="page-measure py-4 page-rhythm">
    <div className="h-64 animate-pulse rounded-lg border border-line bg-sunken" />
  </div>
);

const Learn = () => {
  const { language } = useLanguage();
  const [params, setParams] = useSearchParams();
  const t = COPY[language as keyof typeof COPY] ?? COPY.en;

  const requested = params.get('s') as Section | null;
  const section: Section = requested && SECTIONS.includes(requested) ? requested : 'ghid';

  return (
    <PageLayout>
      <PageHeader
        title={t.title}
        subtitle={t.subtitle}
        badge={{ icon: <BookOpen className="h-4 w-4" />, label: t.badge }}
      />

      <Tabs
        value={section}
        onValueChange={(next) => setParams(next === 'ghid' ? {} : { s: next }, { replace: true })}
        className="w-full"
      >
        <div className="page-measure">
          <TabsList className="mb-2">
            {SECTIONS.map((key) => {
              const Icon = ICONS[key];
              return (
                <TabsTrigger key={key} value={key} className="gap-1.5 text-xs sm:text-sm">
                  <Icon className="h-4 w-4" />
                  {t[key]}
                </TabsTrigger>
              );
            })}
          </TabsList>
        </div>

        {/* Panourile intră ÎN măsură, ca filele de deasupra lor. Lăsate
            afară, se întindeau pe toată fereastra, iar pagina avea două
            lățimi -- exact treapta pe care harta n-o are. */}
        <div className="page-measure">
          <Suspense fallback={<PanelSkeleton />}>
          <TabsContent value="ghid"><Guide /></TabsContent>
          <TabsContent value="tutoriale"><Tutorials /></TabsContent>
          <TabsContent value="intrebari"><FAQ /></TabsContent>
          </Suspense>
        </div>
      </Tabs>
    </PageLayout>
  );
};

export default Learn;
