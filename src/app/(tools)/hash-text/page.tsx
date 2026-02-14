import { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

export const metadata: Metadata = {
    title: 'Text Hash Generator (SHA-256, SHA-512) | Tool Daddy',
    description: 'Generate high-security cryptographic hashes using the standard Web Crypto API. Support for SHA-256, SHA-512, SHA-384, and SHA-1.',
    keywords: ['hash generator', 'sha256 generator', 'sha512 generator', 'crypto hash', 'web crypto api', 'developer tools'],
    openGraph: {
        title: 'Text Hash Generator | Tool Daddy',
        description: 'Generate cryptographic hashes using your browser native Web Crypto API.',
        type: 'website',
    }
};

const HashTextClient = dynamic(() => import('./_components/hash-text-client'), {
    loading: () => (
        <div className="container mx-auto py-10 px-4 max-w-4xl space-y-8">
            <Skeleton className="h-40 w-full rounded-3xl" />
            <Skeleton className="h-[400px] w-full rounded-2xl" />
        </div>
    )
});

export default function HashTextPage() {
    return <HashTextClient />;
}
