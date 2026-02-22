'use client';

import { useState } from 'react';
import { MobileHeader } from '@/components/mobile/mobile-header';
import ToolGridLoader from '@/components/tool-grid-loader';
import { MobileToolsGrid } from '@/components/mobile/mobile-tools-grid';

import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

import { ALL_TOOLS_CATEGORIES } from '@/lib/tools-data';
import { cn } from '@/lib/utils';

export default function ToolsPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const searchParams = useSearchParams();
    const router = useRouter();
    const categoryFilter = searchParams.get('category');

    return (
        <div className="min-h-screen md:py-24 py-12">
            <div className="md:hidden pt-14">
                <MobileHeader searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

                {/* Main Hero Header - Optimized for Mobile */}
                <div className="flex flex-col items-center justify-center text-center space-y-6 my-10 px-4 relative">
                    {categoryFilter && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="absolute left-6 top-0 -mt-2 text-muted-foreground"
                            onClick={() => router.push('/tools')}
                        >
                            <ArrowLeft className="w-4 h-4 mr-1" /> Back
                        </Button>
                    )}
                    <div className="space-y-4">
                        <div className="space-y-1 relative z-10">
                            <h2 className="text-4xl font-black tracking-tighter text-white uppercase leading-tight block opacity-100">
                                {categoryFilter ? categoryFilter.replace(/-/g, ' ') : 'All Tools'}
                            </h2>
                            <div className="h-1.5 w-16 bg-primary mx-auto rounded-full shadow-[0_0_15px_hsl(var(--primary)/0.3)]" />
                        </div>
                        <p className="text-muted-foreground text-[12px] font-black uppercase tracking-[0.3em] text-center opacity-60">
                            {categoryFilter ? 'Standardized Suite' : 'The Complete Suite'}
                        </p>
                    </div>

                </div>

                <MobileToolsGrid
                    searchQuery={searchQuery}
                    initialCategory={categoryFilter || undefined}
                />
            </div>

            <div className="hidden md:block w-full min-h-screen mesh-bg relative">
                <div className="w-full px-12 py-24 space-y-20 relative z-10">
                    <div className="flex flex-col items-center justify-center text-center space-y-6 mb-16">
                        <h1 className="text-6xl font-black tracking-tighter uppercase font-headline">All Tools</h1>
                        <div className="h-1.5 w-20 bg-red-500 rounded-full" />
                        <p className="text-muted-foreground max-w-[600px] text-xl font-medium uppercase tracking-widest opacity-70">
                            The Complete Suite
                        </p>
                    </div>
                    <ToolGridLoader />
                </div>
            </div>
        </div>
    );
}
