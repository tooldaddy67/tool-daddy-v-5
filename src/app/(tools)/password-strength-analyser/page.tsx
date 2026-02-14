import { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

export const metadata: Metadata = {
    title: 'Password Strength Analyser | Tool Daddy',
    description: 'Check how strong your password is with our entropy-based analyzer. Estimate crack times and get professional security suggestions instantly.',
    keywords: ['password strength checker', 'password analyzer', 'zxcvbn online', 'entropy calculator', 'secure password tool', 'crack time estimator'],
    openGraph: {
        title: 'Password Strength Analyser | Tool Daddy',
        description: 'Test your password security and get instant feedback.',
        type: 'website',
    }
};

const PasswordAnalyserClient = dynamic(() => import('./_components/password-analyser-client'), {
    loading: () => (
        <div className="container mx-auto py-10 px-4 max-w-4xl space-y-8">
            <Skeleton className="h-40 w-full rounded-3xl" />
            <Skeleton className="h-[200px] w-full rounded-2xl" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Skeleton className="h-[300px] w-full rounded-2xl" />
                <Skeleton className="h-[300px] w-full rounded-2xl" />
            </div>
        </div>
    )
});

export default function PasswordAnalyserPage() {
    return <PasswordAnalyserClient />;
}
