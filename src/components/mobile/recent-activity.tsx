"use client";

import { useRecentTools } from "@/hooks/use-recent-tools";
import Link from "next/link";
import { ALL_TOOLS_CATEGORIES } from "@/lib/tools-data";
import { Clock, ArrowRight } from "lucide-react";

export function RecentActivity() {
    const { recentTools, isLoaded } = useRecentTools();

    const getToolDetails = (name: string) => {
        for (const cat of ALL_TOOLS_CATEGORIES) {
            const tool = cat.tools.find(t => t.name === name);
            if (tool) return tool;
        }
        return null;
    };

    if (!isLoaded) {
        return (
            <div className="w-full mb-8 xl:hidden">
                <div className="px-5 mb-4 flex items-center justify-between">
                    <div className="h-6 w-32 bg-muted/20 animate-pulse rounded-full" />
                </div>
                <div className="flex px-5 gap-3">
                    <div className="w-[160px] h-[140px] rounded-3xl bg-muted/10 animate-pulse flex-shrink-0" />
                    <div className="w-[160px] h-[140px] rounded-3xl bg-muted/10 animate-pulse flex-shrink-0" />
                </div>
            </div>
        );
    }

    if (recentTools.length === 0) return null;

    const displayTools = recentTools
        .map(rt => {
            const details = getToolDetails(rt.name);
            return details ? { ...details, timestamp: rt.timestamp } : null;
        })
        .filter((t): t is NonNullable<typeof t> => !!t)
        .slice(0, 10);

    if (displayTools.length === 0) return null;

    return (
        <div className="w-full mb-8 xl:hidden">
            <div className="px-5 mb-4 flex items-center justify-between">
                <h3 className="text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
                    Jump Back In <span className="text-xs font-normal text-muted-foreground bg-secondary/50 px-2 py-0.5 rounded-full border border-border/40">Recent</span>
                </h3>
            </div>

            <div className="flex overflow-x-auto pb-4 px-5 gap-3 scrollbar-hide snap-x">
                {displayTools.map((tool) => {
                    const Icon = tool.icon;

                    return (
                        <Link
                            key={tool.name}
                            href={tool.href}
                            className="snap-start flex-shrink-0 w-[160px] h-[140px] p-4 rounded-3xl bg-secondary/30 border border-border/40 relative overflow-hidden group active:scale-95 transition-transform"
                        >
                            {/* Subtle Gradient Background */}
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                            <div className="h-full flex flex-col justify-between relative z-10">
                                <div className="p-2.5 w-fit rounded-2xl bg-background/80 text-primary border border-border/40 shadow-inner group-hover:bg-background transition-colors">
                                    <Icon className="w-5 h-5" />
                                </div>

                                <div>
                                    <h4 className="font-bold text-sm text-foreground line-clamp-2 leading-tight mb-1">
                                        {tool.name}
                                    </h4>
                                    <div className="flex items-center text-[10px] text-muted-foreground group-hover:text-primary transition-colors">
                                        Open Tool <ArrowRight className="w-3 h-3 ml-1 -rotate-45 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                                    </div>
                                </div>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
