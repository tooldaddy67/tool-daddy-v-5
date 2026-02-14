import { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

export const metadata: Metadata = {
    title: 'Bcrypt Hash Generator & Verifier | Tool Daddy',
    description: 'Securely generate and verify Bcrypt hashes online. Customizable cost factor and instant verification for password hashing.',
    keywords: ['bcrypt generator', 'bcrypt hash', 'hash password', 'verify bcrypt', 'online bcrypt', 'developer tools'],
    openGraph: {
        title: 'Bcrypt Hash Generator & Verifier | Tool Daddy',
        description: 'Securely generate and verify Bcrypt hashes online.',
        type: 'website',
    }
};

const BcryptGeneratorClient = dynamic(() => import('./_components/bcrypt-generator-client'), {
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

export default function BcryptGeneratorPage() {
    return <BcryptGeneratorClient />;
}
