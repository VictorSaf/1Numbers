// Bento Card Component
// Glassmorphism card wrapper with configurable spans

import { ReactNode, forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';
import { getDelayClass } from '@/components/design-system';

export interface BentoCardProps {
  children: ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  icon?: LucideIcon;
  iconColor?: string;
  colSpan?: 1 | 2 | 3 | 4;
  rowSpan?: 1 | 2;
  variant?: 'default' | 'gradient' | 'accent' | 'highlight';
  interactive?: boolean;
  onClick?: () => void;
  animationDelay?: number;
}

const spanClasses = {
  col: {
    1: '',
    2: 'md:col-span-2',
    3: 'md:col-span-2 lg:col-span-3',
    4: 'col-span-full',
  },
  row: {
    1: '',
    2: 'row-span-2',
  },
};

const variantClasses = {
  default: 'bento-card',
  gradient: 'bento-card bento-card-gradient',
  accent: 'bento-card bento-card-accent',
  highlight: 'bento-card bento-card-highlight',
};

export const BentoCard = forwardRef<HTMLDivElement, BentoCardProps>(
  (
    {
      children,
      className,
      title,
      subtitle,
      icon: Icon,
      iconColor = 'text-primary',
      colSpan = 1,
      rowSpan = 1,
      variant = 'default',
      interactive = false,
      onClick,
      animationDelay = 0,
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          variantClasses[variant],
          spanClasses.col[colSpan],
          spanClasses.row[rowSpan],
          interactive && 'cursor-pointer',
          'animate-fade-in opacity-0 [animation-fill-mode:forwards]',
          getDelayClass(animationDelay),
          className
        )}
        onClick={onClick}
        role={interactive ? 'button' : undefined}
        tabIndex={interactive ? 0 : undefined}
        onKeyDown={
          interactive
            ? (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  onClick?.();
                }
              }
            : undefined
        }
      >
        {(title || Icon) && (
          <div className="bento-card-header">
            {Icon && (
              <div className={cn('bento-card-icon', iconColor)}>
                <Icon className="h-5 w-5" />
              </div>
            )}
            {title && (
              <div className="flex-1 min-w-0">
                <h3 className="bento-card-title">{title}</h3>
                {subtitle && <p className="bento-card-subtitle">{subtitle}</p>}
              </div>
            )}
          </div>
        )}
        <div className="bento-card-content">{children}</div>
      </div>
    );
  }
);

BentoCard.displayName = 'BentoCard';

export default BentoCard;
