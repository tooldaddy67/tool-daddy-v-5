
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ExternalLink, Music, Headphones, Info, Shield } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import AdModal from '@/components/ad-modal';
import { useFirebase } from '@/firebase';
import { sendNotification } from '@/lib/send-notification';

const EXTERNAL_URL = 'https://www.clipto.com/media-downloader/free-youtube-to-mp3-converter-0416';

export default function YouTubeToAudioPage() {
  const [videoUrl, setVideoUrl] = useState('');
  const [isAdModalOpen, setIsAdModalOpen] = useState(false);
  const { firestore, user } = useFirebase();

  const handleConvertClick = () => {
    if (!videoUrl.trim()) return;
    setIsAdModalOpen(true);
  };

  const handleAdFinish = () => {
    setIsAdModalOpen(false);
    sendNotification(firestore, user?.uid, {
      title: 'YouTube to Audio Started',
      message: 'Redirecting you to the conversion service.',
      type: 'info',
      link: '/youtube-to-audio'
    });
    window.open(EXTERNAL_URL, '_blank', 'noopener,noreferrer');
  };

  return (
    <>
      <div className="w-full max-w-4xl mx-auto p-4 md:p-8 space-y-6">
        <Card className="bg-card/50 backdrop-blur-lg border-border/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Music className="h-6 w-6 text-green-500" />
              YouTube to Audio (MP3)
            </CardTitle>
            <CardDescription>
              Extract audio from YouTube videos and download as MP3. Paste a video URL below.
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
                  onClick={handleConvertClick}
                  disabled={!videoUrl.trim()}
                  variant="pink"
                  className="shrink-0"
                >
                  <Music className="mr-2 h-4 w-4" />
                  Convert
                </Button>
              </div>
            </div>

            {/* How it works */}
            <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
              <h3 className="font-semibold flex items-center gap-2">
                <Headphones className="h-4 w-4" /> How It Works
              </h3>
              <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                <li>Paste your YouTube video URL above</li>
                <li>Click &quot;Convert&quot; to open the conversion service</li>
                <li>The audio will be extracted automatically</li>
                <li>Download the MP3 file to your device</li>
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
                Open Conversion Service Directly
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Info Alert */}
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertTitle>Privacy Notice</AlertTitle>
          <AlertDescription>
            This tool uses a trusted third-party service for audio extraction.
            We do not store or track any URLs you enter. Please ensure you have
            permission to download any content.
          </AlertDescription>
        </Alert>
      </div>

      <AdModal
        isOpen={isAdModalOpen}
        onClose={() => setIsAdModalOpen(false)}
        onAdFinish={handleAdFinish}
        title="Preparing your conversion..."
        duration={10}
      />
    </>
  );
}
