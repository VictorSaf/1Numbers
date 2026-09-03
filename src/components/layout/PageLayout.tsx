import { ReactNode } from 'react';
import AppHeader from './AppHeader';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';

interface PageLayoutProps {
  children: ReactNode;
  className?: string;
}

/**
 * Subsolul, o singură dată, pentru toată aplicația.
 *
 * Erau cinci: în Index, în Predictions, și câte unul în trei dintre filele de
 * la Învață -- adică pe /invata subsolul apărea ÎNĂUNTRUL conținutului filei,
 * de fiecare dată când schimbai fila. Nici măcar nu spuneau același lucru:
 * două aveau `border-border`, trei `border-border/30`.
 *
 * Mai important decât aspectul: disclaimerul trebuie să apară pe fiecare
 * pagină, iar cinci copii înseamnă cinci locuri de uitat. O pagină nouă îl
 * primește acum fără să facă nimic.
 *
 * Legăturile către confidențialitate și termeni stau aici fiindcă subsolul e
 * singurul loc de pe fiecare pagină. Au apărut abia când rutele au existat: un
 * link mort e mai rău decât unul care încă nu există.
 */
const Footer = () => {
  const { t } = useLanguage();
  return (
    <footer className="mt-20 border-t border-line">
      <div className="page-measure py-8">
        <p className="max-w-[70ch] text-sm leading-relaxed text-muted-foreground">{t.disclaimer}</p>
        <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2">
          <Link
            to="/confidentialitate"
            className="num text-[0.63rem] uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:text-gilt"
          >
            {t.privacyLink}
          </Link>
          <Link
            to="/termeni"
            className="num text-[0.63rem] uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:text-gilt"
          >
            {t.termsLink}
          </Link>
          <span className="num text-[0.63rem] uppercase tracking-[0.14em] text-muted-foreground">
            {t.footer}
          </span>
        </div>
      </div>
    </footer>
  );
};

export const PageLayout = ({ children, className = '' }: PageLayoutProps) => {
  return (
    <div className="min-h-screen relative">
      <AppHeader />
      <div className={`pt-16 ${className}`}>
        {children}
      </div>
      <Footer />
    </div>
  );
};
