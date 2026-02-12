"use client";

import { MobileHeader } from "./mobile-header";
import { RecentActivity } from "./recent-activity";
import { MobileNav } from "./mobile-nav";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { FeaturedTools } from "../home/featured-tools";
import { BentoGrid } from "../home/bento-grid";
import { HeroSection } from "../home/hero-section";
import DynamicToolCard from "@/components/dynamic-tool-card";
import { Notebook, ListTodo, Bot, Music, Timer, Video } from "lucide-react";

// Manually defining a mobile specific grid for "All Tools" preview
// The user wants "All Tools" dashboard look.
const MOBILE_TOOLS = [
    {
        name: 'Simple Notepad',
        description: 'Todo-List', // Matching the image subtitle style roughly
        href: '/simple-notepad',
        icon: Notebook,
    },
    {
        name: 'Timer & Stopwatch',
        description: 'Timer & Stopwatch',
        href: '/timer-stopwatch',
        icon: Timer,
    },
    {
        name: 'AI Image Enhancer',
        description: 'To-Do List',
        href: '/ai-image-enhancer',
        icon: Bot,
    },
    {
        name: 'Video Compressor',
        description: 'Compress Video',
        href: '/video-compressor',
        icon: Video,
    },
];

export function MobileHome() {
    return (
        <div className="min-h-screen bg-[#0B0B0F] pb-32 md:hidden">
            <MobileHeader />

            {/* Search Bar */}
            <div className="px-5 mb-8">
                <div className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full opacity-30 group-hover:opacity-50 blur transition duration-500"></div>
                    <div className="relative bg-[#13131A] rounded-full flex items-center shadow-[0_0_15px_rgba(168,85,247,0.15)] p-1">
                        <Search className="absolute left-4 w-5 h-5 text-muted-foreground" />
                        <Input
                            placeholder="Search tools..."
                            className="pl-12 h-14 w-full bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 text-base placeholder:text-muted-foreground/50 rounded-full"
                        />
                    </div>
                </div>
            </div>

            <RecentActivity />

            {/* All Tools Grid (Mobile App Style) */}
            <div className="px-5 space-y-6">
                <h3 className="text-xl font-bold tracking-tight text-white mb-4">All Tools</h3>
                <div className="grid grid-cols-2 gap-4">
                    {MOBILE_TOOLS.map((tool, i) => (
                        <div key={i} className="group relative bg-[#13131A] rounded-[2rem] p-5 flex flex-col gap-4 border border-white/5 active:scale-95 transition-transform overflow-hidden shadow-lg">
                            {/* Purple Bottom Glow */}
                            <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 opacity-80 shadow-[0_0_15px_rgba(168,85,247,0.5)]" />

                            <div className="p-3 w-fit rounded-2xl bg-[#1E1E26] text-primary group-hover:text-white transition-colors border border-white/5 shadow-inner">
                                <tool.icon className="w-6 h-6" />
                            </div>
                            <div>
                                <h4 className="font-bold text-base text-white line-clamp-1 mb-1">{tool.name}</h4>
                                <p className="text-xs text-muted-foreground line-clamp-1">{tool.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <MobileNav />
        </div>
    );
}
