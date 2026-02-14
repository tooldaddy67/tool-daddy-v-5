import { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

export const metadata: Metadata = {
    title: 'RSA Key Pair Generator | Tool Daddy',
    description: 'Create secure public and private RSA key pairs online. Support for multiple bit lengths (1024, 2048, 4096). Keys are generated locally for maximum security.',
    keywords: ['rsa key generator', 'public private key pair', 'pem key generator', 'online rsa tool', 'cryptography tools', 'ssh key generator'],
    openGraph: {
        title: 'RSA Key Pair Generator | Tool Daddy',
        description: 'Generate secure RSA key pairs instantly in your browser.',
        type: 'website',
    }
};

const RsaKeyGeneratorClient = dynamic(() => import('./_components/rsa-key-generator-client'), {
    loading: () => (
        <div className="container mx-auto py-10 px-4 max-w-5xl space-y-8">
            <Skeleton className="h-40 w-full rounded-3xl" />
            <Skeleton className="h-[200px] w-full rounded-2xl" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Skeleton className="h-[400px] w-full rounded-2xl" />
                <Skeleton className="h-[400px] w-full rounded-2xl" />
            </div>
        </div>
    )
});

export default function RsaKeyGeneratorPage() {
    return <RsaKeyGeneratorClient />;
}
