// Dashboard Skeleton Component
// Loading placeholder for dashboard

import { memo } from 'react';
import { cn } from '@/lib/utils';

export interface DashboardSkeletonProps {
  className?: string;
}

export const DashboardSkeleton = memo(({ className }: DashboardSkeletonProps) => {
  return (
    <div className={cn('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4', className)}>
      {/* Large card - Daily Energy */}
      <div className="bento-skeleton h-64 md:col-span-2 lg:row-span-2" />

      {/* Number cards */}
      <div className="bento-skeleton h-32" />
      <div className="bento-skeleton h-32" />

      {/* Insight card */}
      <div className="bento-skeleton h-24 md:col-span-2" />

      {/* Small cards */}
      <div className="bento-skeleton h-32" />
      <div className="bento-skeleton h-32" />

      {/* Lo Shu Grid */}
      <div className="bento-skeleton h-48 md:col-span-2" />

      {/* Cycle and Streak */}
      <div className="bento-skeleton h-40" />
      <div className="bento-skeleton h-40" />

      {/* Quick Actions */}
      <div className="bento-skeleton h-32 md:col-span-2" />

      {/* Calendar */}
      <div className="bento-skeleton h-48 md:col-span-2" />
    </div>
  );
});

DashboardSkeleton.displayName = 'DashboardSkeleton';

export default DashboardSkeleton;
