import { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

export const metadata: Metadata = {
  title: 'Video to Audio Converter | Tool Daddy',
  description: 'Extract high-quality audio from your video files instantly. Support for MP4 to MP3, MOV to AAC, and more.',
  keywords: ['video to audio', 'extract audio', 'mp4 to mp3', 'video converter', 'audio extractor'],
  openGraph: {
    title: 'Video to Audio Converter | Tool Daddy',
    description: 'Extract high-quality audio from your video files instantly.',
    type: 'website',
  }
};

const VideoToAudioConverter = dynamic(() => import('./_components/video-to-audio-converter'), {
  loading: () => <VideoToAudioConverterSkeleton />,
});

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
  return <VideoToAudioConverter />;
}
