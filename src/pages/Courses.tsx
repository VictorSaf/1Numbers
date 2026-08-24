import { useState, useEffect } from 'react';
import { GraduationCap, Trophy, Award } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { CourseCard } from '@/components/CourseCard';
import { Course, CourseProgress } from '@/lib/education';
import { PageLayout } from '@/components/layout/PageLayout';
import { PageHeader } from '@/components/layout/PageHeader';

// Mock courses - in production, these would come from API/database
const mockCourses: Course[] = [
  {
    id: 'intro-numerology',
    title: 'Introducere în Numerologie',
    description: 'Învață bazele numerologiei și cum să calculezi numerele tale personale.',
    lessons: [],
    estimatedDuration: 30,
    difficulty: 'beginner',
    category: 'Basics',
  },
  {
    id: 'life-path-mastery',
    title: 'Maestru: Numărul Drumului Vieții',
    description: 'Studiu aprofundat al Numărului Drumului Vieții și semnificația sa.',
    lessons: [],
    estimatedDuration: 45,
    difficulty: 'intermediate',
    category: 'Advanced',
  },
];

const Courses = () => {
  const { t, language } = useLanguage();
  const c = {
    ro: { title: 'Cursuri Numerologie', subtitle: 'Învață numerologia pas cu pas prin cursuri structurate', badge: 'Cursuri',
          soon: 'În curând', soonDesc: 'Pregătim cursuri structurate de numerologie. Revino în curând.' },
    en: { title: 'Numerology Courses', subtitle: 'Learn numerology step by step through structured courses', badge: 'Courses',
          soon: 'Coming soon', soonDesc: 'Structured numerology courses are in preparation. Check back soon.' },
    ru: { title: 'Курсы нумерологии', subtitle: 'Изучайте нумерологию шаг за шагом', badge: 'Курсы',
          soon: 'Скоро', soonDesc: 'Структурированные курсы по нумерологии готовятся. Загляните позже.' },
  }[language] ?? { title: 'Numerology Courses', subtitle: '', badge: 'Courses', soon: 'Coming soon', soonDesc: '' };
  const [courses] = useState<Course[]>(mockCourses);
  const [progressData, setProgressData] = useState<CourseProgress[]>([]);

  // Load progress from localStorage (in production, from API)
  useEffect(() => {
    const saved = localStorage.getItem('courseProgress');
    if (saved) {
      try {
        setProgressData(JSON.parse(saved));
      } catch (e) {
        console.error('Error loading course progress:', e);
      }
    }
  }, []);

  return (
    <PageLayout>
      <PageHeader
        title={c.title}
        subtitle={c.subtitle}
        badge={{
          icon: <GraduationCap className="h-4 w-4 text-primary" />,
          label: c.badge
        }}
      />

      <main className="relative z-10 px-4 pb-16">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* The two entries here were mock data with no lessons, and their cards
              linked to /courses/:id, a route that does not exist. Showing an honest
              placeholder until there is real course content. */}
          <div className="max-w-xl mx-auto text-center py-16 space-y-3">
            <GraduationCap className="h-10 w-10 text-primary mx-auto opacity-70" />
            <h2 className="font-cinzel text-2xl text-foreground">{c.soon}</h2>
            <p className="text-muted-foreground">{c.soonDesc}</p>
          </div>

          {/* Empty State */}
          {courses.length === 0 && (
            <div className="text-center py-12">
              <GraduationCap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Nu sunt cursuri disponibile momentan</p>
            </div>
          )}
        </div>
      </main>
    </PageLayout>
  );
};

export default Courses;

