import { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

export const metadata: Metadata = {
    title: 'Free Link Shortener | Tool Daddy',
    description: 'Transform long, clunky URLs into clean, manageable links in seconds with our free URL shortener tool.',
    keywords: ['link shortener', 'url shortener', 'tinyurl', 'shorten link', 'bitly alternative'],
    openGraph: {
        title: 'Free Link Shortener | Tool Daddy',
        description: 'Transform long, clunky URLs into clean, manageable links in seconds.',
        type: 'website',
    }
};

const LinkShortenerClient = dynamic(() => import('./_components/link-shortener-client'), {
    loading: () => (
        <div className="container mx-auto py-10 px-4 max-w-4xl space-y-8">
            <Skeleton className="h-40 w-full rounded-3xl" />
            <Skeleton className="h-[200px] w-full rounded-2xl" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Skeleton className="h-32 w-full rounded-xl" />
                <Skeleton className="h-32 w-full rounded-xl" />
                <Skeleton className="h-32 w-full rounded-xl" />
            </div>
        </div>
    )
});

export default function LinkShortenerPage() {
    return <LinkShortenerClient />;
}
