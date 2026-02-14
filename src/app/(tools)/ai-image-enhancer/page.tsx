import { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

export const metadata: Metadata = {
  title: 'AI Image Enhancer | Tool Daddy',
  description: 'Enhance your images using powerful AI tools. Upscale, sharpen, and improve image quality instantly.',
  keywords: ['ai image enhancer', 'upscale image', 'improve image quality', 'sharpen image', 'ai photo editor'],
  openGraph: {
    title: 'AI Image Enhancer | Tool Daddy',
    description: 'Enhance your images with AI power.',
    type: 'website',
  }
};

const AiImageEnhancerClient = dynamic(() => import('./_components/ai-image-enhancer-client'), {
  loading: () => (
    <div className="w-full max-w-4xl mx-auto p-4 md:p-8">
      <Skeleton className="h-[400px] w-full rounded-2xl" />
    </div>
  )
});

export default function AiImageEnhancerPage() {
  return <AiImageEnhancerClient />;
}
