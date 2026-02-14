import { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

export const metadata: Metadata = {
    title: 'Text to ASCII/Binary Converter | Tool Daddy',
    description: 'Convert plain text into ASCII codes (Decimal/Hex) and Binary representation instantly.',
    keywords: ['text to binary', 'binary converter', 'ascii converter', 'hex to text', 'text to decimal', 'developer tools'],
};

const AsciiBinaryClient = dynamic(() => import('./_components/ascii-binary-client'), {
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

export default function AsciiBinaryPage() {
    return <AsciiBinaryClient />;
}
