import ToolGridLoader from '@/components/tool-grid-loader';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'All Tools | Tool Daddy',
    description: 'Browse our complete collection of digital tools and utilities.',
};

export default function ToolsPage() {
    return (
        <div className="container px-4 md:px-6 py-12 md:py-24 min-h-screen">
            <div className="flex flex-col items-center justify-center text-center space-y-4 mb-12">
                <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl font-headline">All Tools</h1>
                <p className="text-muted-foreground max-w-[600px] text-lg">
                    Explore our full suite of productivity, media, and creative utilities.
                </p>
            </div>
            <ToolGridLoader />
        </div>
    );
}
