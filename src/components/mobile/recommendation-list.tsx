"use client";

import { useMemo } from "react";
import { m } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useInView } from "react-intersection-observer";
import { ALL_TOOLS } from "@/lib/constants";

export default function RecommendationList() {
    const { ref, inView } = useInView({
        triggerOnce: true,
        rootMargin: '100px 0px',
    });

    // Handle shuffling and selection inside the lazy component
    const recommendedTools = useMemo(() => {
        const mobileTools = ALL_TOOLS.filter(tool => !tool.isExternal && !tool.desktopOnly);
        // Fischer-Yates Shuffle
        const shuffled = [...mobileTools];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled.slice(0, 3);
    }, []);

    return (
        <div ref={ref} className="space-y-3 min-h-[400px]">
            {inView ? recommendedTools.map((tool, idx) => (
                <m.div
                    key={tool.href}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
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
                <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="w-full h-[98px] bg-muted/10 animate-pulse rounded-[2rem]" />
                    ))}
                </div>
            )}
        </div>
    );
}
