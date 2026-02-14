import { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

export const metadata: Metadata = {
  title: 'Online Timer & Stopwatch | Tool Daddy',
  description: 'A clean, minimalist online timer and stopwatch for tracking your time, workouts, and tasks. Simple to use with precise time tracking.',
  keywords: ['online timer', 'stopwatch online', 'countdown timer', 'time tracker', 'productivity tools'],
  openGraph: {
    title: 'Online Timer & Stopwatch | Tool Daddy',
    description: 'Track your time accurately with our minimalist timer and stopwatch.',
    type: 'website',
  }
};

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
