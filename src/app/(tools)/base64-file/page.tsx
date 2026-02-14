import { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

export const metadata: Metadata = {
    title: 'Base64 File Converter | Tool Daddy',
    description: 'Convert any file to a Base64 string or decode Base64 strings back into downloadable files.',
    keywords: ['file to base64', 'base64 to file', 'binary to base64', 'base64 decoder', 'developer tools'],
};

const Base64FileClient = dynamic(() => import('./_components/base64-file-client'), {
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

export default function Base64FilePage() {
    return <Base64FileClient />;
}
