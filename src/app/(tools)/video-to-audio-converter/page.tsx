import { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

import { constructMetadata } from '@/lib/seo';

export const metadata = constructMetadata({
  title: 'Video to Audio Converter | Tool Daddy',
  description: 'Extract high-quality audio from your video files instantly. Support for MP4 to MP3, MOV to AAC, and more.',
  keywords: ['video to audio', 'extract audio', 'mp4 to mp3', 'video converter', 'audio extractor'],
  canonical: '/video-to-audio-converter',
});

const VideoToAudioConverter = dynamic(() => import('./_components/video-to-audio-converter'), {
  loading: () => <VideoToAudioConverterSkeleton />,
});

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Video to Audio Converter',
  operatingSystem: 'Windows, macOS, Linux, Android, iOS',
  applicationCategory: 'MultimediaApplication',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
  },
};

function VideoToAudioConverterSkeleton() {
  return (
    <div className="w-full">
      <div className="w-full bg-card/50 backdrop-blur-lg border-border/20 rounded-lg p-6 space-y-6">
        <Skeleton className="h-8 w-80" />
        <Skeleton className="h-5 w-96" />
        <Skeleton className="h-48 w-full" />
      </div>
    </div>
  )
}

export default function VideoToAudioConverterPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <VideoToAudioConverter />
    </>
  );
}
