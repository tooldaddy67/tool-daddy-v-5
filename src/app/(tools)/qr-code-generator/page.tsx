import { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

import { constructMetadata } from '@/lib/seo';

export const metadata = constructMetadata({
  title: 'QR Code Generator | Tool Daddy',
  description: 'Create custom QR codes for URLs, text, and more instantly with our free online generator.',
  keywords: ['qr code generator', 'create qr code', 'free qr code', 'online qr code', 'marketing tools'],
  canonical: '/qr-code-generator',
});

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'QR Code Generator',
  operatingSystem: 'Windows, macOS, Linux, Android, iOS',
  applicationCategory: 'UtilitiesApplication',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
  },
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
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <QrCodeGenerator />
    </>
  );
}
