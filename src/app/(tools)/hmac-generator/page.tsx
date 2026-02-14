import { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

export const metadata: Metadata = {
    title: 'HMAC Generator | Tool Daddy',
    description: 'Generate Hash-based Message Authentication Codes (HMAC) online. Supports SHA256, SHA512, SHA1, and MD5 with custom secret keys.',
    keywords: ['hmac generator', 'hmac sha256', 'hmac sha512', 'message authentication', 'online hmac', 'developer tools'],
    openGraph: {
        title: 'HMAC Generator | Tool Daddy',
        description: 'Generate secure HMAC signatures online with custom secret keys.',
        type: 'website',
    }
};

const HmacGeneratorClient = dynamic(() => import('./_components/hmac-generator-client'), {
    loading: () => (
        <div className="container mx-auto py-10 px-4 max-w-4xl space-y-8">
            <Skeleton className="h-40 w-full rounded-3xl" />
            <Skeleton className="h-[400px] w-full rounded-2xl" />
        </div>
    )
});

export default function HmacGeneratorPage() {
    return <HmacGeneratorClient />;
}
