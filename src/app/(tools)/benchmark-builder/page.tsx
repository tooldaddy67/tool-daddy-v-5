import { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

export const metadata: Metadata = {
    title: 'Benchmark Builder | Tool Daddy',
    description: 'Compare the execution speed of two JavaScript code snippets side-by-side with our high-precision Benchmark Builder.',
    keywords: ['benchmark builder', 'js benchmark', 'javascript performance', 'code battle', 'developer tools'],
    openGraph: {
        title: 'Benchmark Builder | Tool Daddy',
        description: 'Compare the execution speed of two JavaScript code snippets side-by-side.',
        type: 'website',
    }
};

const BenchmarkBuilderClient = dynamic(() => import('./_components/benchmark-builder-client'), {
    loading: () => (
        <div className="container mx-auto py-10 px-4 max-w-5xl space-y-8">
            <Skeleton className="h-40 w-full rounded-3xl" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Skeleton className="h-[300px] w-full rounded-2xl" />
                <Skeleton className="h-[300px] w-full rounded-2xl" />
            </div>
            <div className="flex justify-center">
                <Skeleton className="h-14 w-48 rounded-xl" />
            </div>
        </div>
    )
});

export default function BenchmarkBuilderPage() {
    return <BenchmarkBuilderClient />;
}
