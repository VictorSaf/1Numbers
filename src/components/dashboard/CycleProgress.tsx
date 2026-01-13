// Cycle Progress Component
// Circular progress for personal year cycle

import { memo, useMemo } from 'react';
import { cn } from '@/lib/utils';

export interface CycleProgressProps {
  currentValue: number;
  maxValue?: number;
  label: string;
  sublabel?: string;
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'secondary' | 'accent';
}

const sizeConfig = {
  sm: { size: 80, strokeWidth: 6, fontSize: 'text-xl' },
  md: { size: 120, strokeWidth: 8, fontSize: 'text-2xl' },
  lg: { size: 160, strokeWidth: 10, fontSize: 'text-3xl' },
};

const colorConfig = {
  primary: 'stroke-primary',
  secondary: 'stroke-secondary',
  accent: 'stroke-accent',
};

export const CycleProgress = memo(({
  currentValue,
  maxValue = 9,
  label,
  sublabel,
  size = 'md',
  color = 'primary',
}: CycleProgressProps) => {
  const config = sizeConfig[size];
  const radius = (config.size - config.strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const progress = useMemo(() => {
    const percentage = (currentValue / maxValue) * 100;
    const offset = circumference - (percentage / 100) * circumference;
    return { percentage, offset };
  }, [currentValue, maxValue, circumference]);

  return (
    <div className="cycle-progress">
      <svg
        className="cycle-progress-ring"
        width={config.size}
        height={config.size}
      >
        {/* Background circle */}
        <circle
          className="cycle-progress-bg"
          cx={config.size / 2}
          cy={config.size / 2}
          r={radius}
          strokeWidth={config.strokeWidth}
        />
        {/* Progress circle */}
        <circle
          className={cn('cycle-progress-value', colorConfig[color])}
          cx={config.size / 2}
          cy={config.size / 2}
          r={radius}
          strokeWidth={config.strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={progress.offset}
        />
      </svg>
      <div className="cycle-progress-center">
        <span className={cn('cycle-progress-number', config.fontSize)}>
          {currentValue}
        </span>
        <span className="cycle-progress-label">{label}</span>
        {sublabel && (
          <span className="text-[10px] text-muted-foreground mt-0.5">
            {sublabel}
          </span>
        )}
      </div>
    </div>
  );
});

CycleProgress.displayName = 'CycleProgress';

export default CycleProgress;
