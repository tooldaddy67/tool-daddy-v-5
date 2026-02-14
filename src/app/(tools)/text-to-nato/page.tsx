import { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

export const metadata: Metadata = {
    title: 'Text to NATO Phonetic Converter | Tool Daddy',
    description: 'Convert any text into the International Radiotelephony Spelling Alphabet (NATO phonetic alphabet). Essential for clear communication of spellings.',
    keywords: ['nato phonetic alphabet', 'text to nato', 'phonetic alphabet converter', 'spelling alphabet', 'alpha bravo charlie', 'communication tools'],
    openGraph: {
        title: 'Text to NATO Converter | Tool Daddy',
        description: 'Translate text into the NATO phonetic alphabet instantly.',
        type: 'website',
    }
};

const NatoClient = dynamic(() => import('./_components/nato-client'), {
    loading: () => (
        <div className="container mx-auto py-10 px-4 max-w-4xl space-y-8">
            <Skeleton className="h-40 w-full rounded-3xl" />
            <Skeleton className="h-[500px] w-full rounded-2xl" />
        </div>
    )
});

export default function NatoPage() {
    return <NatoClient />;
}
