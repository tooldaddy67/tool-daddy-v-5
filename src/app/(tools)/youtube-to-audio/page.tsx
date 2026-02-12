import { Metadata } from 'next';
import YouTubeToAudioClient from './_components/youtube-to-audio-client';

const EXTERNAL_URL = 'https://www.clipto.com/media-downloader/free-youtube-to-mp3-converter-0416';

export const metadata: Metadata = {
  title: 'YouTube to Audio Converter | Tool Daddy',
  description: 'Convert YouTube videos to high-quality audio formats instantly with our professional conversion tool.',
  keywords: ['youtube to mp3', 'youtube to audio', 'convert youtube', 'audio downloader', 'mp3 downloader'],
  openGraph: {
    title: 'YouTube to Audio Converter | Tool Daddy',
    description: 'Convert YouTube videos to high-quality audio formats instantly.',
    type: 'website',
  }
};

export default function YouTubeToAudioPage() {
  return <YouTubeToAudioClient externalUrl={EXTERNAL_URL} />;
}
