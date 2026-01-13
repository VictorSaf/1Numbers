/**
 * DSExpandable - Standardized expandable section
 * Replaces 8+ different expandable patterns
 */

import { memo, useState, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown, LucideIcon } from 'lucide-react';

export interface DSExpandableProps {
  title: string;
  children: ReactNode;
  icon?: LucideIcon;
  iconColor?: string;
  defaultOpen?: boolean;
  className?: string;
  triggerClassName?: string;
  contentClassName?: string;
}

export const DSExpandable = memo(({
  title,
  children,
  icon: Icon,
  iconColor = 'text-primary',
  defaultOpen = false,
  className,
  triggerClassName,
  contentClassName,
}: DSExpandableProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={cn('ds-expandable', isOpen && 'ds-expandable--open', className)}>
      <button
        type="button"
        className={cn('ds-expandable__trigger', triggerClassName)}
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <div className="ds-expandable__trigger-content">
          {Icon && <Icon className={cn('w-4 h-4', iconColor)} />}
          <span className="font-medium text-sm">{title}</span>
        </div>
        <ChevronDown className="ds-expandable__chevron" />
      </button>
      <div className="ds-expandable__content">
        <div className={cn('ds-expandable__inner', contentClassName)}>
          {children}
        </div>
      </div>
    </div>
  );
});

DSExpandable.displayName = 'DSExpandable';

export default DSExpandable;
