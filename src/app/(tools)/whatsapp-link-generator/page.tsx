import { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

export const metadata: Metadata = {
    title: 'WhatsApp Link Generator | Tool Daddy',
    description: 'Create direct chat links for your WhatsApp number without saving contacts with our easy WhatsApp Link Generator.',
    keywords: ['whatsapp link generator', 'wa.me generator', 'whatsapp chat link', 'marketing tools', 'social media tools'],
    openGraph: {
        title: 'WhatsApp Link Generator | Tool Daddy',
        description: 'Create direct chat links for your WhatsApp number without saving contacts.',
        type: 'website',
    }
};

const WhatsAppLinkGeneratorClient = dynamic(() => import('./_components/whatsapp-link-generator-client'), {
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

export default function WhatsAppLinkGeneratorPage() {
    return <WhatsAppLinkGeneratorClient />;
}
