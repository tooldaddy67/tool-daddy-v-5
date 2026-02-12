import { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

export const metadata: Metadata = {
  title: 'Image Converter | Tool Daddy',
  description: 'Convert images between multiple formats including JPEG, PNG, WebP, and SVG with our fast online converter.',
  keywords: ['image converter', 'convert images', 'png to jpg', 'jpg to webp', 'online image tool'],
  openGraph: {
    title: 'Image Converter | Tool Daddy',
    description: 'Convert images between multiple formats instantly.',
    type: 'website',
  }
};

const ImageConverter = dynamic(() => import('./_components/image-converter'), {
  loading: () => <ImageConverterSkeleton />
});

function ImageConverterSkeleton() {
  return (
    <div className="w-full">
      <div className="w-full bg-card/50 backdrop-blur-lg border-border/20 rounded-lg p-6 space-y-6">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-5 w-96" />
        <Skeleton className="h-48 w-full" />
      </div>
    </div>
  )
}

export default function ImageConverterPage() {
  return <ImageConverter />;
}
