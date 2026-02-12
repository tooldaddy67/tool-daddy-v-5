
'use client';

import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

const DrawingCanvas = dynamic(() => import('./_components/drawing-canvas'), {
  loading: () => <DrawingCanvasSkeleton />
});

function DrawingCanvasSkeleton() {
  return (
    <div className="w-full h-full flex flex-col p-4 md:p-6">
      <div className="w-full h-full flex flex-col bg-card/50 backdrop-blur-lg border-border/20 rounded-lg">
        <div className="p-6">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96 mt-2" />
        </div>
        <div className="p-6 pt-0 flex flex-col gap-4 flex-grow">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="flex-grow w-full" />
        </div>
        <div className="p-6 pt-0 justify-end flex-shrink-0">
          <Skeleton className="h-10 w-10" />
        </div>
      </div>
    </div>
  )
}


export default function DrawingCanvasPage() {
  return <DrawingCanvas />;
}
