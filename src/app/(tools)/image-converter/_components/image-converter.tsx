
'use client';
import { useState, useCallback } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import FileDropzone from '@/components/file-dropzone';
import { useToast } from '@/hooks/use-toast';
import { Download, Loader2, Replace } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useHistory } from '@/hooks/use-history';
import { useFirebase } from '@/firebase';
import { sendNotification } from '@/lib/send-notification';

type Format = 'png' | 'jpeg' | 'webp';

export default function ImageConverter() {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [convertedImage, setConvertedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [targetFormat, setTargetFormat] = useState<Format>('png');
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const { toast } = useToast();
  const { addToHistory } = useHistory();
  const { user } = useFirebase();

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
      setOriginalImage(e.target?.result as string);
      setConvertedImage(null);
    };
    reader.readAsDataURL(file);
  }, [isLoading, toast]);

  const handleConvert = async () => {
    if (!originalImage || !originalFile) return;

    setIsLoading(true);
    setConvertedImage(null);

    try {
      const img = document.createElement('img');
      img.src = originalImage;
      await new Promise(resolve => { img.onload = resolve; });

      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0);

      const mimeType = `image/${targetFormat}`;
      const dataUrl = canvas.toDataURL(mimeType);
      setConvertedImage(dataUrl);

      addToHistory({
        tool: 'Image Converter',
        data: {
          originalImage,
          convertedImage: dataUrl,
          originalFormat: originalFile.type.split('/')[1],
          targetFormat: targetFormat,
        }
      })

      // Send notification
      sendNotification(null, user?.uid, {
        title: 'Image Converted',
        message: `Image successfully converted to ${targetFormat.toUpperCase()}`,
        type: 'success',
        link: '/image-converter'
      });

    } catch (error) {
      console.error('Error converting image:', error);
      toast({
        title: 'An Error Occurred',
        description: 'Failed to convert image.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const downloadImage = () => {
    if (!convertedImage) return;
    const link = document.createElement("a");
    link.href = convertedImage;
    link.download = `converted-image.${targetFormat}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleClear = () => {
    setOriginalImage(null);
    setConvertedImage(null);
    setOriginalFile(null);
  }

  return (
    <div className="w-full">
      <Card className="w-full bg-card/50 backdrop-blur-lg border-border/20">
        <CardHeader>
          <CardTitle>Image Converter</CardTitle>
          <CardDescription>
            Convert images to different formats like PNG, JPEG, or WEBP.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!originalImage && <FileDropzone onFileDrop={handleFileDrop} variant="yellow" />}

          {originalImage && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
              <div className="flex flex-col items-center gap-2">
                <h3 className="font-semibold">Original</h3>
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
                <h3 className="font-semibold">Converted</h3>
                <div className="relative w-full aspect-square rounded-lg overflow-hidden border bg-muted/30 flex items-center justify-center">
                  {isLoading && !convertedImage && (
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <Loader2 className="animate-spin h-8 w-8" />
                      <span>Converting...</span>
                    </div>
                  )}
                  {convertedImage && (
                    <Image
                      src={convertedImage}
                      alt="Converted"
                      fill
                      className="object-contain"
                    />
                  )}
                </div>
              </div>
            </div>
          )}

          {originalImage && (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <div className="space-y-2">
                <Label htmlFor="format-select">Convert to:</Label>
                <Select onValueChange={(value: Format) => setTargetFormat(value)} defaultValue={targetFormat}>
                  <SelectTrigger id="format-select" className="w-[180px]">
                    <SelectValue placeholder="Select a format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="png">PNG</SelectItem>
                    <SelectItem value="jpeg">JPEG</SelectItem>
                    <SelectItem value="webp">WEBP</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleConvert} disabled={isLoading} variant="yellow" className="self-end">
                <Replace className="mr-2 h-4 w-4" /> Convert
              </Button>
            </div>
          )}

          <div className="flex justify-center gap-4">
            {convertedImage && (
              <Button onClick={downloadImage} disabled={isLoading} variant="yellow">
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
            )}
            {originalImage && (
              <Button variant="outline" onClick={handleClear} disabled={isLoading}>
                Clear
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
