import { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

export const metadata: Metadata = {
    title: 'URL Encoder & Decoder | Tool Daddy',
    description: 'Encode and decode URLs to handle special characters safely.',
    keywords: ['url encoder', 'url decoder', 'percent encoding', 'developer tools'],
    openGraph: {
        title: 'URL Encoder & Decoder | Tool Daddy',
        description: 'Encode and decode URLs to handle special characters safely.',
        type: 'website',
    }
};

const UrlEncoderClient = dynamic(() => import('./_components/url-encoder-client'), {
    loading: () => (
        <div className="container mx-auto py-10 px-4 max-w-7xl space-y-8">
            <Skeleton className="h-40 w-full rounded-3xl" />
            <Skeleton className="h-[600px] w-full rounded-2xl" />
        </div>
    )
});

export default function UrlEncoderPage() {
    return <UrlEncoderClient />;
}
