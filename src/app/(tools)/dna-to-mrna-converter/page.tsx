import { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

export const metadata: Metadata = {
    title: 'DNA to mRNA Converter | Tool Daddy',
    description: 'Transcribe DNA sequences into messenger RNA and visualize the protein translation with our professional genetic tools.',
    keywords: ['dna to mrna', 'transcription tool', 'genetic code', 'codon table', 'molecular biology tools'],
    openGraph: {
        title: 'DNA to mRNA Converter | Tool Daddy',
        description: 'Transcribe DNA sequences into messenger RNA and visualize the protein translation.',
        type: 'website',
    }
};

const DnaToMrnaConverterClient = dynamic(() => import('./_components/dna-to-mrna-converter-client'), {
    loading: () => (
        <div className="container mx-auto py-10 px-4 max-w-4xl space-y-8">
            <Skeleton className="h-40 w-full rounded-3xl" />
            <Skeleton className="h-60 w-full rounded-2xl" />
            <div className="space-y-4">
                <Skeleton className="h-20 w-full rounded-xl" />
                <Skeleton className="h-40 w-full rounded-xl" />
            </div>
        </div>
    )
});

export default function DnaToMrnaConverterPage() {
    return <DnaToMrnaConverterClient />;
}
