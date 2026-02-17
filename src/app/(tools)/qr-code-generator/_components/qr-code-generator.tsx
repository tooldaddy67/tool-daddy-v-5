
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { QrCode, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { useHistory } from '@/hooks/use-history';
import { useFirebase } from '@/firebase';
import { sendNotification } from '@/lib/send-notification';
import { useToolAd } from '@/hooks/use-tool-ad';
import AdModal from '@/components/ad-modal';


export default function QrCodeGenerator() {
  const [text, setText] = useState('');
  const [qrCode, setQrCode] = useState('');
  const { toast } = useToast();
  const { addToHistory } = useHistory();
  const { user } = useFirebase();
  const { isAdOpen, setIsAdOpen, showAd, handleAdFinish, duration, title } = useToolAd('standard');

  const generateQrCode = () => {
    if (!text.trim()) {
      toast({
        title: 'Input Required',
        description: 'Please enter text or a URL to generate a QR code.',
        variant: 'destructive',
      });
      return;
    }

    showAd(performGenerate);
  };

  const performGenerate = () => {
    // Using a free API to generate QR codes
    const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=${encodeURIComponent(
      text
    )}`;
    setQrCode(qrApiUrl);

    addToHistory({
      tool: 'QR Code Generator',
      data: {
        qrCodeText: text,
        qrCodeImage: qrApiUrl,
      },
    });

    // Send notification
    sendNotification(null, user?.uid, {
      title: 'QR Code Generated',
      message: 'Your QR code has been successfully created.',
      type: 'success',
      link: '/qr-code-generator'
    });
  };

  const downloadQrCode = () => {
    if (!qrCode) return;
    const link = document.createElement('a');
    link.href = qrCode;
    link.download = 'qrcode.png';
    document.body.appendChild(link);
    // The API doesn't support direct download, so we fetch and create a blob URL
    fetch(qrCode)
      .then((response) => response.blob())
      .then((blob) => {
        const blobUrl = window.URL.createObjectURL(blob);
        link.href = blobUrl;
        link.click();
        window.URL.revokeObjectURL(blobUrl);
        document.body.removeChild(link);
      })
      .catch(() => {
        toast({
          title: 'Download Failed',
          description: 'Could not download the QR code.',
          variant: 'destructive',
        });
      });
  };

  return (
    <div className="w-full">
      <Card className="w-full bg-card/50 backdrop-blur-lg border-border/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="w-6 h-6" />
            QR Code Generator
          </CardTitle>
          <CardDescription>
            Create QR codes for URLs, text, Wi-Fi networks, and more.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="qr-text">Text or URL</Label>
            <div className="flex gap-2">
              <Input
                id="qr-text"
                value={text}
                maxLength={2048}
                onChange={(e) => setText(e.target.value)}
                placeholder="e.g., https://example.com"
                onKeyDown={(e) => { if (e.key === 'Enter') generateQrCode() }}
              />
              <Button onClick={generateQrCode} variant="green">
                <QrCode className="mr-2 h-4 w-4" /> Generate
              </Button>
            </div>
          </div>
          {qrCode && (
            <div className="flex flex-col items-center gap-4">
              <div className="p-4 bg-white rounded-lg border">
                <Image
                  src={qrCode}
                  alt="Generated QR Code"
                  width={256}
                  height={256}
                />
              </div>
              <Button onClick={downloadQrCode} variant="outline">
                <Download className="mr-2 h-4 w-4" /> Download
              </Button>
            </div>
          )}
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
