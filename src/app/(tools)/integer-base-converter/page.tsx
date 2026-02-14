import { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

export const metadata: Metadata = {
    title: 'Integer Base Converter | Tool Daddy',
    description: 'Convert integers between different bases (Binary, Octal, Decimal, Hex, and Custom Base 2-36). Real-time base conversion for programmers.',
    keywords: ['base converter', 'binary to decimal', 'decimal to hex', 'hex converter', 'octal converter', 'custom base converter', 'number system converter'],
    openGraph: {
        title: 'Integer Base Converter | Tool Daddy',
        description: 'Convert numbers across different numeral systems instantly.',
        type: 'website',
    }
};

const BaseConverterClient = dynamic(() => import('./_components/base-converter-client'), {
    loading: () => (
        <div className="container mx-auto py-10 px-4 max-w-4xl space-y-8">
            <Skeleton className="h-40 w-full rounded-3xl" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Skeleton className="h-[300px] w-full rounded-2xl" />
                <Skeleton className="h-[500px] w-full rounded-2xl" />
            </div>
        </div>
    )
});

export default function BaseConverterPage() {
    return <BaseConverterClient />;
}
