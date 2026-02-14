import { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

export const metadata: Metadata = {
    title: 'PostgreSQL Config Generator | Tool Daddy',
    description: 'Generate optimized PostgreSQL configuration (postgresql.conf) based on your system resources.',
    keywords: ['postgres config', 'pgtune', 'postgresql tuning', 'database optimization', 'devops tools'],
    openGraph: {
        title: 'PostgreSQL Config Generator | Tool Daddy',
        description: 'Generate optimized PostgreSQL configuration based on your system resources.',
        type: 'website',
    }
};

const PgConfigGeneratorClient = dynamic(() => import('./_components/pg-config-generator-client'), {
    loading: () => (
        <div className="container mx-auto py-10 px-4 max-w-7xl space-y-8">
            <Skeleton className="h-40 w-full rounded-3xl" />
            <Skeleton className="h-[600px] w-full rounded-2xl" />
        </div>
    )
});

export default function PgConfigGeneratorPage() {
    return <PgConfigGeneratorClient />;
}
