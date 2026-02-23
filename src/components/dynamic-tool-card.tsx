
'use client';

import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { useInView } from 'react-intersection-observer';
import { Skeleton } from '@/components/ui/skeleton';
import type { LucideIcon } from 'lucide-react';

const ToolCard = dynamic(() => import('@/components/tool-card'));

interface DynamicToolCardProps {
  href: string;
  name: string;
  description: string;
  icon: LucideIcon;
  isExternal?: boolean;
  variantIndex?: number;
  compact?: boolean;
  className?: string;
}

const CardSkeleton = () => (
  <div className="flex flex-col h-full rounded-lg border bg-card p-6 shadow-sm space-y-4">
    <div className="flex flex-row items-center gap-4">
      <Skeleton className="h-12 w-12 rounded-lg" />
      <Skeleton className="h-6 w-3/4" />
    </div>
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-2/3" />
  </div>
);


export default function DynamicToolCard(props: DynamicToolCardProps) {
  const { ref, inView } = useInView({
    triggerOnce: true,
    rootMargin: '200px 0px',
  });

  return (
    <div ref={ref} className="h-full">
      {inView ? (
        <Suspense fallback={<CardSkeleton />}>
          <ToolCard {...props} />
        </Suspense>
      ) : (
        <CardSkeleton />
      )}
    </div>
  );
}
