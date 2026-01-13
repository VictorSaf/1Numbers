// Insight Card Component
// The Pattern-style thematic insight cards

import { memo, useState } from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown, ChevronUp } from 'lucide-react';

export interface InsightCardProps {
  theme: string;
  message: string;
  detail?: string;
  expandedContent?: string;
  variant?: 'default' | 'positive' | 'caution' | 'special';
}

const variantStyles = {
  default: {
    theme: 'text-primary',
    bg: '',
  },
  positive: {
    theme: 'text-emerald-500',
    bg: 'bg-emerald-500/5',
  },
  caution: {
    theme: 'text-amber-500',
    bg: 'bg-amber-500/5',
  },
  special: {
    theme: 'text-purple-500',
    bg: 'bg-purple-500/5',
  },
};

export const InsightCard = memo(({
  theme,
  message,
  detail,
  expandedContent,
  variant = 'default',
}: InsightCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const styles = variantStyles[variant];

  return (
    <div className={cn('insight-card', styles.bg, 'rounded-xl p-1')}>
      <span className={cn('insight-card-theme', styles.theme)}>{theme}</span>
      <p className="insight-card-message">{message}</p>
      {detail && (
        <p className={cn('insight-card-detail', isExpanded && 'line-clamp-none')}>
          {detail}
        </p>
      )}
      {expandedContent && (
        <>
          {isExpanded && (
            <p className="text-sm text-muted-foreground mt-3 animate-fade-in">
              {expandedContent}
            </p>
          )}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="insight-card-expand flex items-center gap-1"
          >
            {isExpanded ? (
              <>
                Show less <ChevronUp className="h-3 w-3" />
              </>
            ) : (
              <>
                Read more <ChevronDown className="h-3 w-3" />
              </>
            )}
          </button>
        </>
      )}
    </div>
  );
});

InsightCard.displayName = 'InsightCard';

export default InsightCard;
