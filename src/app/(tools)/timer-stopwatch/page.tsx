'use client';

import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

const TimerStopwatch = dynamic(() => import('./_components/timer-stopwatch'), {
  loading: () => <TimerStopwatchSkeleton />
});

function TimerStopwatchSkeleton() {
  return (
    <div className="w-full max-w-lg mx-auto">
      <Skeleton className="h-[550px] rounded-2xl" />
    </div>
  )
}

export default function TimerStopwatchPage() {
  return (
    <div className="w-full h-full flex items-center justify-center p-4">
      <main className="w-full flex justify-center">
        <div className="w-full max-w-lg">
          <TimerStopwatch />
        </div>
      </main>
    </div>
  );
}
