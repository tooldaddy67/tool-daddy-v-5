import { cn } from '@/lib/utils';
import { ArrowUpRight, Check, type LucideIcon } from 'lucide-react';
import Link from 'next/link';

interface MobileToolCardStaticProps {
    href: string;
    name: string;
    description: string;
    icon: LucideIcon;
    variantIndex?: number;
    className?: string;
    style?: React.CSSProperties;
}

/**
 * SUPER-PERFORMANT SERVER COMPONENT VERSION OF TOOLCARD
 * Used to achieve <1.5s LCP on mobile by bypassing Client-side hydration.
 */
export function MobileToolCardStatic({
    href,
    name,
    description,
    icon: Icon,
    variantIndex = 0,
    className,
    style
}: MobileToolCardStaticProps) {

    // Note: We use pure CSS variables defined in RootLayout/SettingsProvider
    // to ensure style matching without needing Client hooks.

    return (
        <Link
            href={href}
            prefetch={false}
            className="block h-full"
        >
            <div
                className={cn(
                    "tool-island flex flex-col justify-between",
                    "bg-white dark:bg-zinc-900 border-black dark:border-white border-2 shadow-[4px_4px_0px_hsl(var(--primary))]",
                    "group relative overflow-visible",
                    className
                )}
                style={{
                    '--hover-shadow-color': 'var(--primary)',
                    height: '100%',
                    width: '160px',
                    minHeight: '190px',
                    padding: '1rem',
                    borderRadius: 'var(--radius, 12px)',
                    ...style
                } as React.CSSProperties}
            >
                {/* Top Bar - Icon & Status */}
                <div className="flex items-center justify-between mb-2">
                    <div
                        className="flex items-center justify-center bg-[#141c2d] p-2 rounded-xl border border-white/5 shadow-inner"
                    >
                        <Icon className="text-primary h-5 w-5" />
                    </div>
                    <div className="rounded-full flex items-center justify-center opacity-40 bg-white/5 border border-white/5 w-6 h-6">
                        <Check className="text-white/40 w-3 h-3" />
                    </div>
                </div>

                {/* Title & Description */}
                <div className="space-y-1.5 flex-1 overflow-hidden mb-3">
                    <h3 className="font-black tracking-tight leading-tight text-foreground text-lg">
                        {name}
                    </h3>
                    <p className="text-muted-foreground leading-tight line-clamp-2 font-medium text-sm">
                        {description}
                    </p>
                </div>

                {/* CTA (Launch Button) */}
                <div className="w-full">
                    <div
                        className="w-full flex items-center justify-center gap-1.5 font-black bg-primary text-primary-foreground h-10 text-[12px] border border-primary/50 shadow-[0_0_15px_hsl(var(--primary)/0.2)] rounded-lg"
                    >
                        <span className="tracking-tight uppercase text-white">Launch</span>
                        <ArrowUpRight className="w-4 h-4 text-white" />
                    </div>
                </div>
            </div>
        </Link>
    );
}
