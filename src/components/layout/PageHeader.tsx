import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { PagePlate } from '@/components/layout/PagePlate';

/**
 * Capul unei pagini. E o placă, ca frontispiciul hărții.
 *
 * Componenta a rămas fiindcă șapte pagini o cheamă cu aceleași trei lucruri --
 * titlu, subtitlu, etichetă. Ce s-a schimbat e ce desenează: o placă, nu un
 * titlu pe suprafața paginii. Așa se deschid toate la fel, fără ca fiecare
 * pagină să fie editată separat.
 *
 * `badge.icon` rămâne în semnătură fiindcă cele șapte îl trimit, dar nu se mai
 * desenează: iconițele colorate erau semnătura stilului vechi, iar eticheta
 * singură spune același lucru.
 *
 * `figure` e ce ține de pagina anume. Cine n-are un desen propriu primește o
 * placă goală -- un desen pus ca să umple spațiul ar fi chiar decorul pe care
 * l-am scos de peste tot.
 */

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  badge?: { icon: ReactNode; label: string };
  figure?: ReactNode;
  showBack?: boolean;
  backTo?: string;
  backLabel?: string;
  className?: string;
}

export const PageHeader = ({
  title,
  subtitle,
  badge,
  figure,
  showBack = false,
  backTo = '/',
  backLabel,
  className = '',
}: PageHeaderProps) => {
  const { t } = useLanguage();

  return (
    <header className={`relative z-10 px-4 pt-4 ${className}`}>
      <div className="mx-auto max-w-6xl">
        {showBack && (
          <Link to={backTo} className="mb-4 inline-block">
            <Button variant="ghost" className="gap-2 text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4" />
              <span>{backLabel || t.backToCalculator}</span>
            </Button>
          </Link>
        )}

        <PagePlate
          eyebrow={badge?.label ?? title}
          title={title}
          subtitle={subtitle}
          figure={figure}
        />
      </div>
    </header>
  );
};
