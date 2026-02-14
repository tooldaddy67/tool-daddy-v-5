import { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

export const metadata: Metadata = {
    title: 'Secure AES Text Encryption & Decryption | Tool Daddy',
    description: 'Protect your sensitive data with AES-256 encryption. Securely encrypt and decrypt text directly in your browser without sending data to servers.',
    keywords: ['aes encryption', 'text encryptor', 'secure messaging', 'online decryption', 'aes-256', 'privacy tools'],
    openGraph: {
        title: 'AES Text Encryption & Decryption | Tool Daddy',
        description: 'Securely encrypt and decrypt messages with AES-256.',
        type: 'website',
    }
};

const EncryptDecryptClient = dynamic(() => import('./_components/encrypt-decrypt-client'), {
    loading: () => (
        <div className="container mx-auto py-10 px-4 max-w-4xl space-y-8">
            <Skeleton className="h-40 w-full rounded-3xl" />
            <Skeleton className="h-[600px] w-full rounded-2xl" />
        </div>
    )
});

export default function EncryptDecryptPage() {
    return <EncryptDecryptClient />;
}
