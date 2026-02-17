"use client";

import { useState, useMemo, useEffect } from "react";
import { MobileHeader } from "@/components/mobile/mobile-header";
import { m, AnimatePresence } from "framer-motion";
import { Search, Sparkles, Zap, Shield, Minimize, KeyRound, Rocket, ArrowRight, Star, Image, Wrench, Replace } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useUser } from "@/firebase/provider";
import { ALL_TOOLS } from "@/lib/constants";
import { ALL_TOOLS_CATEGORIES } from "@/lib/tools-data";
import { ThemeToggle } from "@/components/theme-toggle";
import dynamic from "next/dynamic";
import { useInView } from "react-intersection-observer";

const NotificationsPopover = dynamic(() => import("./notifications-popover").then(mod => mod.NotificationsPopover), {
    ssr: false,
    loading: () => <div className="w-10 h-10 rounded-full bg-muted animate-pulse" />
});

const RecentActivity = dynamic(() => import("./recent-activity").then(mod => mod.RecentActivity), {
    ssr: false,
    loading: () => <div className="h-32 w-full bg-muted/20 animate-pulse rounded-3xl mb-8" />
});

export function MobileHome() {
    const [searchQuery, setSearchQuery] = useState("");
    const { user } = useUser();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Functional search filtering
    const filteredTools = useMemo(() => {
        if (!searchQuery.trim()) return [];
        return ALL_TOOLS.filter(tool =>
            !tool.isExternal &&
            !tool.desktopOnly &&
            (tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                tool.description.toLowerCase().includes(searchQuery.toLowerCase()))
        ).slice(0, 8);
    }, [searchQuery]);

    // Recommended tools for the "Special for you" section - Dynamic Shuffle
    const recommendedTools = useMemo(() => {
        const mobileTools = ALL_TOOLS.filter(tool => !tool.isExternal && !tool.desktopOnly);

        // During SSR or first client render, return a stable subset
        if (!mounted) return mobileTools.slice(0, 3);

        // Fischer-Yates Shuffle (only on Client after mount)
        const shuffled = [...mobileTools];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled.slice(0, 3);
    }, [mounted]);

    const greeting = useMemo(() => {
        const name = user?.displayName?.split(' ')[0] || "Friend";
        if (!mounted) return `Hello, ${name}`;

        const hour = new Date().getHours();
        if (hour < 12) return `Good Morning, ${name}`;
        if (hour < 18) return `Hello, ${name}`;
        return `Good Evening, ${name}`;
    }, [user, mounted]);

    return (
        <div className="min-h-screen w-full bg-background xl:hidden pb-10 overflow-x-hidden flex flex-col">
            {/* Header / Top Info */}
            <div className="pt-12 px-6 pb-6 space-y-6">
                <div className="flex items-center justify-between">
                    <m.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <h1 className="text-2xl font-black tracking-tight text-foreground">
                            {greeting}
                        </h1>
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1 opacity-60">Ready to build something?</p>
                    </m.div>

                    <div className="flex items-center gap-2">
                        <ThemeToggle />
                        <NotificationsPopover />
                    </div>
                </div>

                {/* Search Bar - Functional */}
                <m.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="relative"
                >
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <input
                        type="text"
                        placeholder="Search for tools..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full h-14 bg-secondary/50 border border-border/40 rounded-2xl pl-12 pr-4 text-sm font-bold focus:bg-secondary focus:border-primary/50 transition-all outline-none"
                    />
                </m.div>

                <m.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="w-full overflow-x-auto scrollbar-hide no-scrollbar snap-x snap-mandatory"
                >
                    <div className="flex gap-2 pb-2 px-1 w-max">
                        {ALL_TOOLS_CATEGORIES.map((cat) => (
                            <Link
                                key={cat.slug}
                                href={`/tools?category=${cat.slug}`}
                                className="flex-shrink-0 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border bg-secondary/30 border-border/40 text-muted-foreground active:scale-95 whitespace-nowrap snap-start"
                            >
                                {cat.title}
                            </Link>
                        ))}
                    </div>
                </m.div>
            </div>

            <div className="px-6 space-y-10 flex-1">
                {/* Search Results */}
                <AnimatePresence>
                    {searchQuery && (
                        <m.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="bg-secondary/30 rounded-3xl border border-white/5 p-4 space-y-3 overflow-hidden"
                        >
                            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground px-2">Search Results</h2>
                            <div className="space-y-2">
                                {filteredTools.length > 0 ? filteredTools.map((tool) => (
                                    <Link
                                        key={tool.href}
                                        href={tool.href}
                                        className="flex items-center gap-4 p-3 bg-background/50 rounded-2xl hover:bg-background transition-colors border border-white/5"
                                    >
                                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                            <tool.icon className="w-5 h-5 text-primary" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold">{tool.name}</p>
                                            <p className="text-[10px] text-muted-foreground line-clamp-1">{tool.description}</p>
                                        </div>
                                    </Link>
                                )) : (
                                    <p className="text-center py-4 text-xs text-muted-foreground">No tools found matching your search.</p>
                                )}
                            </div>
                        </m.div>
                    )}
                </AnimatePresence>

                {/* Hero Feature Cards */}
                <div className="grid grid-cols-2 gap-4">
                    {/* Left Card - Dark Theme (Converters) */}
                    <m.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                        className="aspect-[4/5] bg-[#111] dark:bg-[#000] rounded-[2rem] p-5 flex flex-col justify-between relative overflow-hidden group shadow-xl"
                    >
                        <Link href="/tools?category=converters" className="absolute inset-0 z-20" />
                        <div>
                            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center mb-3">
                                <Replace className="w-5 h-5 text-white" />
                            </div>
                            <h2 className="text-xl font-bold text-white leading-tight">Smart<br />Converters</h2>
                        </div>

                        <div className="flex items-center justify-between mt-4">
                            <span className="text-[10px] font-bold text-black bg-white px-3 py-1.5 rounded-full">Switch</span>
                            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
                                <ArrowRight className="w-4 h-4 text-black" />
                            </div>
                        </div>
                    </m.div>

                    {/* Right Card - Light Theme (Power Utilities) */}
                    <m.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 }}
                        className="aspect-[4/5] bg-white dark:bg-zinc-100 rounded-[2rem] p-5 flex flex-col justify-between relative overflow-hidden group shadow-xl"
                    >
                        <Link href="/tools?category=productivity" className="absolute inset-0 z-20" />
                        <div>
                            <div className="w-10 h-10 rounded-full bg-black/5 flex items-center justify-center mb-3">
                                <Wrench className="w-5 h-5 text-black" />
                            </div>
                            <h2 className="text-xl font-bold text-black leading-tight">Power<br />Utilities</h2>
                        </div>

                        <div className="flex items-center justify-between mt-4">
                            <span className="text-[10px] font-bold text-white bg-black px-3 py-1.5 rounded-full">Manage</span>
                            <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center">
                                <ArrowRight className="w-4 h-4 text-white" />
                            </div>
                        </div>
                    </m.div>
                </div>

                {/* Jump Back In - Recent Activity */}
                <RecentActivity />

                {/* Special for You Section - (Morning Gratitude style) */}
                <div className="space-y-6 pb-20">
                    <div className="flex items-center justify-between px-2">
                        <h2 className="text-lg font-bold tracking-tight text-foreground">Special for you</h2>
                        <Link href="/tools" className="text-xs font-bold text-muted-foreground hover:text-primary transition-colors">
                            See all
                        </Link>
                    </div>

                    <RecommendationList tools={recommendedTools} />
                </div>
            </div>
        </div>
    );
}

function RecommendationList({ tools }: { tools: any[] }) {
    const { ref, inView } = useInView({
        triggerOnce: true,
        rootMargin: '100px 0px',
    });

    return (
        <div ref={ref} className="space-y-3 min-h-[300px]">
            {inView ? tools.map((tool, idx) => (
                <m.div
                    key={tool.href}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * idx }}
                >
                    <Link
                        href={tool.href}
                        className="flex items-center justify-between p-5 bg-muted/50 rounded-[2rem] hover:opacity-90 transition-opacity group"
                    >
                        <div className="flex flex-col gap-2">
                            <h4 className="text-base font-bold text-foreground">{tool.name}</h4>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold text-primary bg-primary/10 px-3 py-1 rounded-full uppercase tracking-wider">
                                    Utility
                                </span>
                                {idx < 2 && (
                                    <span className="text-[10px] font-bold text-muted-foreground">Top Tool</span>
                                )}
                            </div>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-white dark:bg-secondary shadow-sm flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                            <ArrowRight className="w-4 h-4" />
                        </div>
                    </Link>
                </m.div>
            )) : (
                <div className="w-full h-32 bg-muted/10 animate-pulse rounded-[2rem]" />
            )}
        </div>
    );
}
