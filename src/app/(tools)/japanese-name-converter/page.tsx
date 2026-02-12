import { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

export const metadata: Metadata = {
    title: 'Japanese Name Converter | Tool Daddy',
    description: 'Convert your name into Katakana and Hiragana instantly with our professional Japanese name transliteration tool.',
    keywords: ['japanese name converter', 'romaji to katakana', 'romaji to hiragana', 'japanese translator', 'name translator'],
    openGraph: {
        title: 'Japanese Name Converter | Tool Daddy',
        description: 'Convert your name into Katakana and Hiragana instantly.',
        type: 'website',
    }
};

const JapaneseNameConverterClient = dynamic(() => import('./_components/japanese-name-converter-client'), {
    loading: () => (
        <div className="container mx-auto py-10 px-4 max-w-4xl space-y-8">
            <Skeleton className="h-40 w-full rounded-3xl" />
            <Skeleton className="h-32 w-full rounded-2xl" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Skeleton className="h-60 w-full rounded-2xl" />
                <Skeleton className="h-60 w-full rounded-2xl" />
            </div>
        </div>
    )
});

export default function JapaneseNameConverterPage() {
    return <JapaneseNameConverterClient />;
}
