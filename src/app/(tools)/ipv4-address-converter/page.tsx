import { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

export const metadata: Metadata = {
    title: 'IPv4 Address Converter | Tool Daddy',
    description: 'Convert IPv4 addresses between dotted decimal, binary, hexadecimal, and integer formats instantly. Free online networking tool.',
    keywords: ['ipv4 converter', 'ip to binary', 'ip to hex', 'ip to integer', 'dotted decimal converter', 'networking tools'],
    openGraph: {
        title: 'IPv4 Address Converter | Tool Daddy',
        description: 'Instant conversion between various IPv4 address formats.',
        type: 'website',
    }
};

const AddressConverterClient = dynamic(() => import('./_components/ipv4-address-converter-client'), {
    loading: () => (
        <div className="container mx-auto py-10 px-4 max-w-4xl space-y-8">
            <Skeleton className="h-40 w-full rounded-3xl" />
            <Skeleton className="h-[400px] w-full rounded-2xl" />
        </div>
    )
});

export default function AddressConverterPage() {
    return <AddressConverterClient />;
}
