import { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

export const metadata: Metadata = {
    title: 'Temperature Converter | Tool Daddy',
    description: 'Instantly convert temperatures between Celsius, Fahrenheit, and Kelvin scales with our easy temperature conversion tool.',
    keywords: ['temperature converter', 'celsius to fahrenheit', 'fahrenheit to celsius', 'kelvin converter', 'online converter'],
    openGraph: {
        title: 'Temperature Converter | Tool Daddy',
        description: 'Instantly convert temperatures between Celsius, Fahrenheit, and Kelvin scales.',
        type: 'website',
    }
};

const TemperatureConverterClient = dynamic(() => import('./_components/temperature-converter-client'), {
    loading: () => (
        <div className="container mx-auto py-10 px-4 max-w-4xl space-y-8">
            <Skeleton className="h-40 w-full rounded-3xl" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Skeleton className="h-40 w-full rounded-2xl" />
                <Skeleton className="h-40 w-full rounded-2xl" />
                <Skeleton className="h-40 w-full rounded-2xl" />
            </div>
            <Skeleton className="h-60 w-full rounded-2xl" />
        </div>
    )
});

export default function TemperatureConverterPage() {
    return <TemperatureConverterClient />;
}
