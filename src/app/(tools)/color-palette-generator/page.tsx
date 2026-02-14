import { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

export const metadata: Metadata = {
  title: 'AI Color Palette Generator | Tool Daddy',
  description: 'Generate beautiful, harmonious color palettes instantly. Explore trending color schemes and find the perfect inspiration for your next design project.',
  keywords: ['color palette generator', 'color schemes', 'trending colors', 'design inspiration', 'color palette creator'],
  openGraph: {
    title: 'AI Color Palette Generator | Tool Daddy',
    description: 'Find the perfect colors for your next project.',
    type: 'website',
  }
};

const ColorPaletteGenerator = dynamic(() => import('./_components/color-palette-generator'), {
  loading: () => <ColorPaletteGeneratorSkeleton />,
});

function PaletteCardSkeleton() {
  return (
    <div className="break-inside-avoid mb-6">
      <Skeleton className="h-48 w-full rounded-lg" />
      <div className="mt-2 flex items-center justify-between px-1">
        <Skeleton className="h-6 w-16" />
        <Skeleton className="h-4 w-24" />
      </div>
    </div>
  );
}

function ColorPaletteGeneratorSkeleton() {
  return (
    <div className="w-full">
      <div className="w-full bg-card/50 backdrop-blur-lg border-border/20 rounded-lg p-6 mb-6">
        <div className="flex flex-row items-center justify-between">
          <div>
            <Skeleton className="h-8 w-80" />
            <Skeleton className="h-5 w-96 mt-2" />
          </div>
          <Skeleton className="h-10 w-28" />
        </div>
      </div>
      <div className="columns-1 gap-6 sm:columns-2 md:columns-3 lg:columns-4">
        {[...Array(12)].map((_, i) => (
          <PaletteCardSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}

export default function ColorPaletteGeneratorPage() {
  return <ColorPaletteGenerator />;
}
