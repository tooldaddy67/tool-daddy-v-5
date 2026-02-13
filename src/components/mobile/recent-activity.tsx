"use client";

import { useHistory } from "@/hooks/use-history";
import Link from "next/link";
import { ALL_TOOLS_CATEGORIES } from "@/lib/tools-data";
import { Clock, ArrowRight } from "lucide-react";

export function RecentActivity() {
    const { history, isLoaded } = useHistory();

    const getToolDetails = (name: string) => {
        for (const cat of ALL_TOOLS_CATEGORIES) {
            const tool = cat.tools.find(t => t.name === name);
            if (tool) return tool;
        }
        return { name, icon: Clock, href: '/', description: 'Tool' };
    };

    if (!isLoaded) return null;

    // Deduplicate history by tool name for "Jump Back In" purposes
    const uniqueHistory = Array.from(new Set(history.map(h => h.tool)))
        .map(toolName => history.find(h => h.tool === toolName))
        .filter(Boolean)
        .slice(0, 10);

    if (uniqueHistory.length === 0) return null;

    return (
        <div className="w-full mb-8 md:hidden">
            <div className="px-5 mb-4 flex items-center justify-between">
                <h3 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
                    Jump Back In <span className="text-xs font-normal text-muted-foreground bg-white/5 px-2 py-0.5 rounded-full border border-white/5">Recent</span>
                </h3>
            </div>

            <div className="flex overflow-x-auto pb-4 px-5 gap-3 scrollbar-hide snap-x">
                {uniqueHistory.map((item) => {
                    if (!item) return null;
                    const tool = getToolDetails(item.tool);
                    const Icon = tool.icon;

                    return (
                        <Link
                            key={item.id}
                            href={tool.href}
                            className="snap-start flex-shrink-0 w-[160px] h-[140px] p-4 rounded-3xl bg-[#13131A] border border-white/5 relative overflow-hidden group active:scale-95 transition-transform"
                        >
                            {/* Subtle Gradient Background */}
                            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                            {/* Top Color Line */}
                            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-70" />

                            <div className="h-full flex flex-col justify-between relative z-10">
                                <div className="p-2.5 w-fit rounded-2xl bg-[#1E1E26] text-primary border border-white/5 shadow-inner group-hover:bg-[#252530] transition-colors">
                                    <Icon className="w-5 h-5" />
                                </div>

                                <div>
                                    <h4 className="font-bold text-sm text-white line-clamp-2 leading-tight mb-1">
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
