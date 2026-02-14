import { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

export const metadata: Metadata = {
    title: 'Unix Timestamp & Date-Time Converter | Tool Daddy',
    description: 'Convert between Unix timestamps (seconds & milliseconds), ISO 8601, UTC, and local date formats instantly.',
    keywords: ['unix timestamp converter', 'date converter', 'epoch time', 'iso 8601 converter', 'utc time', 'developer tools'],
    openGraph: {
        title: 'Unix Timestamp & Date-Time Converter | Tool Daddy',
        description: 'Instant conversion between Unix timestamps and human-readable dates.',
        type: 'website',
    }
};

const DateTimeConverterClient = dynamic(() => import('./_components/date-time-converter-client'), {
    loading: () => (
        <div className="container mx-auto py-10 px-4 max-w-4xl space-y-8">
            <Skeleton className="h-40 w-full rounded-3xl" />
            <Skeleton className="h-[400px] w-full rounded-2xl" />
        </div>
    )
});

export default function DateTimeConverterPage() {
    return <DateTimeConverterClient />;
}
