import { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

export const metadata: Metadata = {
  title: 'Metadata Extractor | Tool Daddy',
  description: 'View hidden EXIF data, GPS coordinates, and camera information from your photos with our professional Metadata Extractor.',
  keywords: ['metadata extractor', 'exif viewer', 'view metadata', 'photo metadata', 'gps metadata'],
  openGraph: {
    title: 'Metadata Extractor | Tool Daddy',
    description: 'View hidden EXIF data and metadata from your photos.',
    type: 'website',
  }
};

const MetadataExtractor = dynamic(() => import('./_components/metadata-extractor'), {
  loading: () => <MetadataExtractorSkeleton />
});

function MetadataExtractorSkeleton() {
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

export default function MetadataExtractorPage() {
  return <MetadataExtractor />;
}
