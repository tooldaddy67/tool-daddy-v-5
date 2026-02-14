import { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

export const metadata: Metadata = {
    title: 'IPv4 Range Expander & CIDR Exploder | Tool Daddy',
    description: 'Expand CIDR blocks and IP ranges into a full list of individual IPv4 addresses. Free online tool for network administrators and developers.',
    keywords: ['ip range expander', 'cidr exploder', 'cidr to ip list', 'ip address list', 'networking tools', 'subnet expander'],
    openGraph: {
        title: 'IPv4 Range Expander | Tool Daddy',
        description: 'Convert IP ranges and CIDR blocks into full lists of addresses.',
        type: 'website',
    }
};

const RangeExpanderClient = dynamic(() => import('./_components/ipv4-range-expander-client'), {
    loading: () => (
        <div className="container mx-auto py-10 px-4 max-w-4xl space-y-8">
            <Skeleton className="h-40 w-full rounded-3xl" />
            <Skeleton className="h-[400px] w-full rounded-2xl" />
        </div>
    )
});

export default function RangeExpanderPage() {
    return <RangeExpanderClient />;
}
