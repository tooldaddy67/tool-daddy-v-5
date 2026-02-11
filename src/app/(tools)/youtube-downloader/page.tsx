
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ExternalLink, Download, Play, Info, Shield } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import AdModal from '@/components/ad-modal';
import { useFirebase } from '@/firebase';
import { sendNotification } from '@/lib/send-notification';

const EXTERNAL_URL = 'https://www.clipto.com/media-downloader/free-youtube-video-to-mp4-0607';

export default function YouTubeDownloaderPage() {
  const [videoUrl, setVideoUrl] = useState('');
  const [isAdModalOpen, setIsAdModalOpen] = useState(false);
  const { firestore, user } = useFirebase();

  const handleDownloadClick = () => {
    if (!videoUrl.trim()) return;
    setIsAdModalOpen(true);
  };

  const handleAdFinish = () => {
    setIsAdModalOpen(false);
    sendNotification(firestore, user?.uid, {
      title: 'YouTube Download Started',
      message: 'Redirecting you to the download service.',
      type: 'info',
      link: '/youtube-downloader'
    });
    window.open(EXTERNAL_URL, '_blank', 'noopener,noreferrer');
  };

  return (
    <>
      <div className="w-full max-w-4xl mx-auto p-4 md:p-8 space-y-6">
        <Card className="bg-card/50 backdrop-blur-lg border-border/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-6 w-6 text-red-500" />
              YouTube Video Downloader
            </CardTitle>
            <CardDescription>
              Download YouTube videos in MP4 format. Paste a video URL below to get started.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* URL Input */}
            <div className="space-y-3">
              <label htmlFor="youtube-url" className="text-sm font-medium">
                YouTube Video URL
              </label>
              <div className="flex gap-3">
                <Input
                  id="youtube-url"
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  className="flex-1"
                />
                <Button
                  onClick={handleDownloadClick}
                  disabled={!videoUrl.trim()}
                  variant="pink"
                  className="shrink-0"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
              </div>
            </div>

            {/* How it works */}
            <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
              <h3 className="font-semibold flex items-center gap-2">
                <Play className="h-4 w-4" /> How It Works
              </h3>
              <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                <li>Paste your YouTube video URL above</li>
                <li>Click &quot;Download&quot; to open the download service</li>
                <li>Choose your preferred video quality (1080p, 720p, 480p, etc.)</li>
                <li>Click the download button to save the video</li>
              </ol>
            </div>

            {/* Direct Link */}
            <div className="flex justify-center pt-2">
              <Button
                variant="outline"
                onClick={() => window.open(EXTERNAL_URL, '_blank', 'noopener,noreferrer')}
                className="gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                Open Download Service Directly
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Info Alert */}
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertTitle>Privacy Notice</AlertTitle>
          <AlertDescription>
            This tool uses a trusted third-party service for video downloads.
            We do not store or track any URLs you enter. Please ensure you have
            permission to download any content.
          </AlertDescription>
        </Alert>
      </div>

      <AdModal
        isOpen={isAdModalOpen}
        onClose={() => setIsAdModalOpen(false)}
        onAdFinish={handleAdFinish}
        title="Preparing your download..."
        duration={10}
      />
    </>
  );
}
