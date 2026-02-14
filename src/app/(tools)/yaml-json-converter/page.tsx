import { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

export const metadata: Metadata = {
    title: 'YAML to JSON & JSON to YAML Converter | Tool Daddy',
    description: 'Convert YAML to JSON and JSON to YAML instantly online for free.',
    keywords: ['yaml to json', 'json to yaml', 'yaml converter', 'json converter', 'developer tools'],
    openGraph: {
        title: 'YAML ↔ JSON Converter | Tool Daddy',
        description: 'Convert YAML to JSON and JSON to YAML instantly.',
        type: 'website',
    }
};

const YamlJsonConverterClient = dynamic(() => import('./_components/yaml-json-converter-client'), {
    loading: () => (
        <div className="container mx-auto py-10 px-4 max-w-7xl space-y-8">
            <Skeleton className="h-40 w-full rounded-3xl" />
            <Skeleton className="h-[600px] w-full rounded-2xl" />
        </div>
    )
});

export default function YamlJsonConverterPage() {
    return <YamlJsonConverterClient />;
}
