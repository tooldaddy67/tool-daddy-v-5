import { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

export const metadata: Metadata = {
    title: 'String Obfuscator | Tool Daddy',
    description: 'Protect your strings from simple scraping or just have fun with various text scrambling modes like ROT13, Leet Speak, Reverse, and more.',
    keywords: ['string obfuscator', 'text scrambler', 'rot13 converter', 'leet speak generator', 'text reverse', 'obfuscation tools'],
    openGraph: {
        title: 'String Obfuscator | Tool Daddy',
        description: 'Easily obfuscate or scramble your text using multiple algorithms.',
        type: 'website',
    }
};

const StringObfuscatorClient = dynamic(() => import('./_components/string-obfuscator-client'), {
    loading: () => (
        <div className="container mx-auto py-10 px-4 max-w-4xl space-y-8">
            <Skeleton className="h-40 w-full rounded-3xl" />
            <Skeleton className="h-[400px] w-full rounded-2xl" />
        </div>
    )
});

export default function StringObfuscatorPage() {
    return <StringObfuscatorClient />;
}
