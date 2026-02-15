import { cn } from '@/lib/utils';
import { ArrowUpRight, Check, LucideIcon } from 'lucide-react';
import Link from 'next/link';
import React from 'react';

interface ToolCardSSRProps {
    href: string;
    name: string;
    description: string;
    icon: LucideIcon;
    variantIndex?: number;
}

/**
 * ULTRA-PERFORMANT SERVER COMPONENT VERSION OF TOOLCARD
 * Used to eliminate the 3s hydration delay on mobile LCP.
 * Zero JS, Zero Client-side Hooks.
 */
export function MobileToolCardSSR({ href, name, description, icon: Icon, variantIndex = 0 }: ToolCardSSRProps) {
    // We use standard link and hardcoded styles that match the ToolCard defaults
    // This ensures the LCP is painted IMMEDIATELY upon HTML arrival.

    return (
        <Link href={href} className="block h-full">
            <div
                className="tool-island flex flex-col justify-between bg-white dark:bg-zinc-900 border-black dark:border-white border-2 shadow-[4px_4px_0px_hsl(var(--primary))] group relative overflow-visible p-4 h-full min-h-[190px] w-[160px]"
                style={{
                    borderRadius: '12px', // Default roundness for SSR
                }}
            >
                {/* Top Bar */}
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center justify-center bg-[#141c2d] p-2 rounded-xl border border-white/5 shadow-inner">
                        <Icon className="text-primary h-5 w-5" />
                    </div>
                    <div className="w-6 h-6 bg-white/5 border border-white/5 rounded-full flex items-center justify-center opacity-40">
                        <Check className="text-white/40 w-3 h-3" />
                    </div>
                </div>

                {/* Title & Description */}
                <div className="space-y-1.5 flex-1 overflow-hidden mb-3">
                    <h3 className="font-black tracking-tight transition-colors leading-tight text-foreground text-lg">
                        {name}
                    </h3>
                    <p className="text-muted-foreground leading-tight line-clamp-2 font-medium text-sm">
                        {description}
                    </p>
                </div>

                {/* CTA */}
                <div className="w-full">
                    <div className="w-full flex items-center justify-center gap-1.5 font-black bg-primary text-primary-foreground h-10 text-[12px] border border-primary/50 shadow-[0_0_15px_hsl(var(--primary)/0.2)] rounded-lg">
                        <span className="tracking-tight uppercase text-white font-bold">Launch</span>
                        <ArrowUpRight className="w-4 h-4 text-white" />
                    </div>
                </div>
            </div>
        </Link>
    );
}
