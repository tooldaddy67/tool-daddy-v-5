import { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

export const metadata: Metadata = {
    title: 'MAC Address Generator | Tool Daddy',
    description: 'Generate random, valid MAC addresses with customizable formats (colon, dash, dot) and cases. Perfect for testing and network configuration.',
    keywords: ['mac address generator', 'random mac address', 'generate mac', 'nic address generator', 'networking tools', 'mac id generator'],
    openGraph: {
        title: 'MAC Address Generator | Tool Daddy',
        description: 'Instantly generate random MAC addresses in multiple formats.',
        type: 'website',
    }
};

const MacGeneratorClient = dynamic(() => import('./_components/mac-address-generator-client'), {
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

export default function MacGeneratorPage() {
    return <MacGeneratorClient />;
}
