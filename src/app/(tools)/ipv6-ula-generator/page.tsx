import { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

export const metadata: Metadata = {
    title: 'RFC 4193 IPv6 ULA Generator | Tool Daddy',
    description: 'Generate Unique Local Addresses (ULA) for IPv6 private network deployments following RFC 4193 standards. Securely generate random /48 prefixes.',
    keywords: ['ipv6 ula generator', 'unique local address', 'rfc 4193 generator', 'ipv6 private address', 'ipv6 prefix generator', 'networking tools'],
    openGraph: {
        title: 'IPv6 ULA Generator | Tool Daddy',
        description: 'Generate private IPv6 addresses for your internal networks.',
        type: 'website',
    }
};

const Ipv6UlaGeneratorClient = dynamic(() => import('./_components/ipv6-ula-client'), {
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

export default function Ipv6UlaGeneratorPage() {
    return <Ipv6UlaGeneratorClient />;
}
