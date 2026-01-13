/**
 * DSColorSwatch - Dynamic color display component
 * Replaces inline style={{ backgroundColor: color }} patterns
 */

import { memo } from 'react';
import { cn } from '@/lib/utils';

export interface DSColorSwatchProps {
  color: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  title?: string;
}

const sizeClasses = {
  sm: 'ds-color-swatch--sm',
  md: 'ds-color-swatch--md',
  lg: 'ds-color-swatch--lg',
  xl: 'ds-color-swatch--xl',
};

export const DSColorSwatch = memo(({
  color,
  size = 'md',
  className,
  title,
}: DSColorSwatchProps) => {
  return (
    <div
      className={cn('ds-color-swatch', sizeClasses[size], className)}
      style={{ backgroundColor: color }}
      title={title}
      role="img"
      aria-label={title || `Color: ${color}`}
    />
  );
});

DSColorSwatch.displayName = 'DSColorSwatch';

export default DSColorSwatch;
