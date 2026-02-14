import { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

export const metadata: Metadata = {
    title: 'SQL Formatter | Tool Daddy',
    description: 'Format and beautify your SQL queries online for free.',
    keywords: ['sql formatter', 'sql beautifier', 'sql parser', 'database tools', 'developer tools'],
    openGraph: {
        title: 'SQL Formatter | Tool Daddy',
        description: 'Format and beautify your SQL queries online.',
        type: 'website',
    }
};

const SqlFormatterClient = dynamic(() => import('./_components/sql-formatter-client'), {
    loading: () => (
        <div className="container mx-auto py-10 px-4 max-w-7xl space-y-8">
            <Skeleton className="h-40 w-full rounded-3xl" />
            <Skeleton className="h-[600px] w-full rounded-2xl" />
        </div>
    )
});

export default function SqlFormatterPage() {
    return <SqlFormatterClient />;
}
