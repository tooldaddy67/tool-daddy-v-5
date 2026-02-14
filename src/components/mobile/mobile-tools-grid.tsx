"use client";

import { useState } from "react";
import { ALL_TOOLS_CATEGORIES, Tool } from "@/lib/tools-data";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronUp } from "lucide-react";

interface MobileToolsGridProps {
    searchQuery: string;
    initialCategory?: string;
}

import ToolCard from '@/components/tool-card';

// ... (imports remain)

// Remove ICON_VARIANTS as it's handled inside the imported ToolCard or passed differently if needed.
// actually, the imported ToolCard handles its own variants internally if we pass variantIndex.

export function MobileToolsGrid({ searchQuery, initialCategory }: MobileToolsGridProps) {
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
                <div className="px-5 space-y-4 min-h-[50vh]">
                    <h3 className="text-sm font-medium text-muted-foreground">
                        Found {filteredTools.length} result{filteredTools.length !== 1 && 's'}
                    </h3>
                    {/* Changed to grid-cols-1 for full width desktop cards on mobile */}
                    <div className="grid grid-cols-1 gap-4">
                        {filteredTools.map((tool, idx) => (
                            <ToolCard
                                key={tool.name}
                                {...tool}
                                variantIndex={idx}
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
                <div className="space-y-8 px-5">
                    {displayCategories.map((category) => {
                        const mobileReadyTools = category.tools.filter(t => !t.isExternal && !t.desktopOnly);
                        if (mobileReadyTools.length === 0) return null;

                        // Auto-expand if only one category is shown
                        const isSingleCategory = displayCategories.length === 1;
                        const isExpanded = isSingleCategory || expandedCategories[category.slug];

                        const displayTools = isExpanded ? mobileReadyTools : mobileReadyTools.slice(0, 2);
                        const hasMore = mobileReadyTools.length > 2;
                        const currentCategoryIndex = toolIndex;
                        toolIndex += mobileReadyTools.length;

                        return (
                            <div key={category.slug} className="space-y-4">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2 rounded-xl bg-primary/10 text-primary">
                                        <category.icon className="w-5 h-5" />
                                    </div>
                                    <h3 className="text-xl font-bold tracking-tight text-foreground font-headline">
                                        {category.title}
                                    </h3>
                                </div>

                                {/* Changed to grid-cols-2 for compact cards */}
                                <div className="grid grid-cols-2 gap-3 transition-all duration-500">
                                    {displayTools.map((tool, idx) => (
                                        <ToolCard
                                            key={tool.name}
                                            {...tool}
                                            variantIndex={currentCategoryIndex + idx}
                                            compact={true}
                                        />
                                    ))}
                                </div>

                                {hasMore && !isSingleCategory && (
                                    <button
                                        onClick={() => toggleCategory(category.slug)}
                                        className="w-full flex items-center justify-center gap-1.5 py-1 text-xs font-semibold text-primary/70 hover:text-primary transition-colors active:scale-95 duration-200"
                                    >
                                        {isExpanded ? (
                                            <>
                                                Show Less <ChevronUp className="w-3.5 h-3.5" />
                                            </>
                                        ) : (
                                            <>
                                                Show More ({category.tools.length - 2}) <ChevronDown className="w-3.5 h-3.5" />
                                            </>
                                        )}
                                    </button>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
