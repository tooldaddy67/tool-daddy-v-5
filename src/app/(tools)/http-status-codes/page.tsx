import { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

export const metadata: Metadata = {
    title: 'HTTP Status Codes | Tool Daddy',
    description: 'Reference list of HTTP status codes and their meanings.',
    keywords: ['http status codes', 'http headers', '404 not found', '500 error', 'developer reference'],
    openGraph: {
        title: 'HTTP Status Codes | Tool Daddy',
        description: 'Reference list of HTTP status codes.',
        type: 'website',
    }
};

const HttpStatusCodesClient = dynamic(() => import('./_components/http-status-codes-client'), {
    loading: () => (
        <div className="container mx-auto py-10 px-4 max-w-7xl space-y-8">
            <Skeleton className="h-40 w-full rounded-3xl" />
            <Skeleton className="h-[600px] w-full rounded-2xl" />
        </div>
    )
});

export default function HttpStatusCodesPage() {
    return <HttpStatusCodesClient />;
}
