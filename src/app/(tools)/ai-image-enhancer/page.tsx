
'use client';

import { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink, Sparkles, Upload, Info, Shield } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import FileDropzone from '@/components/file-dropzone';
import AdModal from '@/components/ad-modal';
import { useFirebase } from '@/firebase';
import { sendNotification } from '@/lib/send-notification';
import { useToast } from '@/hooks/use-toast';

const EXTERNAL_URL = 'https://imgupscaler.ai/';

export default function AiImageEnhancerPage() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isAdModalOpen, setIsAdModalOpen] = useState(false);
  const { firestore, user } = useFirebase();
  const { toast } = useToast();

  const handleFileDrop = useCallback((files: File[]) => {
    const file = files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid File Type',
        description: 'Please upload an image file.',
        variant: 'destructive',
      });
      return;
    }
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);
  }, [toast]);

  const handleEnhanceClick = () => {
    setIsAdModalOpen(true);
  };

  const handleAdFinish = () => {
    setIsAdModalOpen(false);
    sendNotification(firestore, user?.uid, {
      title: 'Image Enhancement Started',
      message: 'Redirecting you to the AI enhancer.',
      type: 'info',
      link: '/ai-image-enhancer'
    });
    window.open(EXTERNAL_URL, '_blank', 'noopener,noreferrer');
  };

  return (
    <>
      <div className="w-full max-w-4xl mx-auto p-4 md:p-8 space-y-6">
        <Card className="bg-card/50 backdrop-blur-lg border-border/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-purple-500" />
              AI Image Enhancer
            </CardTitle>
            <CardDescription>
              Upscale and enhance your images using AI. Upload an image or go directly to the enhancer.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* File Upload */}
            {!preview && (
              <FileDropzone onFileDrop={handleFileDrop} variant="pink" accept="image/*" />
            )}

            {/* Preview */}
            {preview && (
              <div className="space-y-4">
                <div className="relative rounded-lg overflow-hidden border bg-muted/30 flex justify-center p-4">
                  <img
                    src={preview}
                    alt="Preview"
                    className="max-h-64 object-contain rounded"
                  />
                </div>
                <div className="flex gap-3 justify-center">
                  <Button onClick={handleEnhanceClick} variant="pink">
                    <Sparkles className="mr-2 h-4 w-4" />
                    Enhance with AI
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => { setImageFile(null); setPreview(null); }}
                  >
                    Choose Different Image
                  </Button>
                </div>
              </div>
            )}

            {/* How it works */}
            <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
              <h3 className="font-semibold flex items-center gap-2">
                <Sparkles className="h-4 w-4" /> How It Works
              </h3>
              <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                <li>Upload your image above (optional — you can also upload directly on the enhancer)</li>
                <li>Click &quot;Enhance with AI&quot; to open the AI upscaler</li>
                <li>The AI will upscale your image up to 4x resolution</li>
                <li>Download the enhanced, high-resolution version</li>
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
                Open AI Enhancer Directly
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Info Alert */}
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertTitle>Privacy Notice</AlertTitle>
          <AlertDescription>
            This tool uses a trusted third-party AI service for image enhancement.
            Images are processed securely. We do not store any of your uploaded files.
          </AlertDescription>
        </Alert>
      </div>

      <AdModal
        isOpen={isAdModalOpen}
        onClose={() => setIsAdModalOpen(false)}
        onAdFinish={handleAdFinish}
        title="Preparing the AI enhancer..."
        duration={10}
      />
    </>
  );
}
