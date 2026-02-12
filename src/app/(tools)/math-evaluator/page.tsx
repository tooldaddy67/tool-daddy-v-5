import { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

export const metadata: Metadata = {
    title: 'Math Evaluator | Tool Daddy',
    description: 'Perform complex calculations, unit conversions, and algebraic evaluations instantly with our powerful Math Evaluator tool.',
    keywords: ['math evaluator', 'calculator', 'unit converter', 'algebraic calculator', 'online calculator'],
    openGraph: {
        title: 'Math Evaluator | Tool Daddy',
        description: 'Perform complex calculations, unit conversions, and algebraic evaluations instantly.',
        type: 'website',
    }
};

const MathEvaluatorClient = dynamic(() => import('./_components/math-evaluator-client'), {
    loading: () => (
        <div className="container mx-auto py-10 px-4 max-w-4xl space-y-8">
            <Skeleton className="h-40 w-full rounded-3xl" />
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                <div className="md:col-span-8 space-y-6">
                    <Skeleton className="h-32 w-full rounded-2xl" />
                    <div className="grid grid-cols-4 gap-3">
                        {Array(20).fill(0).map((_, i) => (
                            <Skeleton key={i} className="h-14 w-full rounded-xl" />
                        ))}
                    </div>
                </div>
                <div className="md:col-span-4">
                    <Skeleton className="h-[400px] w-full rounded-2xl" />
                </div>
            </div>
        </div>
    )
});

export default function MathEvaluatorPage() {
    return <MathEvaluatorClient />;
}
