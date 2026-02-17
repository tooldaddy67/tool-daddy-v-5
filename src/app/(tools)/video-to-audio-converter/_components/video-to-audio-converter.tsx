
'use client';
import { useState, useCallback, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import FileDropzone from '@/components/file-dropzone';
import { useToast } from '@/hooks/use-toast';
import { Download, Loader2, Music, Info } from 'lucide-react';
import { useHistory } from '@/hooks/use-history';
import { formatBytes } from '@/lib/utils';
import AdModal from '@/components/ad-modal';
import { useFirebase } from '@/firebase';
import { sendNotification } from '@/lib/send-notification';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

export default function VideoToAudioConverter() {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [audioSrc, setAudioSrc] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const { addToHistory } = useHistory();
  const { user } = useFirebase();
  const [isAdModalOpen, setIsAdModalOpen] = useState(false);
  const [progress, setProgress] = useState(0);

  const ffmpegRef = useRef(new FFmpeg());

  useEffect(() => {
    const loadFfmpeg = async () => {
      const ffmpeg = ffmpegRef.current;
      try {
        await ffmpeg.load();
        ffmpeg.on('progress', ({ progress, time }) => {
          setProgress(progress * 100);
        });
      } catch (error) {
        console.error('Failed to load ffmpeg', error);
        toast({
          title: 'Initialization Error',
          description: 'Could not load the audio processing library. Please refresh the page.',
          variant: 'destructive'
        });
      }
    };
    loadFfmpeg();
  }, [toast]);

  const handleFileDrop = useCallback((files: File[]) => {
    const file = files[0];
    if (!file) return;

    if (isLoading) return;
    if (!file.type.startsWith('video/')) {
      toast({
        title: 'Invalid File Type',
        description: 'Please upload a video file.',
        variant: 'destructive',
      });
      return;
    }
    setVideoFile(file);
    setAudioSrc(null);
    setProgress(0);
  }, [isLoading, toast]);

  const handleConvertClick = () => {
    if (!videoFile) return;
    setIsAdModalOpen(true);
  }

  const handleError = (error: any) => {
    console.error('Error during conversion process:', error);
    let description = 'Failed to convert video to audio. The format might not be supported or it may not contain an audio track.';
    toast({
      title: 'An Error Occurred',
      description,
      variant: 'destructive',
    });
  }

  const performConvert = async () => {
    if (!videoFile) return;

    setIsLoading(true);
    setAudioSrc(null);
    setProgress(0);

    try {
      toast({
        title: 'Conversion Started',
        description: 'Your video is being converted. This may take a moment...',
      });

      const ffmpeg = ffmpegRef.current;
      await ffmpeg.writeFile(videoFile.name, await fetchFile(videoFile));

      await ffmpeg.exec(['-i', videoFile.name, '-q:a', '0', '-map', 'a', 'output.mp3']);

      const data = await ffmpeg.readFile('output.mp3');
      const audioBlob = new Blob([data as any], { type: 'audio/mp3' });
      const audioUrl = URL.createObjectURL(audioBlob);

      setAudioSrc(audioUrl);

      addToHistory({
        tool: 'Video to Audio Converter',
        data: {
          videoFileName: videoFile.name,
          videoFileSize: videoFile.size,
        },
      });

      // Send notification
      sendNotification(null, user?.uid, {
        title: 'Audio Extracted',
        message: `Successfully extracted audio from ${videoFile.name}`,
        type: 'success',
        link: '/video-to-audio-converter'
      });

      toast({
        title: 'Conversion Successful',
        description: 'Audio has been extracted from the video.',
      });

    } catch (error) {
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdFinish = async () => {
    setIsAdModalOpen(false);
    await performConvert();
  };

  const downloadAudio = () => {
    if (!audioSrc || !videoFile) return;
    const link = document.createElement("a");
    link.href = audioSrc;
    const name = videoFile.name.substring(0, videoFile.name.lastIndexOf('.')) || videoFile.name;
    link.download = `${name}.mp3`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleClear = () => {
    setVideoFile(null);
    if (audioSrc) {
      URL.revokeObjectURL(audioSrc);
    }
    setAudioSrc(null);
    setProgress(0);
  }

  return (
    <>
      <div className="w-full">
        <Card className="w-full bg-card/50 backdrop-blur-lg border-border/20">
          <CardHeader>
            <CardTitle>Video to Audio Converter</CardTitle>
            <CardDescription>
              Extract audio from your video files and save as MP3.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {!videoFile && <FileDropzone onFileDrop={handleFileDrop} variant="pink" accept="video/*" />}

            {videoFile && (
              <div className="p-4 border rounded-lg text-center space-y-4">
                <p>Ready to convert: <strong>{videoFile.name}</strong> ({formatBytes(videoFile.size)})</p>
                {!audioSrc && !isLoading && (
                  <Button onClick={handleConvertClick} disabled={isLoading} variant="pink">
                    <Music className="mr-2 h-4 w-4" />
                    Convert to MP3
                  </Button>
                )}
              </div>
            )}

            {isLoading && !audioSrc && (
              <div className="space-y-4">
                <Progress value={progress} className="w-full" />
                <div className="text-center text-sm text-muted-foreground">{Math.round(progress)}% Complete</div>
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertTitle>Heads up!</AlertTitle>
                  <AlertDescription>
                    Audio extraction happens right in your browser. It can be slow for large files. Please be patient.
                  </AlertDescription>
                </Alert>
              </div>
            )}

            {audioSrc && (
              <div className="flex flex-col items-center gap-4">
                <audio controls src={audioSrc} className="w-full">
                  Your browser does not support the audio element.
                </audio>
                <div className="flex gap-4">
                  <Button onClick={downloadAudio} variant="pink">
                    <Download className="mr-2 h-4 w-4" /> Download MP3
                  </Button>
                  <Button variant="outline" onClick={handleClear} disabled={isLoading}>
                    Convert Another
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      <AdModal
        isOpen={isAdModalOpen}
        onClose={() => setIsAdModalOpen(false)}
        onAdFinish={handleAdFinish}
        title="Converting your video..."
        duration={10}
      />
    </>
  );
}
