import { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

export const metadata: Metadata = {
    title: 'BIP39 Mnemonic Seed Phrase Generator | Tool Daddy',
    description: 'Generate secure BIP39 mnemonic phrases for cryptocurrency wallets. Supports 12 and 24-word phrases with high-entropy randomness.',
    keywords: ['bip39 generator', 'seed phrase generator', 'mnemonic phrase', 'crypto wallet seed', 'online bip39', 'developer tools'],
    openGraph: {
        title: 'BIP39 Mnemonic Seed Phrases | Tool Daddy',
        description: 'Generate cryptographically secure seed phrases for your crypto assets.',
        type: 'website',
    }
};

const Bip39GeneratorClient = dynamic(() => import('./_components/bip39-generator-client'), {
    loading: () => (
        <div className="container mx-auto py-10 px-4 max-w-4xl space-y-8">
            <Skeleton className="h-40 w-full rounded-3xl" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <Skeleton className="md:col-span-1 h-[400px] w-full rounded-2xl" />
                <Skeleton className="md:col-span-2 h-[400px] w-full rounded-2xl" />
            </div>
        </div>
    )
});

export default function Bip39GeneratorPage() {
    return <Bip39GeneratorClient />;
}
