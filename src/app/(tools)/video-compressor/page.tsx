import { Metadata } from 'next';
import VideoCompressorClient from './_components/video-compressor-client';

const EXTERNAL_URL = 'https://www.freeconvert.com/video-compressor';

export const metadata: Metadata = {
  title: 'Video Compressor | Tool Daddy',
  description: 'Reduce video file sizes without losing quality. Support for MP4, MOV, AVI, and more with our professional compression tool.',
  keywords: ['video compressor', 'compress video', 'file size reducer', 'mp4 compressor', 'online video tool'],
  openGraph: {
    title: 'Video Compressor | Tool Daddy',
    description: 'Reduce video file sizes without losing quality instantly.',
    type: 'website',
  }
};

export default function VideoCompressorPage() {
  return <VideoCompressorClient externalUrl={EXTERNAL_URL} />;
}
