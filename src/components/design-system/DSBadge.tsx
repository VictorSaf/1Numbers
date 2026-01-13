/**
 * DSBadge - Standardized badge component
 * Replaces inconsistent badge patterns across the codebase
 */

import { memo, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { getNumberBadgeClass, isMasterNumber } from './tokens';

export interface DSBadgeProps {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  number?: number;
  className?: string;
}

const variantClasses = {
  primary: 'ds-badge--primary',
  secondary: 'ds-badge--secondary',
  success: 'ds-badge--success',
  warning: 'ds-badge--warning',
  error: 'ds-badge--error',
  info: 'ds-badge--info',
};

export const DSBadge = memo(({
  children,
  variant,
  number,
  className,
}: DSBadgeProps) => {
  // If number is provided, use number-specific styling
  const badgeClass = number !== undefined
    ? getNumberBadgeClass(number)
    : variant
      ? variantClasses[variant]
      : 'ds-badge--primary';

  return (
    <span
      className={cn(
        badgeClass,
        isMasterNumber(number || 0) && 'font-semibold',
        className
      )}
    >
      {children}
    </span>
  );
});

DSBadge.displayName = 'DSBadge';

export default DSBadge;
