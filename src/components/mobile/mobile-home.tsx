"use client";

import { useState, useMemo } from "react";
import { MobileHeader } from "@/components/mobile/mobile-header";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Sparkles, Zap, Shield, Minimize, KeyRound, Rocket, ArrowRight, Star } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useUser } from "@/firebase";
import { ALL_TOOLS } from "@/lib/constants";
import { NotificationsPopover } from "./notifications-popover";
import { ThemeToggle } from "@/components/theme-toggle";

export function MobileHome() {
    const [searchQuery, setSearchQuery] = useState("");
    const { user } = useUser();

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

    // Recommended tools for the "Special for you" section
    const recommendedTools = useMemo(() => {
        return ALL_TOOLS.filter(tool => !tool.isExternal && !tool.desktopOnly).slice(0, 6);
    }, []);

    const greeting = useMemo(() => {
        const hour = new Date().getHours();
        const name = user?.displayName?.split(' ')[0] || "Friend";
        if (hour < 12) return `Good Morning, ${name}`;
        if (hour < 18) return `Hello, ${name}`;
        return `Good Evening, ${name}`;
    }, [user]);

    return (
        <div className="min-h-screen w-full bg-background md:hidden pb-44 overflow-x-hidden flex flex-col">
            {/* Header / Top Info */}
            <div className="pt-12 px-6 pb-6 space-y-6">
                <div className="flex items-center justify-between">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <h1 className="text-2xl font-black tracking-tight text-foreground">
                            {greeting}
                        </h1>
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1 opacity-60">Ready to build something?</p>
                    </motion.div>

                    <div className="flex items-center gap-2">
                        <ThemeToggle />
                        <NotificationsPopover />
                    </div>
                </div>

                {/* Search Bar - Functional */}
                <motion.div
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
                        className="w-full h-14 bg-secondary/50 border border-white/5 rounded-2xl pl-12 pr-4 text-sm font-bold focus:bg-secondary focus:border-primary/50 transition-all outline-none"
                    />
                </motion.div>
            </div>

            <div className="px-6 space-y-10 flex-1">
                {/* Search Results */}
                <AnimatePresence>
                    {searchQuery && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="bg-secondary/30 rounded-3xl border border-white/5 p-4 space-y-3 overflow-hidden"
                        >
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground px-2">Search Results</h3>
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
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Hero Feature Cards */}
                <div className="grid grid-cols-2 gap-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                        className="aspect-square bg-blue-600 rounded-[2.5rem] p-6 flex flex-col justify-between relative overflow-hidden group"
                    >
                        <Link href="/image-compressor" className="absolute inset-0 z-20" />
                        <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                            <Minimize className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-white leading-tight">Image <br /> Compressor</h3>
                            <div className="mt-4 flex items-center gap-2">
                                <span className="text-[10px] font-bold text-white/70 uppercase">Optimize</span>
                                <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center">
                                    <Sparkles className="w-3 h-3 text-white" />
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 }}
                        className="aspect-square bg-secondary rounded-[2.5rem] p-6 border border-white/5 flex flex-col justify-between relative overflow-hidden group"
                    >
                        <Link href="/password-generator" className="absolute inset-0 z-20" />
                        <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center">
                            <KeyRound className="w-6 h-6 text-purple-400" />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-foreground leading-tight">Secure <br /> Vault</h3>
                            <div className="mt-4 flex items-center gap-2">
                                <span className="text-[10px] font-bold text-muted-foreground uppercase">Generate</span>
                                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                                    <ArrowRight className="w-3 h-3 text-primary" />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Special for You Section */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-black tracking-tight tracking-tighter uppercase font-headline">Special for you</h2>
                        <Link href="/tools" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1">
                            See All <ArrowRight className="w-3 h-3" />
                        </Link>
                    </div>

                    <div className="space-y-4">
                        {recommendedTools.map((tool, idx) => (
                            <motion.div
                                key={tool.href}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.4 + (idx * 0.1) }}
                            >
                                <Link
                                    href={tool.href}
                                    className="flex items-center gap-4 p-4 bg-secondary/30 rounded-3xl border border-white/5 group hover:bg-secondary/50 transition-all"
                                >
                                    <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <tool.icon className="w-7 h-7 text-primary" />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="text-sm font-black text-foreground">{tool.name}</h4>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-[9px] font-bold text-muted-foreground uppercase py-0.5 px-2 bg-white/5 rounded-full">Utility</span>
                                            {idx < 2 && (
                                                <span className="text-[9px] font-bold text-primary uppercase">Top Tool</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="w-10 h-10 rounded-full bg-background flex items-center justify-center border border-white/5 shadow-inner group-hover:bg-primary/20 transition-colors">
                                        <Zap className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
