'use client';

import { useState } from 'react';
import { MobileHeader } from '@/components/mobile/mobile-header';
import ToolGridLoader from '@/components/tool-grid-loader';
import { MobileToolsGrid } from '@/components/mobile/mobile-tools-grid';

export default function ToolsPage() {
    const [searchQuery, setSearchQuery] = useState("");

    return (
        <div className="min-h-screen md:py-24 py-12">
            <div className="md:hidden">
                <MobileHeader searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
                <div className="flex flex-col items-center justify-center text-center space-y-4 my-8 px-4">
                    <h1 className="text-4xl font-bold tracking-tighter font-headline">All Tools</h1>
                    <p className="text-muted-foreground text-lg text-center">
                        Explore our full suite of productivity, media, and creative utilities.
                    </p>
                </div>
                <MobileToolsGrid searchQuery={searchQuery} />
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
