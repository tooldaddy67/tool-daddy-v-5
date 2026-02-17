"use client";

import { useState, useEffect } from "react";
import { ALL_TOOLS_CATEGORIES, Tool, ToolCategory } from "@/lib/tools-data";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useInView } from "react-intersection-observer";

interface MobileToolsGridProps {
    searchQuery: string;
    initialCategory?: string;
}

import ToolCard from '@/components/tool-card';

function LazyCategory({
    category,
    isSingleCategory,
    expandedCategories,
    toggleCategory,
    toolIndex,
    router
}: {
    category: ToolCategory,
    isSingleCategory: boolean,
    expandedCategories: Record<string, boolean>,
    toggleCategory: (slug: string) => void,
    toolIndex: number,
    router: any
}) {
    const { ref, inView } = useInView({
        triggerOnce: true,
        rootMargin: '200px 0px',
    });

    const mobileReadyTools = category.tools.filter(t => !t.isExternal && !t.desktopOnly);
    if (mobileReadyTools.length === 0) return null;

    // Auto-expand if only one category is shown
    const isExpanded = isSingleCategory || expandedCategories[category.slug];
    const displayTools = isExpanded ? mobileReadyTools : mobileReadyTools.slice(0, 2);
    const hasMore = mobileReadyTools.length > 2;

    return (
        <div ref={ref} className="category-section" id={category.slug}>
            {!inView ? (
                <div className="h-64 flex items-center justify-center opacity-20">
                    <Loader2 className="w-6 h-6 animate-spin" />
                </div>
            ) : (
                <>
                    <div className="pr-6 mb-8 flex items-center gap-4 relative z-20">
                        <div className="w-2 h-10 bg-primary rounded-full shadow-[0_0_15px_hsl(var(--primary)/0.4)] relative z-30" />
                        <h2 className="text-3xl font-black tracking-tighter text-white uppercase text-left leading-tight relative z-30 block opacity-100">
                            {category.title}
                        </h2>
                    </div>

                    <div className={cn(
                        "transition-all duration-500",
                        isSingleCategory
                            ? "grid grid-cols-2 gap-3 px-3 place-items-center"
                            : "flex flex-wrap justify-center gap-4 pr-6"
                    )}>
                        {displayTools.map((tool, idx) => (
                            <ToolCard
                                key={tool.name}
                                {...tool}
                                variantIndex={toolIndex + idx}
                                compact={true}
                                style={isSingleCategory ? { width: '100%', maxWidth: '170px' } : undefined}
                            />
                        ))}
                    </div>

                    {hasMore && !isSingleCategory && (
                        <button
                            onClick={() => router.push(`/tools?category=${category.slug}`)}
                            className="w-full flex items-center justify-center gap-2 py-2 mt-2 text-[10px] font-black uppercase tracking-widest text-primary hover:text-primary/80 transition-all active:scale-95"
                        >
                            Explore All {category.title} ({category.tools.length})
                            <ChevronDown className="w-4 h-4 -rotate-90" />
                        </button>
                    )}
                </>
            )}
        </div>
    );
}

export function MobileToolsGrid({ searchQuery, initialCategory }: MobileToolsGridProps) {
    const router = useRouter();
    const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

    const toggleCategory = (slug: string) => {
        setExpandedCategories(prev => ({
            ...prev,
            [slug]: !prev[slug]
        }));
    };

    // Flatten tools for search and filter mobile-ready ones
    const allTools = ALL_TOOLS_CATEGORIES.flatMap(cat => cat.tools).filter(t => !t.isExternal && !t.desktopOnly);

    // Filter categories if initialCategory is provided
    const displayCategories = initialCategory
        ? ALL_TOOLS_CATEGORIES.filter(cat => cat.slug === initialCategory)
        : ALL_TOOLS_CATEGORIES;

    const filteredTools = searchQuery
        ? allTools.filter(t =>
            t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.description.toLowerCase().includes(searchQuery.toLowerCase())
        )
        : [];

    const isSearching = searchQuery.length > 0;
    let toolIndex = 0;

    return (
        <div className="pb-32 pt-4">
            {isSearching ? (
                <div className="px-3 space-y-6 min-h-[50vh]">
                    <div className="space-y-1 relative z-20">
                        <h1 className="text-3xl font-black tracking-tighter text-white uppercase leading-tight relative z-30 block opacity-100">
                            Results
                        </h1>
                        <div className="h-1 w-12 bg-primary rounded-full shadow-[0_0_10px_hsl(var(--primary)/0.3)]" />
                    </div>
                    <h2 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">
                        Found {filteredTools.length} result{filteredTools.length !== 1 && 's'} for "{searchQuery}"
                    </h2>
                    <div className="grid grid-cols-2 gap-3 transition-all duration-500">
                        {filteredTools.map((tool, idx) => (
                            <ToolCard
                                key={tool.name}
                                {...tool}
                                variantIndex={idx}
                                compact={true}
                            />
                        ))}
                    </div>
                    {filteredTools.length === 0 && (
                        <div className="text-center py-10 text-muted-foreground">
                            No tools found matching "{searchQuery}"
                        </div>
                    )}
                </div>
            ) : (
                <div className="space-y-12">
                    {displayCategories.map((category) => {
                        const mobileReadyTools = category.tools.filter(t => !t.isExternal && !t.desktopOnly);
                        if (mobileReadyTools.length === 0) return null;

                        const currentCategoryIndex = toolIndex;
                        toolIndex += mobileReadyTools.length;

                        return (
                            <LazyCategory
                                key={category.slug}
                                category={category}
                                isSingleCategory={displayCategories.length === 1}
                                expandedCategories={expandedCategories}
                                toggleCategory={toggleCategory}
                                toolIndex={currentCategoryIndex}
                                router={router}
                            />
                        );
                    })}
                </div>
            )}
        </div>
    );
}
