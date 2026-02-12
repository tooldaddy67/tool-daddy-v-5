
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

const AiPlaylistMaker = dynamic(() => import('./_components/ai-playlist-maker'), {
    loading: () => <AiPlaylistMakerSkeleton />
});

function AiPlaylistMakerSkeleton() {
    return (
        <div className="w-full h-full flex flex-col xl:flex-row gap-6">
            <div className="flex-1 flex flex-col gap-6">
                <div className="flex-grow flex flex-col bg-card/50 backdrop-blur-lg border-border/20 rounded-lg p-6 space-y-4">
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-5 w-full" />
                    <Skeleton className="flex-grow w-full rounded-md min-h-[150px]" />
                </div>
                <Skeleton className="h-12 w-full" />
            </div>
            <div className="flex-1 flex flex-col bg-background/80 border-border/20 rounded-lg p-6 space-y-4">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-5 w-64" />
                <div className="flex-grow space-y-4 pt-4">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="flex items-center gap-4">
                            <Skeleton className="h-16 w-16 rounded-md" />
                            <div className="flex-1 space-y-2">
                                <Skeleton className="h-4 w-3/4" />
                                <Skeleton className="h-4 w-1/2" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'AI Playlist Maker | Tool Daddy',
    description: 'Generate custom music playlists using AI based on your mood, activities, or favorite genres.',
    keywords: ['ai playlist maker', 'music generator', 'playlist generator', 'spotify tools', 'ai music'],
    openGraph: {
        title: 'AI Playlist Maker | Tool Daddy',
        description: 'Generate custom music playlists using AI.',
        type: 'website',
    }
};

export default function AiPlaylistMakerPage() {
    return <AiPlaylistMaker />;
}
