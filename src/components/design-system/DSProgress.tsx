/**
 * DSProgress - Standardized progress bar
 * Replaces inline width calculations with CSS-driven progress
 */

import { memo } from 'react';
import { cn } from '@/lib/utils';

export interface DSProgressProps {
  value: number;
  max?: number;
  variant?: 'primary' | 'success' | 'warning' | 'error';
  animated?: boolean;
  showLabel?: boolean;
  className?: string;
}

const variantClasses = {
  primary: '',
  success: 'ds-progress--success',
  warning: 'ds-progress--warning',
  error: 'ds-progress--error',
};

export const DSProgress = memo(({
  value,
  max = 100,
  variant = 'primary',
  animated = false,
  showLabel = false,
  className,
}: DSProgressProps) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <div className={cn('ds-progress', variantClasses[variant], animated && 'ds-progress--animated', className)}>
      <div className="ds-progress__track">
        <div
          className="ds-progress__fill"
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
        />
      </div>
      {showLabel && (
        <span className="text-xs text-muted-foreground mt-1">
          {Math.round(percentage)}%
        </span>
      )}
    </div>
  );
});

DSProgress.displayName = 'DSProgress';

export default DSProgress;
