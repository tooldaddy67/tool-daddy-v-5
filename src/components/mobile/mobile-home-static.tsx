import { ArrowRight, Replace, Wrench } from "lucide-react";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle"; // This is likely a client component but we'll see

export function MobileHomeStatic() {
    return (
        <div
            id="mobile-ssr-home"
            className="min-h-screen w-full bg-background xl:hidden pb-10 overflow-x-hidden flex flex-col relative z-20 transition-opacity duration-300"
        >
            {/* Header / Top Info */}
            <div className="pt-12 px-6 pb-6 space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-black tracking-tight text-foreground glow-text">
                            Hello, Friend
                        </h1>
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1 opacity-60">Ready to build something?</p>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Static placeholders for dynamic bits */}
                        <div className="w-10 h-10 rounded-full bg-muted/20" />
                        <div className="w-10 h-10 rounded-full bg-muted/20" />
                    </div>
                </div>

                {/* Search Bar Placeholder */}
                <div className="relative">
                    <div className="w-full h-14 bg-secondary/50 border border-border/40 rounded-2xl flex items-center px-4">
                        <div className="w-5 h-5 bg-muted/20 rounded mr-3" />
                        <span className="text-sm font-bold text-muted-foreground opacity-50">Search for tools...</span>
                    </div>
                </div>

                {/* Categories Placeholder */}
                <div className="flex gap-2 overflow-hidden">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="px-4 py-2 rounded-xl border bg-secondary/30 border-border/40 w-24 h-8 animate-pulse" />
                    ))}
                </div>
            </div>

            <div className="px-6 space-y-10 flex-1">
                {/* Hero Feature Cards */}
                <div className="grid grid-cols-2 gap-4">
                    {/* Left Card */}
                    <div className="aspect-[4/5] bg-zinc-900 rounded-[2rem] p-5 flex flex-col justify-between relative shadow-xl">
                        <div>
                            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center mb-3">
                                <Replace className="w-5 h-5 text-white" />
                            </div>
                            <h3 className="text-xl font-bold text-white leading-tight">Smart<br />Converters</h3>
                        </div>
                        <div className="flex items-center justify-between mt-4">
                            <span className="text-[10px] font-bold text-black bg-white px-3 py-1.5 rounded-full">Switch</span>
                            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
                                <ArrowRight className="w-4 h-4 text-black" />
                            </div>
                        </div>
                    </div>

                    {/* Right Card */}
                    <div className="aspect-[4/5] bg-zinc-100 rounded-[2rem] p-5 flex flex-col justify-between relative shadow-xl">
                        <div>
                            <div className="w-10 h-10 rounded-full bg-black/5 flex items-center justify-center mb-3">
                                <Wrench className="w-5 h-5 text-black" />
                            </div>
                            <h3 className="text-xl font-bold text-black leading-tight">Power<br />Utilities</h3>
                        </div>
                        <div className="flex items-center justify-between mt-4">
                            <span className="text-[10px] font-bold text-white bg-black px-3 py-1.5 rounded-full">Manage</span>
                            <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center">
                                <ArrowRight className="w-4 h-4 text-white" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Jump Back In placeholder */}
                <div className="h-32 w-full bg-muted/10 rounded-3xl animate-pulse" />

                {/* Special for You Placeholder */}
                <div className="space-y-6 pb-20">
                    <div className="flex items-center justify-between px-2">
                        <h2 className="text-lg font-bold tracking-tight text-foreground">Special for you</h2>
                    </div>
                    <div className="space-y-3">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="w-full h-[98px] bg-muted/10 rounded-[2rem] animate-pulse" />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
