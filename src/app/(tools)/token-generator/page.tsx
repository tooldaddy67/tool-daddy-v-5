import { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

export const metadata: Metadata = {
    title: 'Secure Token Generator | Tool Daddy',
    description: 'Generate secure, random strings for API keys, passwords, or secrets with our highly customizable Token Generator.',
    keywords: ['token generator', 'api key generator', 'random string generator', 'secure tokens', 'developer tools'],
    openGraph: {
        title: 'Secure Token Generator | Tool Daddy',
        description: 'Generate secure, random strings for API keys, passwords, or secrets.',
        type: 'website',
    }
};

const TokenGeneratorClient = dynamic(() => import('./_components/token-generator-client'), {
    loading: () => (
        <div className="container mx-auto py-10 px-4 max-w-4xl space-y-8">
            <Skeleton className="h-40 w-full rounded-3xl" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Skeleton className="h-[400px] w-full rounded-2xl" />
                <Skeleton className="h-[400px] w-full rounded-2xl" />
            </div>
        </div>
    )
});

export default function TokenGeneratorPage() {
    return <TokenGeneratorClient />;
}
