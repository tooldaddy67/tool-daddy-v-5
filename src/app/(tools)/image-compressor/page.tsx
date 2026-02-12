
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

const ImageCompressor = dynamic(() => import('./_components/image-compressor'), {
  loading: () => <ImageCompressorSkeleton />
});


function ImageCompressorSkeleton() {
  return (
    <div className="w-full">
      <div className="w-full bg-card/50 backdrop-blur-lg border-border/20 rounded-lg p-6 space-y-6">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-5 w-80" />
        <Skeleton className="h-48 w-full" />
      </div>
    </div>
  )
}

import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Image Compressor | Tool Daddy',
  description: 'Compress your images effortlessly without losing quality. Support for JPEG, PNG, and WebP.',
  keywords: ['image compressor', 'compress images', 'jpeg compressor', 'png compressor', 'online image tool'],
  openGraph: {
    title: 'Image Compressor | Tool Daddy',
    description: 'Compress your images effortlessly without losing quality.',
    type: 'website',
  }
};

export default function ImageCompressorPage() {
  return <ImageCompressor />;
}
