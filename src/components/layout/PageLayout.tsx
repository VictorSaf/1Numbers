import { ReactNode } from 'react';
import AppHeader from './AppHeader';
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
 * Legăturile către confidențialitate și termeni vin odată cu rutele lor, la
 * sarcina 2.4. Un link mort e mai rău decât unul care încă nu există.
 */
const Footer = () => {
  const { t } = useLanguage();
  return (
    <footer className="mt-20 border-t border-line">
      <div className="page-measure py-8">
        <p className="max-w-[70ch] text-sm leading-relaxed text-muted-foreground">{t.disclaimer}</p>
        <p className="num mt-3 text-[0.63rem] uppercase tracking-[0.14em] text-muted-foreground">
          {t.footer}
        </p>
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
