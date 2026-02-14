import { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

export const metadata: Metadata = {
    title: 'ULID Generator | Tool Daddy',
    description: 'Generate Universally Unique Lexicographically Sortable Identifiers (ULID). Sortable, secure, and time-ordered unique IDs.',
    keywords: ['ulid generator', 'sortable id', 'unique id generator', 'online ulid', 'time-ordered id', 'developer tools'],
    openGraph: {
        title: 'ULID Generator | Tool Daddy',
        description: 'Generate Universally Unique Lexicographically Sortable Identifiers.',
        type: 'website',
    }
};

const UlidGeneratorClient = dynamic(() => import('./_components/ulid-generator-client'), {
    loading: () => (
        <div className="container mx-auto py-10 px-4 max-w-4xl space-y-8">
            <Skeleton className="h-40 w-full rounded-3xl" />
            <Skeleton className="h-[400px] w-full rounded-2xl" />
        </div>
    )
});

export default function UlidGeneratorPage() {
    return <UlidGeneratorClient />;
}
