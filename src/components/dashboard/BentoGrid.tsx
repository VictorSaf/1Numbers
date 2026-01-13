// Bento Grid Component
// Responsive grid system for dashboard layout

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface BentoGridProps {
  children: ReactNode;
  className?: string;
  columns?: 2 | 3 | 4;
  gap?: 'sm' | 'md' | 'lg';
}

const gapClasses = {
  sm: 'gap-3',
  md: 'gap-4',
  lg: 'gap-6',
};

const columnClasses = {
  2: 'grid-cols-1 md:grid-cols-2',
  3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
};

export const BentoGrid = ({
  children,
  className,
  columns = 4,
  gap = 'md',
}: BentoGridProps) => {
  return (
    <div
      className={cn(
        'bento-grid',
        columnClasses[columns],
        gapClasses[gap],
        className
      )}
    >
      {children}
    </div>
  );
};

export default BentoGrid;
