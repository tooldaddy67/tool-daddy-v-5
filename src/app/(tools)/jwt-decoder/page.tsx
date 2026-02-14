import { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

export const metadata: Metadata = {
    title: 'JWT Decoder | Tool Daddy',
    description: 'Decode JSON Web Tokens (JWT) instantly to view header and payload claims.',
    keywords: ['jwt decoder', 'jwt debugger', 'json web token', 'decode jwt', 'developer tools'],
    openGraph: {
        title: 'JWT Decoder | Tool Daddy',
        description: 'Decode JSON Web Tokens (JWT) instantly to view header and payload claims.',
        type: 'website',
    }
};

const JwtDecoderClient = dynamic(() => import('./_components/jwt-decoder-client'), {
    loading: () => (
        <div className="container mx-auto py-10 px-4 max-w-7xl space-y-8">
            <Skeleton className="h-40 w-full rounded-3xl" />
            <Skeleton className="h-[600px] w-full rounded-2xl" />
        </div>
    )
});

export default function JwtDecoderPage() {
    return <JwtDecoderClient />;
}
