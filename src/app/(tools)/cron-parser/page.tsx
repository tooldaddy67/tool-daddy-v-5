import { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

export const metadata: Metadata = {
    title: 'Cron Expression Parser | Tool Daddy',
    description: 'Parse cron expressions into human-readable descriptions and calculate next run times.',
    keywords: ['cron parser', 'cron expression', 'cron schedule', 'next run time', 'devops tools'],
    openGraph: {
        title: 'Cron Expression Parser | Tool Daddy',
        description: 'Parse cron expressions into human-readable descriptions.',
        type: 'website',
    }
};

const CronParserClient = dynamic(() => import('./_components/cron-parser-client'), {
    loading: () => (
        <div className="container mx-auto py-10 px-4 max-w-7xl space-y-8">
            <Skeleton className="h-40 w-full rounded-3xl" />
            <Skeleton className="h-[600px] w-full rounded-2xl" />
        </div>
    )
});

export default function CronParserPage() {
    return <CronParserClient />;
}
