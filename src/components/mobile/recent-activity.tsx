"use client";

import { useHistory } from "@/hooks/use-history";
import { Clock, FileText, Image as ImageIcon, Music, Bot } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function RecentActivity() {
    const { history, isLoaded } = useHistory();

    // Mock icons based on tool name (simple heuristic)
    const getToolIcon = (name: string) => {
        const n = name.toLowerCase();
        if (n.includes('pdf') || n.includes('note')) return FileText;
        if (n.includes('image') || n.includes('photo')) return ImageIcon;
        if (n.includes('music') || n.includes('audio')) return Music;
        if (n.includes('ai')) return Bot;
        return Clock;
    };

    if (!isLoaded) return null; // Or a loading skeleton

    const displayHistory = history.slice(0, 5); // Show top 5

    if (displayHistory.length === 0) {
        return (
            <div className="px-4 mb-8 md:hidden">
                <h3 className="text-lg font-bold mb-4">Recent Activity</h3>
                <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-center text-muted-foreground">
                    <p>No recent activity yet.</p>
                    <p className="text-sm">Start using tools to see them here!</p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full mb-10 md:hidden">
            <div className="px-5 mb-4 flex items-center justify-between">
                <h3 className="text-xl font-bold tracking-tight text-white">Recent Activity</h3>
                <Link href="/history" className="text-sm text-muted-foreground hover:text-white transition-colors">See all</Link>
            </div>

            {/* Horizontal Scroll Container */}
            <div className="flex overflow-x-auto pb-6 px-5 gap-4 scrollbar-hide snap-x">
                {displayHistory.map((item) => {
                    const Icon = getToolIcon(item.tool);

                    return (
                        <div
                            key={item.id}
                            className="snap-start flex-shrink-0 w-[240px] p-5 rounded-[2rem] bg-[#13131A] border border-white/5 flex flex-col gap-4 relative overflow-hidden group shadow-lg"
                        >
                            {/* Left Purple Glow Bar */}
                            <div className="absolute top-0 bottom-0 left-0 w-1.5 bg-gradient-to-b from-purple-500 to-pink-500 shadow-[0_0_15px_rgba(168,85,247,0.4)]" />

                            <div className="flex items-start gap-4">
                                <div className="p-2.5 rounded-2xl bg-[#1E1E26] text-primary border border-white/5 shadow-inner">
                                    <Icon className="w-5 h-5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-white line-clamp-1">{item.tool}</p>
                                    <p className="text-[10px] text-muted-foreground mt-0.5">
                                        {new Date(item.timestamp).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>

                            <div className="bg-[#1E1E26]/50 rounded-xl px-3 py-2 border border-white/5">
                                <p className="text-xs text-muted-foreground line-clamp-1">
                                    Action completed successfully
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
