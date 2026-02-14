import { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

export const metadata: Metadata = {
  title: 'Color Palette Extractor from Image | Tool Daddy',
  description: 'Extract beautiful color palettes from any image instantly. Upload an image and get a curated collection of its dominant colors.',
  keywords: ['color extractor', 'image to palette', 'extract colors', 'color palette from image', 'design tools'],
  openGraph: {
    title: 'Color Palette Extractor | Tool Daddy',
    description: 'Get the perfect color palette from any image you upload.',
    type: 'website',
  }
};

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
