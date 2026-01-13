// Number Spotlight Component
// Large display for main numerology numbers

import { memo } from 'react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

export interface NumberSpotlightProps {
  value: number;
  label: string;
  theme?: string;
  description?: string;
  isMaster?: boolean;
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

const sizeClasses = {
  sm: {
    value: 'text-3xl',
    label: 'text-xs',
    theme: 'text-[10px] px-2 py-0.5',
  },
  md: {
    value: 'text-4xl md:text-5xl',
    label: 'text-sm',
    theme: 'text-xs px-3 py-1',
  },
  lg: {
    value: 'text-5xl md:text-6xl',
    label: 'text-base',
    theme: 'text-sm px-4 py-1.5',
  },
};

export const NumberSpotlight = memo(({
  value,
  label,
  theme,
  description,
  isMaster = false,
  size = 'md',
  onClick,
}: NumberSpotlightProps) => {
  const s = sizeClasses[size];

  const content = (
    <div
      className={cn(
        'number-spotlight',
        onClick && 'cursor-pointer hover:scale-105 transition-transform'
      )}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <span
        className={cn(
          'number-spotlight-value',
          s.value,
          isMaster && 'master'
        )}
      >
        {value}
      </span>
      <span className={cn('number-spotlight-label', s.label)}>{label}</span>
      {theme && (
        <span className={cn('number-spotlight-theme', s.theme)}>{theme}</span>
      )}
    </div>
  );

  if (description) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{content}</TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-xs">
          <p className="text-sm">{description}</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  return content;
});

NumberSpotlight.displayName = 'NumberSpotlight';

export default NumberSpotlight;
