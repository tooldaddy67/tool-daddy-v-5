import { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

export const metadata: Metadata = {
    title: 'Color Converter | Tool Daddy',
    description: 'Convert colors between HEX, RGB, HSL, and CMYK formats.',
    keywords: ['color converter', 'hex to rgb', 'rgb to hex', 'hsl converter', 'web design tools'],
    openGraph: {
        title: 'Color Converter | Tool Daddy',
        description: 'Convert colors between HEX, RGB, HSL.',
        type: 'website',
    }
};

const ColorConverterClient = dynamic(() => import('./_components/color-converter-client'), {
    loading: () => (
        <div className="container mx-auto py-10 px-4 max-w-7xl space-y-8">
            <Skeleton className="h-40 w-full rounded-3xl" />
            <Skeleton className="h-[600px] w-full rounded-2xl" />
        </div>
    )
});

export default function ColorConverterPage() {
    return <ColorConverterClient />;
}
