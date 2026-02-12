import { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

export const metadata: Metadata = {
    title: 'AI Text Humanizer | Tool Daddy',
    description: 'Transform AI-generated text into natural, human-like writing. Best for content creators and students.',
    keywords: ['ai text humanizer', 'humanize ai text', 'bypass ai detection', 'content writing tool', 'ai to human text'],
    openGraph: {
        title: 'AI Text Humanizer | Tool Daddy',
        description: 'Transform AI-generated text into natural, human-like writing.',
        type: 'website',
    }
};

const AiTextHumanizer = dynamic(() => import('./_components/ai-text-humanizer'), {
    loading: () => <AiTextHumanizerSkeleton />
});

function AiTextHumanizerSkeleton() {
    return (
        <div className="w-full h-full flex flex-col xl:flex-row gap-6">
            <div className="flex-1 flex flex-col gap-6">
                <div className="flex-grow flex flex-col bg-card/50 backdrop-blur-lg border-border/20 rounded-lg p-6 space-y-2">
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-5 w-72" />
                    <Skeleton className="flex-grow w-full rounded-md" />
                </div>
                <div className="bg-card/50 backdrop-blur-lg border-border/20 rounded-lg p-6 space-y-4">
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-5 w-56" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                    </div>
                </div>
                <Skeleton className="h-12 w-full" />
            </div>
            <div className="flex-1 flex flex-col bg-background/80 border-border/20 rounded-lg p-6 space-y-2">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-5 w-64" />
                <Skeleton className="flex-grow w-full rounded-md" />
            </div>
        </div>
    )
}

export default function AiTextHumanizerPage() {
    return <AiTextHumanizer />;
}
