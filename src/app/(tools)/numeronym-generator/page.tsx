import { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

export const metadata: Metadata = {
    title: 'Numeronym Generator | Tool Daddy',
    description: 'Convert long words into compact numeronyms like i18n, l10n, and a11y. Perfect for developers and tech writers.',
    keywords: ['numeronym generator', 'i18n generator', 'l10n generator', 'a11y generator', 'text abbreviation', 'developer tools'],
    openGraph: {
        title: 'Numeronym Generator | Tool Daddy',
        description: 'Instantly generate numeronyms for any word or phrase.',
        type: 'website',
    }
};

const NumeronymClient = dynamic(() => import('./_components/numeronym-client'), {
    loading: () => (
        <div className="container mx-auto py-10 px-4 max-w-4xl space-y-8">
            <Skeleton className="h-40 w-full rounded-3xl" />
            <Skeleton className="h-[400px] w-full rounded-2xl" />
        </div>
    )
});

export default function NumeronymPage() {
    return <NumeronymClient />;
}
