import { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

export const metadata: Metadata = {
    title: 'Roman Numeral Converter | Tool Daddy',
    description: 'Convert Arabic integers to Roman numerals and vice-versa. Bi-directional conversion support for numbers 1 to 3,999.',
    keywords: ['roman numeral converter', 'arabic to roman', 'roman to arabic', 'number converter', 'ancient numerals', 'math tools'],
    openGraph: {
        title: 'Roman Numeral Converter | Tool Daddy',
        description: 'Easily convert between Arabic numbers and Roman numerals.',
        type: 'website',
    }
};

const RomanNumeralClient = dynamic(() => import('./_components/roman-numeral-client'), {
    loading: () => (
        <div className="container mx-auto py-10 px-4 max-w-4xl space-y-8">
            <Skeleton className="h-40 w-full rounded-3xl" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Skeleton className="h-[400px] w-full rounded-2xl" />
                <Skeleton className="h-[400px] w-full rounded-2xl" />
            </div>
        </div>
    )
});

export default function RomanNumeralPage() {
    return <RomanNumeralClient />;
}
