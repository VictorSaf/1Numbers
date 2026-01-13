/**
 * DSNumber - Standardized number display component
 * Replaces .number-display patterns with consistent sizing
 */

import { memo } from 'react';
import { cn } from '@/lib/utils';
import { isMasterNumber } from './tokens';

export interface DSNumberProps {
  value: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  useNumberColor?: boolean;
  isMaster?: boolean;
  className?: string;
  onClick?: () => void;
}

const sizeClasses = {
  sm: 'ds-number--sm',
  md: 'ds-number--md',
  lg: 'ds-number--lg',
  xl: 'ds-number--xl',
};

export const DSNumber = memo(({
  value,
  size = 'md',
  useNumberColor = false,
  isMaster,
  className,
  onClick,
}: DSNumberProps) => {
  const isActuallyMaster = isMaster ?? isMasterNumber(value);

  return (
    <div
      className={cn(
        'ds-number',
        sizeClasses[size],
        isActuallyMaster && 'ds-number--master',
        onClick && 'cursor-pointer',
        className
      )}
      data-number={useNumberColor ? value : undefined}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
    >
      {value}
    </div>
  );
});

DSNumber.displayName = 'DSNumber';

export default DSNumber;
