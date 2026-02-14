import { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

export const metadata: Metadata = {
    title: 'MAC Address Lookup & Vendor Search | Tool Daddy',
    description: 'Find the manufacturer and vendor of any network device using its MAC address. Search our global OUI database instantly.',
    keywords: ['mac address lookup', 'oui lookup', 'vendor search', 'mac manufacturer finder', 'networking tools', 'mac vendor lookup'],
    openGraph: {
        title: 'MAC Address Lookup | Tool Daddy',
        description: 'Identify the manufacturer of any device by its MAC address.',
        type: 'website',
    }
};

const MacLookupClient = dynamic(() => import('./_components/mac-address-lookup-client'), {
    loading: () => (
        <div className="container mx-auto py-10 px-4 max-w-4xl space-y-8">
            <Skeleton className="h-40 w-full rounded-3xl" />
            <Skeleton className="h-[400px] w-full rounded-2xl" />
        </div>
    )
});

export default function MacLookupPage() {
    return <MacLookupClient />;
}
