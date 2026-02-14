import { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

export const metadata: Metadata = {
    title: 'JSON Tree Viewer | Tool Daddy',
    description: 'Visualize your JSON data in an interactive, collapsible tree format.',
    keywords: ['json tree viewer', 'json visualizer', 'json explorer', 'json parser', 'developer tools'],
    openGraph: {
        title: 'JSON Tree Viewer | Tool Daddy',
        description: 'Visualize your JSON data in an interactive, collapsible tree format.',
        type: 'website',
    }
};

const JsonTreeViewerClient = dynamic(() => import('./_components/json-tree-viewer-client'), {
    loading: () => (
        <div className="container mx-auto py-10 px-4 max-w-7xl space-y-8">
            <Skeleton className="h-40 w-full rounded-3xl" />
            <Skeleton className="h-[600px] w-full rounded-2xl" />
        </div>
    )
});

export default function JsonTreeViewerPage() {
    return <JsonTreeViewerClient />;
}
