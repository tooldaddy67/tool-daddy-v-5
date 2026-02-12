import { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

export const metadata: Metadata = {
    title: 'ETA Calculator | Tool Daddy',
    description: 'Estimate your travel time and arrival based on distance and average speed with our simple ETA Calculator.',
    keywords: ['eta calculator', 'travel time estimator', 'arrival time calculator', 'distance speed time', 'trip planner'],
    openGraph: {
        title: 'ETA Calculator | Tool Daddy',
        description: 'Estimate your travel time and arrival based on distance and average speed.',
        type: 'website',
    }
};

const EtaCalculatorClient = dynamic(() => import('./_components/eta-calculator-client'), {
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

export default function EtaCalculatorPage() {
    return <EtaCalculatorClient />;
}
