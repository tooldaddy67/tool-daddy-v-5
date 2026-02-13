"use client";

import { Monitor, Smartphone, ArrowLeft, Ghost } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useEffect, useState } from "react";

const ROASTS = [
    "Put that toy away. This tool is for real screens, not your cracked thumb-mobile.",
    "Your screen is too small for this much brain power. Go find a monitor or go back to TikTok.",
    "Do you really think you can do pro work on a 6-inch vertical slab? Get a life and a Desktop.",
    "Error 402: User too broke for a monitor. This tool requires adult-sized pixels.",
    "Stop trying to use a scalpel on a pocket calculator. Switch to a PC, you casual.",
    "Your display resolution is lower than my self-esteem. Get a real computer.",
    "This tool doesn't fit in your pocket. Go find a desk and act like a professional.",
];

export function DesktopOnlyRoast() {
    const [roast, setRoast] = useState("");

    useEffect(() => {
        setRoast(ROASTS[Math.floor(Math.random() * ROASTS.length)]);
    }, []);

    return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] p-8 text-center animate-in fade-in zoom-in duration-500">
            <div className="relative mb-8">
                <div className="w-24 h-24 bg-red-500/10 rounded-3xl flex items-center justify-center border border-red-500/20">
                    <Monitor className="w-12 h-12 text-red-500" />
                </div>
                <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-background rounded-full flex items-center justify-center border border-border shadow-xl">
                    <Smartphone className="w-5 h-5 text-muted-foreground line-through opacity-50" />
                </div>
            </div>

            <div className="space-y-4 max-w-sm">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-500/10 border border-red-500/20 rounded-full mb-2">
                    <Ghost className="w-3 h-3 text-red-500" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-red-500">Emotional Damage</span>
                </div>

                <h2 className="text-3xl font-black font-headline text-primary tracking-tight leading-tight">
                    DESKTOP ONLY, <br />
                    <span className="text-red-500 uppercase">NOOB.</span>
                </h2>

                <p className="text-muted-foreground text-sm font-medium leading-relaxed italic">
                    "{roast}"
                </p>
            </div>

            <div className="mt-12 flex flex-col gap-3 w-full max-w-[200px]">
                <Button asChild variant="default" className="rounded-2xl h-12 font-bold shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95">
                    <Link href="/">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Go Back Home
                    </Link>
                </Button>
                <p className="text-[9px] text-muted-foreground uppercase tracking-widest opacity-50 font-bold">
                    Or get a real computer
                </p>
            </div>
        </div>
    );
}
