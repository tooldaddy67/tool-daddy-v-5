import { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

export const metadata: Metadata = {
    title: 'Lorem Ipsum Generator | Tool Daddy',
    description: 'Generate placeholder text (Lorem Ipsum) for your designs and layouts.',
    keywords: ['lorem ipsum', 'placeholder text', 'dummy text', 'generator', 'design tools'],
    openGraph: {
        title: 'Lorem Ipsum Generator | Tool Daddy',
        description: 'Generate placeholder text for your designs.',
        type: 'website',
    }
};

const LoremIpsumGeneratorClient = dynamic(() => import('./_components/lorem-ipsum-generator-client'), {
    loading: () => (
        <div className="container mx-auto py-10 px-4 max-w-7xl space-y-8">
            <Skeleton className="h-40 w-full rounded-3xl" />
            <Skeleton className="h-[600px] w-full rounded-2xl" />
        </div>
    )
});

export default function LoremIpsumGeneratorPage() {
    return <LoremIpsumGeneratorClient />;
}
