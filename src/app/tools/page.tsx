'use client';

import { useState } from 'react';
import { MobileHeader } from '@/components/mobile/mobile-header';
import ToolGridLoader from '@/components/tool-grid-loader';
import { MobileToolsGrid } from '@/components/mobile/mobile-tools-grid';

import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function ToolsPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const searchParams = useSearchParams();
    const router = useRouter();
    const categoryFilter = searchParams.get('category');

    return (
        <div className="min-h-screen md:py-24 py-12">
            <div className="md:hidden">
                <MobileHeader searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

                <div className="flex flex-col items-center justify-center text-center space-y-4 my-8 px-4 relative">
                    {categoryFilter && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="absolute left-4 top-0 -mt-2 text-muted-foreground"
                            onClick={() => router.push('/tools')}
                        >
                            <ArrowLeft className="w-4 h-4 mr-1" /> Back
                        </Button>
                    )}
                    <h1 className="text-4xl font-bold tracking-tighter font-headline">
                        {categoryFilter ? categoryFilter.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'All Tools'}
                    </h1>
                    <p className="text-muted-foreground text-lg text-center">
                        Explore our full suite of productivity, media, and creative utilities.
                    </p>
                </div>
                <MobileToolsGrid
                    searchQuery={searchQuery}
                    initialCategory={categoryFilter || undefined}
                />
            </div>

            <div className="hidden md:block container px-4 md:px-6 md:mt-0 mt-8">
                <div className="flex flex-col items-center justify-center text-center space-y-4 mb-12">
                    <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl font-headline">All Tools</h1>
                    <p className="text-muted-foreground max-w-[600px] text-lg">
                        Explore our full suite of productivity, media, and creative utilities.
                    </p>
                </div>
                <ToolGridLoader />
            </div>
        </div>
    );
}
