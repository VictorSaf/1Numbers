/**
 * DSCard - Standardized card component
 * Unifies card-mystic, bento-card, and other card patterns
 */

import { forwardRef, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';
import { getDelayClass } from './tokens';

export interface DSCardProps {
  children: ReactNode;
  variant?: 'default' | 'elevated' | 'glass' | 'mystic';
  className?: string;
  title?: string;
  subtitle?: string;
  icon?: LucideIcon;
  iconColor?: string;
  animationDelay?: number;
  onClick?: () => void;
}

const variantClasses = {
  default: 'ds-card',
  elevated: 'ds-card--elevated',
  glass: 'ds-card--glass',
  mystic: 'ds-card--mystic',
};

export const DSCard = forwardRef<HTMLDivElement, DSCardProps>(({
  children,
  variant = 'default',
  className,
  title,
  subtitle,
  icon: Icon,
  iconColor = 'text-primary',
  animationDelay,
  onClick,
}, ref) => {
  const hasHeader = title || Icon;
  const delayClass = animationDelay !== undefined ? getDelayClass(animationDelay) : '';

  return (
    <div
      ref={ref}
      className={cn(
        variantClasses[variant],
        'p-6',
        animationDelay !== undefined && 'ds-animate-fade-in ds-fill-forwards',
        delayClass,
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
    >
      {hasHeader && (
        <div className="ds-card__header">
          {Icon && (
            <div className="ds-card__icon">
              <Icon className={cn('w-5 h-5', iconColor)} />
            </div>
          )}
          <div>
            {title && <h3 className="ds-card__title">{title}</h3>}
            {subtitle && <p className="ds-card__subtitle">{subtitle}</p>}
          </div>
        </div>
      )}
      <div className="ds-card__content">
        {children}
      </div>
    </div>
  );
});

DSCard.displayName = 'DSCard';

export default DSCard;
