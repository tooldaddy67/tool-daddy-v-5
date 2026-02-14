import { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

export const metadata: Metadata = {
    title: 'ASCII Art Generator | Tool Daddy',
    description: 'Transform your text into awesome ASCII art banners. Choose from different styles and fonts for your terminal or code comments.',
    keywords: ['ascii art generator', 'text to ascii', 'ascii banner', 'figlet online', 'text art converter', 'terminal art'],
    openGraph: {
        title: 'ASCII Art Generator | Tool Daddy',
        description: 'Create cool ASCII art banners from your text.',
        type: 'website',
    }
};

const AsciiArtClient = dynamic(() => import('./_components/ascii-art-client'), {
    loading: () => (
        <div className="container mx-auto py-10 px-4 max-w-4xl space-y-8">
            <Skeleton className="h-40 w-full rounded-3xl" />
            <Skeleton className="h-[500px] w-full rounded-2xl" />
        </div>
    )
});

export default function AsciiArtPage() {
    return <AsciiArtClient />;
}
