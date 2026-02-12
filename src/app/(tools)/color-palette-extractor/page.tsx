
'use client';

import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

const ColorPaletteExtractor = dynamic(() => import('./_components/color-palette-extractor'), {
  loading: () => <ColorPaletteExtractorSkeleton />,
});


function ColorPaletteExtractorSkeleton() {
  return (
    <div className="w-full">
      <div className="w-full bg-card/50 backdrop-blur-lg border-border/20 rounded-lg p-6 space-y-6">
        <div className="flex items-center gap-2">
          <Skeleton className="h-6 w-6" />
          <Skeleton className="h-6 w-64" />
        </div>
        <Skeleton className="h-5 w-96" />
        <Skeleton className="h-48 w-full" />
      </div>
    </div>
  )
}

export default function ColorPaletteExtractorPage() {
  return <ColorPaletteExtractor />;
}
