import { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

export const metadata: Metadata = {
    title: 'JSON Formatter & Validator | Tool Daddy',
    description: 'Format, validate, and beautify your JSON data with our free online JSON Formatter.',
    keywords: ['json formatter', 'json validator', 'json beautifier', 'json parser', 'developer tools'],
    openGraph: {
        title: 'JSON Formatter & Validator | Tool Daddy',
        description: 'Format, validate, and beautify your JSON data.',
        type: 'website',
    }
};

const JsonFormatterClient = dynamic(() => import('./_components/json-formatter-client'), {
    loading: () => (
        <div className="container mx-auto py-10 px-4 max-w-7xl space-y-8">
            <Skeleton className="h-40 w-full rounded-3xl" />
            <Skeleton className="h-[600px] w-full rounded-2xl" />
        </div>
    )
});

export default function JsonFormatterPage() {
    return <JsonFormatterClient />;
}
