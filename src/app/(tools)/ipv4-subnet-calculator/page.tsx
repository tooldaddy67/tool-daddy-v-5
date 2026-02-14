import { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

export const metadata: Metadata = {
    title: 'IPv4 Subnet Calculator & CIDR Range Tool | Tool Daddy',
    description: 'Easily calculate network parameters, broadcast addresses, usable IP ranges, and subnet masks. A must-have tool for network engineers and IT professionals.',
    keywords: ['subnet calculator', 'ipv4 subnet tool', 'cidr calculator', 'network range', 'broadcast address calculator', 'it tools', 'networking'],
    openGraph: {
        title: 'IPv4 Subnet Calculator | Tool Daddy',
        description: 'Calculate network details, subnets, and host ranges instantly.',
        type: 'website',
    }
};

const SubnetCalculatorClient = dynamic(() => import('./_components/ipv4-subnet-calculator-client'), {
    loading: () => (
        <div className="container mx-auto py-10 px-4 max-w-4xl space-y-8">
            <Skeleton className="h-40 w-full rounded-3xl" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <Skeleton className="md:col-span-1 h-[300px] w-full rounded-2xl" />
                <Skeleton className="md:col-span-2 h-[450px] w-full rounded-2xl" />
            </div>
        </div>
    )
});

export default function SubnetCalculatorPage() {
    return <SubnetCalculatorClient />;
}
