import { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

export const metadata: Metadata = {
    title: 'PDF Digital Signature Checker | Tool Daddy',
    description: 'Verify if a PDF document contains digital signatures. Analyze PDF structure and detect signature fields and signed content instantly.',
    keywords: ['pdf signature checker', 'verify pdf signature', 'digital signature detector', 'pdf integrity tool', 'online pdf tools'],
    openGraph: {
        title: 'PDF Digital Signature Checker | Tool Daddy',
        description: 'Check for digital signatures in your PDF documents.',
        type: 'website',
    }
};

const PdfSignatureCheckerClient = dynamic(() => import('./_components/pdf-signature-checker-client'), {
    loading: () => (
        <div className="container mx-auto py-10 px-4 max-w-4xl space-y-8">
            <Skeleton className="h-40 w-full rounded-3xl" />
            <Skeleton className="h-[200px] w-full rounded-2xl" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Skeleton className="md:col-span-2 h-[200px] w-full rounded-2xl" />
                <Skeleton className="h-[200px] w-full rounded-2xl" />
            </div>
        </div>
    )
});

export default function PdfSignatureCheckerPage() {
    return <PdfSignatureCheckerClient />;
}
