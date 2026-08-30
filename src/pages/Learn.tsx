import { lazy, Suspense } from 'react';
import { useSearchParams } from 'react-router-dom';
import { BookOpen, GraduationCap, HelpCircle, Newspaper } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageLayout } from '@/components/layout/PageLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { useLanguage } from '@/contexts/LanguageContext';

/**
 * The four reading pages, in one place.
 *
 * /guide, /tutorials, /faq and /articles were four separate destinations, and
 * only the first two ever had a link in the header -- the other two were
 * reachable by typing the URL. They answer one intent between them, so they are
 * one destination with four sections.
 *
 * The section is in the query string rather than in component state so a link
 * to the questions is still a link to the questions: the 301s from the old
 * paths point at ?s=, which is the only way a bookmark keeps its meaning.
 */

const Guide = lazy(() => import('@/components/learn/NumerologyGuide'));
const Tutorials = lazy(() => import('@/components/learn/Tutorials'));
const FAQ = lazy(() => import('@/components/learn/FAQ'));
const Articles = lazy(() => import('@/components/learn/Articles'));

const COPY = {
  ro: {
    title: 'Învață',
    subtitle: 'Ce înseamnă numerele, cum se calculează și ce s-a mai scris despre ele.',
    badge: 'Ghid și tutoriale',
    ghid: 'Ghid',
    tutoriale: 'Tutoriale',
    intrebari: 'Întrebări',
    articole: 'Articole',
  },
  en: {
    title: 'Learn',
    subtitle: 'What the numbers mean, how they are worked out, and what has been written about them.',
    badge: 'Guide and tutorials',
    ghid: 'Guide',
    tutoriale: 'Tutorials',
    intrebari: 'Questions',
    articole: 'Articles',
  },
  ru: {
    title: 'Изучайте',
    subtitle: 'Что означают числа, как они вычисляются и что о них написано.',
    badge: 'Руководство и уроки',
    ghid: 'Руководство',
    tutoriale: 'Уроки',
    intrebari: 'Вопросы',
    articole: 'Статьи',
  },
} as const;

const SECTIONS = ['ghid', 'tutoriale', 'intrebari', 'articole'] as const;
type Section = (typeof SECTIONS)[number];

const ICONS = {
  ghid: BookOpen,
  tutoriale: GraduationCap,
  intrebari: HelpCircle,
  articole: Newspaper,
} as const;

const PanelSkeleton = () => (
  <div className="mx-auto max-w-4xl px-4 py-12">
    <div className="h-64 animate-pulse rounded-xl border border-primary/20 bg-primary/5" />
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
        badge={{ icon: <BookOpen className="h-4 w-4 text-primary" />, label: t.badge }}
      />

      <Tabs
        value={section}
        onValueChange={(next) => setParams(next === 'ghid' ? {} : { s: next }, { replace: true })}
        className="w-full"
      >
        <div className="mx-auto max-w-4xl px-4">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
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

        <Suspense fallback={<PanelSkeleton />}>
          <TabsContent value="ghid"><Guide /></TabsContent>
          <TabsContent value="tutoriale"><Tutorials /></TabsContent>
          <TabsContent value="intrebari"><FAQ /></TabsContent>
          <TabsContent value="articole"><Articles /></TabsContent>
        </Suspense>
      </Tabs>
    </PageLayout>
  );
};

export default Learn;
