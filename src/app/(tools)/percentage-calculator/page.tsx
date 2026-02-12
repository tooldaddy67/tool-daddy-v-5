import { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

export const metadata: Metadata = {
    title: 'Percentage Calculator | Tool Daddy',
    description: 'Quickly calculate proportions, discounts, and growth rates with our easy-to-use Percentage Calculator.',
    keywords: ['percentage calculator', 'discount calculator', 'growth calculator', 'proportion calculator', 'math tools'],
    openGraph: {
        title: 'Percentage Calculator | Tool Daddy',
        description: 'Quickly calculate proportions, discounts, and growth rates with ease.',
        type: 'website',
    }
};

const PercentageCalculatorClient = dynamic(() => import('./_components/percentage-calculator-client'), {
    loading: () => (
        <div className="container mx-auto py-10 px-4 max-w-4xl space-y-8">
            <Skeleton className="h-40 w-full rounded-3xl" />
            <div className="space-y-6">
                <Skeleton className="h-32 w-full rounded-2xl" />
                <Skeleton className="h-32 w-full rounded-2xl" />
                <Skeleton className="h-32 w-full rounded-2xl" />
            </div>
        </div>
    )
});

export default function PercentageCalculatorPage() {
    return <PercentageCalculatorClient />;
}
