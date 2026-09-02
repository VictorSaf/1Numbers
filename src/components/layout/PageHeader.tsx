import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';

/**
 * Capul unei pagini, în registrul hărții.
 *
 * Era o insignă albastră rotundă, un titlu centrat pe `` --
 * o clasă care nu există în CSS-ul emis, deci titlul n-avea nicio culoare
 * proprie -- și un subtitlu. Acum: filet de alamă cu etichetă mono, titlu în
 * Literata, aliniate la stânga ca tot restul citirii.
 *
 * `badge.icon` rămâne în semnătură fiindcă nouă pagini îl trimit, dar nu se mai
 * desenează: iconițele colorate erau semnătura stilului vechi. Eticheta singură
 * spune același lucru.
 */

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  badge?: { icon: ReactNode; label: string };
  showBack?: boolean;
  backTo?: string;
  backLabel?: string;
  className?: string;
}

export const PageHeader = ({
  title,
  subtitle,
  badge,
  showBack = false,
  backTo = '/',
  backLabel,
  className = '',
}: PageHeaderProps) => {
  const { t } = useLanguage();

  return (
    <header className={`relative z-10 px-4 py-8 ${className}`}>
      <div className="mx-auto max-w-4xl">
        {showBack && (
          <Link to={backTo} className="mb-6 inline-block">
            <Button variant="ghost" className="gap-2 text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4" />
              <span>{backLabel || t.backToCalculator}</span>
            </Button>
          </Link>
        )}

        {badge && (
          <div className="flex items-center gap-3">
            <span className="h-px w-10 shrink-0 bg-gilt" aria-hidden="true" />
            <span className="num text-[0.63rem] uppercase tracking-[0.18em] text-gilt">
              {badge.label}
            </span>
          </div>
        )}

        <h1 className="mt-4 font-heading text-3xl leading-tight text-foreground md:text-4xl lg:text-5xl">
          {title}
        </h1>

        {subtitle && (
          <p className="mt-3 max-w-[60ch] text-lg leading-relaxed text-muted-foreground">
            {subtitle}
          </p>
        )}
      </div>
    </header>
  );
};
