/**
 * DSInfoBox - Standardized info box component
 * Replaces color-coded information boxes pattern
 */

import { memo, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon, Info, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

export interface DSInfoBoxProps {
  children: ReactNode;
  variant?: 'primary' | 'success' | 'warning' | 'error' | 'info';
  title?: string;
  icon?: LucideIcon;
  className?: string;
}

const variantClasses = {
  primary: 'ds-info-box--primary',
  success: 'ds-info-box--success',
  warning: 'ds-info-box--warning',
  error: 'ds-info-box--error',
  info: 'ds-info-box--info',
};

const defaultIcons: Record<string, LucideIcon> = {
  primary: Info,
  success: CheckCircle,
  warning: AlertTriangle,
  error: XCircle,
  info: Info,
};

export const DSInfoBox = memo(({
  children,
  variant = 'primary',
  title,
  icon,
  className,
}: DSInfoBoxProps) => {
  const Icon = icon || defaultIcons[variant];

  return (
    <div className={cn('ds-info-box', variantClasses[variant], className)}>
      <Icon className="ds-info-box__icon" />
      <div className="ds-info-box__content">
        {title && <p className="ds-info-box__title">{title}</p>}
        <div className="ds-info-box__text">{children}</div>
      </div>
    </div>
  );
});

DSInfoBox.displayName = 'DSInfoBox';

export default DSInfoBox;
