// Mini Lo Shu Grid Component
// Compact version for dashboard display

import { memo, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { generateLoShuGrid } from '@/lib/loShuGrid';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

export interface MiniLoShuGridProps {
  birthDate: Date;
  showTooltips?: boolean;
}

const gridPositions = [
  [4, 9, 2],
  [3, 5, 7],
  [8, 1, 6],
];

export const MiniLoShuGrid = memo(({ birthDate, showTooltips = true }: MiniLoShuGridProps) => {
  const loShuData = useMemo(() => generateLoShuGrid(birthDate), [birthDate]);

  const getCellClass = (num: number) => {
    const count = loShuData.grid[num] || 0;
    if (count === 0) return 'missing';
    if (count > 1) return 'repeated';
    return 'present';
  };

  const getCellTooltip = (num: number) => {
    const count = loShuData.grid[num] || 0;
    if (count === 0) return `${num} is missing - consider remedies`;
    if (count > 1) return `${num} appears ${count} times - amplified energy`;
    return `${num} is present in your chart`;
  };

  return (
    <div className="mini-loshu">
      {gridPositions.map((row, rowIndex) =>
        row.map((num, colIndex) => {
          const cell = (
            <div
              key={`${rowIndex}-${colIndex}`}
              className={cn('mini-loshu-cell', getCellClass(num))}
            >
              {num}
            </div>
          );

          if (showTooltips) {
            return (
              <Tooltip key={`${rowIndex}-${colIndex}`}>
                <TooltipTrigger asChild>{cell}</TooltipTrigger>
                <TooltipContent side="top">
                  <p className="text-xs">{getCellTooltip(num)}</p>
                </TooltipContent>
              </Tooltip>
            );
          }

          return cell;
        })
      )}
    </div>
  );
});

MiniLoShuGrid.displayName = 'MiniLoShuGrid';

export default MiniLoShuGrid;
