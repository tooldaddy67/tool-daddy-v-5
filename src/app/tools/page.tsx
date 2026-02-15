import { MobileHeader } from '@/components/mobile/mobile-header';
import ToolGridLoader from '@/components/tool-grid-loader';
import { MobileToolsGrid } from '@/components/mobile/mobile-tools-grid';
import { MobileToolCardStatic } from '@/components/mobile/mobile-tool-card-static';
import { ALL_TOOLS_CATEGORIES } from '@/lib/tools-data';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Suspense } from 'react';
import React from 'react';

interface ToolsPageProps {
    searchParams: { [key: string]: string | string[] | undefined };
}

export default async function ToolsPage({ searchParams }: ToolsPageProps) {
    const categoryFilter = typeof searchParams.category === 'string' ? searchParams.category : undefined;
    const searchQuery = typeof searchParams.q === 'string' ? searchParams.q : "";

    return (
        <div className="min-h-screen md:py-24 py-12">
            {/* Mobile View */}
            <div className="md:hidden pt-14 text-white">
                <MobileHeader initialQuery={searchQuery} />

                {/* Main Hero Header - Optimized for Mobile */}
                <div className="flex flex-col items-center justify-center text-center space-y-6 my-10 px-4 relative">
                    {categoryFilter && (
                        <Link href="/tools">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="absolute left-6 top-0 -mt-2 text-muted-foreground"
                            >
                                <ArrowLeft className="w-4 h-4 mr-1" /> Back
                            </Button>
                        </Link>
                    )}
                    <div className="space-y-4">
                        <div className="space-y-1 relative z-10">
                            <h1 className="text-4xl font-black tracking-tighter text-white uppercase leading-tight block opacity-100">
                                {categoryFilter ? categoryFilter.replace(/-/g, ' ') : (searchQuery ? `"${searchQuery}"` : 'All Tools')}
                            </h1>
                            <div className="h-1.5 w-16 bg-primary mx-auto rounded-full shadow-[0_0_15px_hsl(var(--primary)/0.3)]" />
                        </div>
                        <p className="text-muted-foreground text-[12px] font-black uppercase tracking-[0.3em] text-center opacity-60">
                            {categoryFilter ? 'Standardized Suite' : (searchQuery ? 'Search Results' : 'The Complete Suite')}
                        </p>
                    </div>
                </div>

                <div className="mt-4 relative min-h-[500px]">
                    {/* SSR LCP Layer: Renders in the initial HTML as a BLOCK element to qualify as LCP candidate */}
                    {!searchQuery && (
                        <div
                            id="mobile-ssr-lcp"
                            className="grid grid-cols-2 gap-3 px-3 place-items-center relative z-20 transition-opacity duration-300"
                        >
                            {(() => {
                                // Find the relevant category or default to the first one
                                const category = categoryFilter
                                    ? ALL_TOOLS_CATEGORIES.find(c => c.slug === categoryFilter)
                                    : ALL_TOOLS_CATEGORIES[0];

                                // Limit to only 4 tools (the ones likely to be in the first viewport)
                                const tools = category?.tools
                                    .filter(t => !t.isExternal && !t.desktopOnly)
                                    .slice(0, 4) || [];

                                return tools.map((tool, idx) => (
                                    <MobileToolCardStatic
                                        key={`ssr-${tool.name}`}
                                        href={tool.href}
                                        name={tool.name}
                                        description={tool.description}
                                        icon={tool.icon}
                                        variantIndex={idx}
                                    />
                                ));
                            })()}
                        </div>
                    )}

                    {/* The Interactive Layer: Overlayed absolutely until SSR layer is hidden */}
                    <div id="mobile-client-grid" className="absolute top-0 left-0 w-full z-10 opacity-0 transition-opacity duration-300">
                        <MobileToolsGrid
                            searchQuery={searchQuery}
                            initialCategory={categoryFilter}
                        />
                    </div>

                    {/* Cleanup Script: Hides the SSR layer once client-side React takes over */}
                    <script dangerouslySetInnerHTML={{
                        __html: `
                        (function() {
                           // Define defaults for instant paint
                           var d = document.documentElement.style;
                           if(!d.getPropertyValue('--primary')) d.setProperty('--primary', '142 70% 45%');
                           if(!d.getPropertyValue('--radius')) d.setProperty('--radius', '12px');
                           
                           function swap() {
                                var ssrLayer = document.getElementById('mobile-ssr-lcp');
                                var clientGrid = document.getElementById('mobile-client-grid');
                                
                                if (!window.TOOL_DADY_HYDRATED) {
                                    setTimeout(swap, 100);
                                    return;
                                }

                                if (clientGrid) {
                                    clientGrid.style.opacity = '1';
                                    setTimeout(function() {
                                        clientGrid.style.position = 'relative'; 
                                        if (ssrLayer) {
                                            ssrLayer.style.opacity = '0';
                                            setTimeout(function() { ssrLayer.style.display = 'none'; }, 200);
                                        }
                                    }, 50);
                                }
                           }

                           // Swap as soon as DOM is ready, don't wait for images/GTM
                           if (document.readyState === 'loading') {
                               window.addEventListener('DOMContentLoaded', swap);
                           } else {
                               swap();
                           }
                           
                           // Safety fallback for slow hydration
                           setTimeout(swap, 2000);
                        })()
                    `}} />
                </div>
            </div>

            {/* Desktop View */}
            <div className="hidden md:block w-full min-h-screen mesh-bg relative">
                <div className="w-full px-12 py-24 space-y-20 relative z-10">
                    <div className="flex flex-col items-center justify-center text-center space-y-6 mb-16">
                        <h1 className="text-6xl font-black tracking-tighter uppercase font-headline text-white">
                            {categoryFilter ? categoryFilter.replace(/-/g, ' ') : 'All Tools'}
                        </h1>
                        <div className="h-1.5 w-20 bg-red-500 rounded-full" />
                        <p className="text-muted-foreground max-w-[600px] text-xl font-medium uppercase tracking-widest opacity-70">
                            {categoryFilter ? 'Category Suite' : 'The Complete Suite'}
                        </p>
                    </div>
                    <ToolGridLoader />
                </div>
            </div>
        </div>
    );
}
