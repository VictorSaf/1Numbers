/**
 * DSSectionHeader - Standardized section header with icon
 * Replaces repeated icon + label patterns
 */

import { memo } from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

export interface DSSectionHeaderProps {
  title: string;
  icon?: LucideIcon;
  iconColor?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: '',
  md: '',
  lg: 'ds-section-header--lg',
};

export const DSSectionHeader = memo(({
  title,
  icon: Icon,
  iconColor = 'text-primary',
  size = 'md',
  className,
}: DSSectionHeaderProps) => {
  return (
    <div className={cn('ds-section-header', sizeClasses[size], className)}>
      {Icon && <Icon className={cn('ds-section-header__icon', iconColor)} />}
      <h4 className="ds-section-header__title">{title}</h4>
    </div>
  );
});

DSSectionHeader.displayName = 'DSSectionHeader';

export default DSSectionHeader;
