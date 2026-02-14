import { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

export const metadata: Metadata = {
    title: 'Regex Tester | Tool Daddy',
    description: 'Test and debug your Regular Expressions against text strings in real-time.',
    keywords: ['regex tester', 'regular expression', 'regex debug', 'regex match', 'developer tools'],
    openGraph: {
        title: 'Regex Tester | Tool Daddy',
        description: 'Test and debug your Regular Expressions in real-time.',
        type: 'website',
    }
};

const RegexTesterClient = dynamic(() => import('./_components/regex-tester-client'), {
    loading: () => (
        <div className="container mx-auto py-10 px-4 max-w-7xl space-y-8">
            <Skeleton className="h-40 w-full rounded-3xl" />
            <Skeleton className="h-[600px] w-full rounded-2xl" />
        </div>
    )
});

export default function RegexTesterPage() {
    return <RegexTesterClient />;
}
