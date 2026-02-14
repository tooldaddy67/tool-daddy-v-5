import { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

export const metadata: Metadata = {
    title: 'Text Diff Checker | Tool Daddy',
    description: 'Compare two text blocks and highlight the differences (additions and deletions).',
    keywords: ['diff checker', 'text compare', 'file difference', 'diff tool', 'developer tools'],
    openGraph: {
        title: 'Text Diff Checker | Tool Daddy',
        description: 'Compare two text blocks and highlight differences.',
        type: 'website',
    }
};

const TextDiffCheckerClient = dynamic(() => import('./_components/text-diff-checker-client'), {
    loading: () => (
        <div className="container mx-auto py-10 px-4 max-w-7xl space-y-8">
            <Skeleton className="h-40 w-full rounded-3xl" />
            <Skeleton className="h-[600px] w-full rounded-2xl" />
        </div>
    )
});

export default function TextDiffCheckerPage() {
    return <TextDiffCheckerClient />;
}
