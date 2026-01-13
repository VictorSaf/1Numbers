// Mini Calendar Component
// Compact calendar showing favorable days

import { memo, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { calculatePersonalDayNumber } from '@/lib/personalCycles';

export interface MiniCalendarProps {
  birthDate: Date;
  currentDate?: Date;
}

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export const MiniCalendar = memo(({ birthDate, currentDate = new Date() }: MiniCalendarProps) => {
  const calendarData = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const today = currentDate.getDate();

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days: Array<{
      day: number;
      personalDay: number;
      isToday: boolean;
      type: 'favorable' | 'challenging' | 'special' | 'normal';
    }> = [];

    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      const personalDay = calculatePersonalDayNumber(birthDate, date);

      let type: 'favorable' | 'challenging' | 'special' | 'normal' = 'normal';

      // Favorable days: 1, 3, 5, 9
      if ([1, 3, 5, 9].includes(personalDay)) {
        type = 'favorable';
      }
      // Challenging days: 4, 8
      else if ([4, 8].includes(personalDay)) {
        type = 'challenging';
      }
      // Special days: master numbers would show as 11, 22
      else if (personalDay === 7) {
        type = 'special'; // Spiritual/introspection day
      }

      days.push({
        day: i,
        personalDay,
        isToday: i === today,
        type,
      });
    }

    return {
      year,
      month,
      firstDay,
      days,
      monthName: new Date(year, month).toLocaleString('default', { month: 'long' }),
    };
  }, [birthDate, currentDate]);

  return (
    <div className="mini-calendar">
      <div className="mini-calendar-header">
        <span className="mini-calendar-month">
          {calendarData.monthName} {calendarData.year}
        </span>
      </div>

      <div className="mini-calendar-grid">
        {/* Weekday headers */}
        {WEEKDAYS.map((day, i) => (
          <div
            key={`header-${i}`}
            className="mini-calendar-day text-muted-foreground font-medium"
          >
            {day}
          </div>
        ))}

        {/* Empty cells for offset */}
        {Array.from({ length: calendarData.firstDay }).map((_, i) => (
          <div key={`empty-${i}`} className="mini-calendar-day" />
        ))}

        {/* Day cells */}
        {calendarData.days.map(({ day, isToday, type }) => (
          <div
            key={day}
            className={cn(
              'mini-calendar-day',
              isToday && 'today',
              !isToday && type
            )}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-3 text-[10px] text-muted-foreground">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-emerald-500/50" />
          <span>Favorable</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-amber-500/50" />
          <span>Challenging</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-primary/50" />
          <span>Special</span>
        </div>
      </div>
    </div>
  );
});

MiniCalendar.displayName = 'MiniCalendar';

export default MiniCalendar;
