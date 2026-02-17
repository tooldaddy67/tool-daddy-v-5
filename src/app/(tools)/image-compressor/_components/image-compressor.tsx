
'use client';
import { useState, useCallback } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import FileDropzone from '@/components/file-dropzone';
import { useToast } from '@/hooks/use-toast';
import { Download, Loader2, Minimize } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { formatBytes } from '@/lib/utils';
import { useHistory } from '@/hooks/use-history';
import { useFirebase } from '@/firebase';
import { sendNotification } from '@/lib/send-notification';
import { useToolAd } from '@/hooks/use-tool-ad';
import AdModal from '@/components/ad-modal';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function ImageCompressor() {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [originalSize, setOriginalSize] = useState<number>(0);
  const [compressedImage, setCompressedImage] = useState<string | null>(null);
  const [compressedSize, setCompressedSize] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [quality, setQuality] = useState(80);
  const [outputFormat, setOutputFormat] = useState<string>('original');
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const { toast } = useToast();
  const { addToHistory } = useHistory();
  const { user } = useFirebase();

  const { isAdOpen, setIsAdOpen, showAd, handleAdFinish, duration, title } = useToolAd('standard');

  const handleFileDrop = useCallback((files: File[]) => {
    const file = files[0];
    if (!file) return;

    if (isLoading) return;
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid File Type',
        description: 'Please upload an image file.',
        variant: 'destructive',
      });
      return;
    }
    setOriginalFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setOriginalImage(result);
      setOriginalSize(file.size);
      setCompressedImage(null);
      setCompressedSize(0);
      showAd(() => handleCompress(result, quality, file.type, outputFormat));
    };
    reader.readAsDataURL(file);
  }, [isLoading, quality, toast, outputFormat, showAd]);

  const handleCompress = async (image: string, qualityValue: number, originalMimeType: string, format: string) => {
    if (!image) return;

    setIsLoading(true);
    setCompressedImage(null);

    const targetMimeType = format === 'original' ? originalMimeType : format;

    try {
      const img = document.createElement('img');
      img.src = image;
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Could not get canvas context');

      // Fill transparent background with white if converting to JPEG (which doesn't support transparency)
      if (targetMimeType === 'image/jpeg') {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      ctx.drawImage(img, 0, 0);

      const compressedDataUrl = canvas.toDataURL(targetMimeType, qualityValue / 100);

      // Calculate size roughly from base64 string length (approximate) or fetch blob
      // Fetching blob is more accurate
      const res = await fetch(compressedDataUrl);
      const blob = await res.blob();
      const newSize = blob.size;

      // Check if size increased
      if (newSize >= originalSize && qualityValue > 50 && format === 'original') {
        toast({
          title: 'Already Optimized',
          description: 'The compressed version was larger than the original. Using original quality.',
        });
        setCompressedImage(image);
        setCompressedSize(originalSize);
        return;
      }

      setCompressedSize(newSize);
      setCompressedImage(compressedDataUrl);

      addToHistory({
        tool: 'Image Compressor',
        data: {
          compressedImage: compressedDataUrl,
          originalSize: originalSize || (await fetch(image).then(r => r.blob()).then(b => b.size)),
          compressedSize: newSize,
          fileType: targetMimeType,
        }
      })

      // Send notification
      // Only send if substantial reduction? Or always?
      if (newSize < originalSize) {
        sendNotification(null, user?.uid, {
          title: 'Image Compressed',
          message: `Image compressed from ${formatBytes(originalSize)} to ${formatBytes(newSize)}`,
          type: 'success',
          link: '/image-compressor'
        });
      }

    } catch (error) {
      console.error('Error compressing image:', error);
      toast({
        title: 'An Error Occurred',
        description: 'Failed to compress image.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleQualityChange = (value: number[]) => {
    setQuality(value[0]);
    if (originalImage && originalFile) {
      showAd(() => handleCompress(originalImage, value[0], originalFile.type, outputFormat));
    }
  }

  const handleFormatChange = (value: string) => {
    setOutputFormat(value);
    if (originalImage && originalFile) {
      showAd(() => handleCompress(originalImage, quality, originalFile.type, value));
    }
  };

  const downloadImage = () => {
    if (!compressedImage) return;

    // Determine extension
    let toggleMime = outputFormat === 'original' && originalFile ? originalFile.type : outputFormat;
    // Fallback if outputFormat is original but file is missing (unlikely)
    if (outputFormat === 'original' && !originalFile && compressedImage.startsWith('data:')) {
      toggleMime = compressedImage.split(';')[0].split(':')[1];
    }

    let ext = 'jpg';
    if (toggleMime === 'image/png') ext = 'png';
    if (toggleMime === 'image/webp') ext = 'webp';
    if (toggleMime === 'image/jpeg') ext = 'jpg';

    const link = document.createElement("a");
    link.href = compressedImage;
    link.download = `compressed-image.${ext}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  return (
    <div className="w-full">
      <Card className="w-full bg-card/50 backdrop-blur-lg border-border/20">
        <CardHeader>
          <CardTitle>Image Compressor</CardTitle>
          <CardDescription>
            Reduce image file size while maintaining quality.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!originalImage && <FileDropzone onFileDrop={handleFileDrop} variant="green" />}

          {originalImage && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center relative">
              <div className="flex flex-col items-center gap-2">
                <h3 className="font-semibold">Original ({formatBytes(originalSize)})</h3>
                <div className="relative w-full aspect-square rounded-lg overflow-hidden border">
                  <Image
                    src={originalImage}
                    alt="Original"
                    fill
                    className="object-contain"
                  />
                </div>
              </div>

              <div className="flex flex-col items-center gap-2">
                <h3 className="font-semibold">Compressed ({formatBytes(compressedSize)})</h3>
                <div className="relative w-full aspect-square rounded-lg overflow-hidden border bg-muted/30 flex items-center justify-center">
                  {isLoading && (
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <Loader2 className="animate-spin h-8 w-8" />
                      <span>Compressing...</span>
                    </div>
                  )}
                  {compressedImage && (
                    <Image
                      src={compressedImage}
                      alt="Compressed"
                      fill
                      className="object-contain"
                    />
                  )}
                </div>
              </div>
            </div>
          )}
          {originalImage && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Output Format</Label>
                  <Select value={outputFormat} onValueChange={handleFormatChange} disabled={isLoading}>
                    <SelectTrigger>
                      <SelectValue placeholder="Format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="original">Original ({originalFile?.type.split('/')[1].toUpperCase()})</SelectItem>
                      <SelectItem value="image/jpeg">JPEG (Smaller)</SelectItem>
                      <SelectItem value="image/png">PNG (Lossless)</SelectItem>
                      <SelectItem value="image/webp">WebP (Best)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="quality">Quality: {quality}</Label>
                    <span className="text-sm text-muted-foreground">~{formatBytes(compressedSize)}</span>
                  </div>
                  <Slider
                    id="quality"
                    min={0}
                    max={100}
                    step={5}
                    value={[quality]}
                    onValueChange={handleQualityChange}
                    disabled={isLoading}
                    variant="green"
                  />
                </div>
              </div>
            </div>
          )}
          <div className="flex justify-center gap-4">
            {compressedImage && (
              <Button onClick={downloadImage} disabled={isLoading} variant="green">
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
      <AdModal
        isOpen={isAdOpen}
        onClose={() => setIsAdOpen(false)}
        onAdFinish={handleAdFinish}
        title={title}
        duration={duration}
      />
    </div>
  );
}
