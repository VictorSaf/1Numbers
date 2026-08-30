import { ReactNode } from 'react';
import AppHeader from './AppHeader';

interface PageLayoutProps {
  children: ReactNode;
  className?: string;
}

export const PageLayout = ({ children, className = '' }: PageLayoutProps) => {
  return (
    <div className="min-h-screen relative">
      <AppHeader />
      <div className={`pt-16 ${className}`}>
        {children}
      </div>
    </div>
  );
};

