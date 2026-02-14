import { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

export const metadata: Metadata = {
    title: 'Case Converter | Tool Daddy',
    description: 'Transform your text into different case formats like camelCase, snake_case, PascalCase, kebab-case, and more.',
    keywords: ['case converter', 'text transformer', 'camelcase converter', 'snake_case converter', 'uppercase lowercase', 'developer tools'],
};

const CaseConverterClient = dynamic(() => import('./_components/case-converter-client'), {
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

export default function CaseConverterPage() {
    return <CaseConverterClient />;
}
