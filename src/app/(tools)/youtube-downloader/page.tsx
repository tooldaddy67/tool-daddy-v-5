import { Metadata } from 'next';
import YouTubeDownloaderClient from './_components/youtube-downloader-client';

const EXTERNAL_URL = 'https://www.clipto.com/media-downloader/free-youtube-video-to-mp4-0607';

export const metadata: Metadata = {
  title: 'YouTube Video Downloader | Tool Daddy',
  description: 'Download YouTube videos in various formats and resolutions for offline viewing with our free online downloader.',
  keywords: ['youtube downloader', 'download youtube', 'youtube to mp4', 'video downloader', 'free video downloader'],
  openGraph: {
    title: 'YouTube Video Downloader | Tool Daddy',
    description: 'Download YouTube videos in various formats and resolutions instantly.',
    type: 'website',
  }
};

export default function YouTubeDownloaderPage() {
  return <YouTubeDownloaderClient externalUrl={EXTERNAL_URL} />;
}
