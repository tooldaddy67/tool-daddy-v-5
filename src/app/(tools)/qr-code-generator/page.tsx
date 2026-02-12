import { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

export const metadata: Metadata = {
  title: 'QR Code Generator | Tool Daddy',
  description: 'Create custom QR codes for URLs, text, and more instantly with our free online generator.',
  keywords: ['qr code generator', 'create qr code', 'free qr code', 'online qr code', 'marketing tools'],
  openGraph: {
    title: 'QR Code Generator | Tool Daddy',
    description: 'Create custom QR codes instantly with our free online generator.',
    type: 'website',
  }
};

const QrCodeGenerator = dynamic(() => import('./_components/qr-code-generator'), {
  loading: () => <QrCodeGeneratorSkeleton />
});

function QrCodeGeneratorSkeleton() {
  return (
    <div className="w-full">
      <div className="w-full bg-card/50 backdrop-blur-lg border-border/20 rounded-lg p-6 space-y-6">
        <div className="flex items-center gap-2">
          <Skeleton className="h-6 w-6" />
          <Skeleton className="h-6 w-64" />
        </div>
        <Skeleton className="h-5 w-96" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <div className="flex gap-2">
            <Skeleton className="h-10 flex-grow" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default function QrCodeGeneratorPage() {
  return <QrCodeGenerator />;
}
