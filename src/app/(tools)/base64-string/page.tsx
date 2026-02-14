import { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

export const metadata: Metadata = {
    title: 'Base64 String Encoder/Decoder | Tool Daddy',
    description: 'Quickly encode or decode text strings to and from Base64 format with UTF-8 support.',
    keywords: ['base64 encoder', 'base64 decoder', 'text to base64', 'base64 to text', 'developer tools'],
};

const Base64StringClient = dynamic(() => import('./_components/base64-string-client'), {
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

export default function Base64StringPage() {
    return <Base64StringClient />;
}
