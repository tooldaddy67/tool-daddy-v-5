"use client";

import { useState } from "react";
import { ALL_TOOLS_CATEGORIES, Tool } from "@/lib/tools-data";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronUp } from "lucide-react";

interface MobileToolsGridProps {
    searchQuery: string;
}

const ICON_VARIANTS = [
    { bg: 'bg-blue-500/10', border: 'border-blue-500/20', text: 'text-blue-400', glow: 'rgba(59, 130, 246, 0.5)' },
    { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-400', glow: 'rgba(16, 185, 129, 0.5)' },
    { bg: 'bg-amber-500/10', border: 'border-amber-500/20', text: 'text-amber-400', glow: 'rgba(245, 158, 11, 0.5)' },
    { bg: 'bg-purple-500/10', border: 'border-purple-500/20', text: 'text-purple-400', glow: 'rgba(168, 85, 247, 0.5)' },
    { bg: 'bg-rose-500/10', border: 'border-rose-500/20', text: 'text-rose-400', glow: 'rgba(244, 63, 94, 0.5)' },
    { bg: 'bg-indigo-500/10', border: 'border-indigo-500/20', text: 'text-indigo-400', glow: 'rgba(79, 70, 229, 0.5)' },
    { bg: 'bg-red-500/10', border: 'border-red-500/20', text: 'text-red-400', glow: 'rgba(239, 68, 68, 0.5)' },
    { bg: 'bg-cyan-500/10', border: 'border-cyan-500/20', text: 'text-cyan-400', glow: 'rgba(6, 182, 212, 0.5)' },
    { bg: 'bg-orange-500/10', border: 'border-orange-500/20', text: 'text-orange-400', glow: 'rgba(249, 115, 22, 0.5)' },
];

export function MobileToolsGrid({ searchQuery }: MobileToolsGridProps) {
    const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

    const toggleCategory = (slug: string) => {
        setExpandedCategories(prev => ({
            ...prev,
            [slug]: !prev[slug]
        }));
    };

    // Flatten tools for search and filter mobile-ready ones
    const allTools = ALL_TOOLS_CATEGORIES.flatMap(cat => cat.tools).filter(t => !t.isExternal && !t.desktopOnly);

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
                    <div className="grid grid-cols-1 gap-3">
                        {filteredTools.map((tool, idx) => (
                            <ToolCard key={tool.name} tool={tool} variantIndex={idx} />
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
                    {ALL_TOOLS_CATEGORIES.map((category) => {
                        const mobileReadyTools = category.tools.filter(t => !t.isExternal && !t.desktopOnly);
                        if (mobileReadyTools.length === 0) return null;

                        const isExpanded = expandedCategories[category.slug];
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

                                <div className="grid grid-cols-2 gap-3 transition-all duration-500">
                                    {displayTools.map((tool, idx) => (
                                        <ToolCard
                                            key={tool.name}
                                            tool={tool}
                                            variantIndex={currentCategoryIndex + idx}
                                        />
                                    ))}
                                </div>

                                {hasMore && (
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

function ToolCard({ tool, variantIndex = 0 }: { tool: Tool; variantIndex: number }) {
    const Icon = tool.icon;
    const variant = ICON_VARIANTS[variantIndex % ICON_VARIANTS.length];

    // Check if external link logic is needed (desktop version handles it)
    // Assuming internal links for now based on previous code.

    return (
        <Link
            href={tool.href}
            className={cn(
                "group relative flex flex-col gap-3 p-4 overflow-hidden transition-all duration-300 rounded-3xl",
                "bg-secondary/20 border border-white/5 shadow-sm hover:shadow-lg hover:border-primary/20"
            )}
            style={{ '--glow-color': variant.glow } as React.CSSProperties}
        >
            {/* Pop tag for new/popular */}
            {tool.isNew && (
                <div className="absolute top-0 right-0 bg-blue-500 text-[9px] font-bold px-2 py-1 rounded-bl-xl text-white z-10">
                    NEW
                </div>
            )}
            {tool.isPopular && !tool.isNew && (
                <div className="absolute top-0 right-0 bg-purple-500 text-[9px] font-bold px-2 py-1 rounded-bl-xl text-white z-10">
                    HOT
                </div>
            )}

            <div className="flex justify-between items-start">
                <div
                    className={cn(
                        "p-2.5 rounded-2xl border shrink-0 transition-all duration-300",
                        variant.bg, variant.border, variant.text
                    )}
                >
                    <Icon className="w-5 h-5" />
                </div>
            </div>

            <div>
                <h4 className="font-bold text-sm text-foreground line-clamp-1 mb-1 font-headline group-hover:text-primary transition-colors">{tool.name}</h4>
                <p className="text-[10px] text-muted-foreground line-clamp-2 leading-relaxed font-body">{tool.description}</p>
            </div>
        </Link>
    );
}
