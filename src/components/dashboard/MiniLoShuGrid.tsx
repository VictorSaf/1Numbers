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

  // grid is a 3x3 matrix indexed [row][col]; indexing it by the digit 1-9 read
  // rows that mostly do not exist, so `count` was an array (or undefined) and the
  // comparisons below never matched. missingNumbers and repeatedNumbers say
  // directly what this needs.
  const countOf = (num: number): number => {
    if (loShuData.missingNumbers.includes(num)) return 0;
    return loShuData.repeatedNumbers.find((r) => r.number === num)?.count ?? 1;
  };

  const getCellClass = (num: number) => {
    const count = countOf(num);
    if (count === 0) return 'missing';
    if (count > 1) return 'repeated';
    return 'present';
  };

  const getCellTooltip = (num: number) => {
    const count = countOf(num);
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
