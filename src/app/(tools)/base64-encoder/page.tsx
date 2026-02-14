import { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

export const metadata: Metadata = {
    title: 'Base64 Encoder & Decoder | Tool Daddy',
    description: 'Encode and decode standard text/files to and from Base64 format.',
    keywords: ['base64 encoder', 'base64 decoder', 'base64 image', 'file to base64', 'developer tools'],
    openGraph: {
        title: 'Base64 Encoder & Decoder | Tool Daddy',
        description: 'Encode and decode standard text/files to and from Base64 format.',
        type: 'website',
    }
};

const Base64EncoderClient = dynamic(() => import('./_components/base64-encoder-client'), {
    loading: () => (
        <div className="container mx-auto py-10 px-4 max-w-7xl space-y-8">
            <Skeleton className="h-40 w-full rounded-3xl" />
            <Skeleton className="h-[600px] w-full rounded-2xl" />
        </div>
    )
});

export default function Base64EncoderPage() {
    return <Base64EncoderClient />;
}
