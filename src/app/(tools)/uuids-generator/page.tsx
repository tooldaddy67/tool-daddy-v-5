import { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

export const metadata: Metadata = {
    title: 'UUID v4 Generator | Tool Daddy',
    description: 'Generate Universally Unique Identifiers (UUID v4) instantly. Free, secure, and browser-based UUID generation for developers.',
    keywords: ['uuid generator', 'guid generator', 'random uuid', 'uuid v4', 'online uuid', 'developer tools'],
    openGraph: {
        title: 'UUID v4 Generator | Tool Daddy',
        description: 'Generate high-entropy UUID v4 strings instantly.',
        type: 'website',
    }
};

const UuidsGeneratorClient = dynamic(() => import('./_components/uuids-generator-client'), {
    loading: () => (
        <div className="container mx-auto py-10 px-4 max-w-4xl space-y-8">
            <Skeleton className="h-40 w-full rounded-3xl" />
            <Skeleton className="h-[400px] w-full rounded-2xl" />
        </div>
    )
});

export default function UuidsGeneratorPage() {
    return <UuidsGeneratorClient />;
}
