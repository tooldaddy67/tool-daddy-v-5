import { cn } from '@/lib/utils';
import { ArrowUpRight, Check, type LucideIcon } from 'lucide-react';
import Link from 'next/link';
import { useSettings } from './settings-provider';

interface ToolCardProps {
  href: string;
  name: string;
  description: string;
  icon: LucideIcon;
  isExternal?: boolean;
  variantIndex?: number;
  compact?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

const ICON_VARIANTS = [
  { bg: 'bg-blue-500/10', text: 'text-blue-500', btn: 'bg-blue-600 hover:bg-blue-700', shadow: '59, 130, 246' },
  { bg: 'bg-emerald-500/10', text: 'text-emerald-500', btn: 'bg-emerald-600 hover:bg-emerald-700', shadow: '16, 185, 129' },
  { bg: 'bg-amber-500/10', text: 'text-amber-500', btn: 'bg-amber-600 hover:bg-amber-700', shadow: '245, 158, 11' },
  { bg: 'bg-purple-500/10', text: 'text-purple-500', btn: 'bg-purple-600 hover:bg-purple-700', shadow: '168, 85, 247' },
  { bg: 'bg-rose-500/10', text: 'text-rose-500', btn: 'bg-rose-600 hover:bg-rose-700', shadow: '244, 63, 94' },
  { bg: 'bg-indigo-500/10', text: 'text-indigo-500', btn: 'bg-indigo-600 hover:bg-indigo-700', shadow: '79, 70, 229' },
  { bg: 'bg-red-500/10', text: 'text-red-500', btn: 'bg-red-600 hover:bg-red-700', shadow: '239, 68, 68' },
  { bg: 'bg-cyan-500/10', text: 'text-cyan-500', btn: 'bg-cyan-600 hover:bg-cyan-700', shadow: '6, 182, 212' },
  { bg: 'bg-orange-500/10', text: 'text-orange-500', btn: 'bg-orange-600 hover:bg-orange-700', shadow: '249, 115, 22' },
];

export default function ToolCard({ href, name, description, icon: Icon, isExternal, variantIndex = 0, compact = false, className, style }: ToolCardProps) {
  const { settings } = useSettings();
  const variant = ICON_VARIANTS[variantIndex % ICON_VARIANTS.length];

  const cardContent = (
    <div
      className={cn(
        "tool-island flex flex-col justify-between transition-all duration-500",
        compact
          ? "bg-white dark:bg-zinc-900 border-black dark:border-white border-2 shadow-[4px_4px_0px_hsl(var(--primary))]"
          : "bg-card border border-border shadow-sm hover:-translate-y-2",
        "group relative overflow-visible",
        className
      )}
      style={{
        '--hover-shadow-color': 'var(--primary)',
        height: compact ? '100%' : 'calc(320px * var(--spacing-multiplier))',
        width: compact ? '160px' : undefined,
        minHeight: compact ? '190px' : undefined,
        padding: compact ? '1rem' : 'calc(2rem * var(--spacing-multiplier))',
        borderRadius: compact ? `${settings.cardRoundness}px` : 'var(--radius)',
        ...style
      } as React.CSSProperties}
    >
      {/* Dynamic Background Glow on Hover (Desktop Only) */}
      {!compact && (
        <div
          className="absolute inset-0 transition-opacity duration-500 opacity-0 group-hover:opacity-100 pointer-events-none -z-10"
          style={{
            borderRadius: 'var(--radius)',
            boxShadow: `0 20px 50px -10px hsl(var(--primary) / var(--card-glow-strength))`,
          }}
        />
      )}

      {/* Top Bar - Icon & Status */}
      <div className={cn("flex items-center justify-between", compact ? "mb-2" : "mb-4")}>
        <div
          className={cn(
            "flex items-center justify-center transition-transform group-hover:scale-110",
            compact ? "bg-[#141c2d] p-2 rounded-xl border border-white/5 shadow-inner" : "bg-primary/10 p-2.5 rounded-[calc(var(--radius)*0.7)]"
          )}
        >
          <Icon className={cn(compact ? "text-primary h-5 w-5" : "text-primary h-5 w-5")} />
        </div>
        <div className={cn(
          "rounded-full flex items-center justify-center opacity-40 group-hover:opacity-100 transition-opacity",
          compact ? "w-6 h-6 bg-white/5 border border-white/5" : "w-8 h-8 bg-zinc-100 dark:bg-white/5"
        )}>
          <Check className={cn(compact ? "text-white/40 w-3 h-3" : "text-muted-foreground w-4 h-4")} />
        </div>
      </div>

      {/* Title & Description */}
      <div className={cn("space-y-1.5 flex-1 overflow-hidden", compact ? "mb-3" : "mb-4 space-y-3")}>
        <h3
          className={cn(
            "font-black tracking-tight transition-colors leading-tight text-foreground",
            compact ? "text-lg" : "text-xl group-hover:text-primary"
          )}
          style={{ textShadow: compact ? 'none' : 'var(--text-glow)' }}
        >
          {name}
        </h3>
        <p className={cn(
          "text-muted-foreground leading-tight line-clamp-2 font-medium",
          compact ? "text-sm" : "text-[13px]"
        )}>
          {description}
        </p>
      </div>

      {/* CTA (Launch Button) */}
      <div className={cn("w-full")}>
        <div
          className={cn(
            "w-full flex items-center justify-center gap-1.5 font-black transition-all active:scale-[0.98]",
            compact
              ? "bg-primary text-primary-foreground h-10 text-[12px] border border-primary/50 shadow-[0_0_15px_hsl(var(--primary)/0.2)] hover:brightness-110"
              : "bg-primary text-primary-foreground hover:bg-primary/90 h-11 text-sm rounded-[calc(var(--radius)*0.7)]"
          )}
          style={{ borderRadius: compact ? `calc(${settings.cardRoundness}px * 0.7)` : undefined }}
        >
          <span className="tracking-tight uppercase text-white">Launch</span>
          <ArrowUpRight className={cn(
            "transition-transform",
            compact ? "w-4 h-4 text-white" : "w-4 h-4 opacity-70 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          )} />
        </div>
      </div>
    </div>
  )

  if (isExternal) {
    return (
      <Link
        href={`/external-redirect?to=${encodeURIComponent(href)}&name=${encodeURIComponent(name)}`}
        className="block h-full"
      >
        {cardContent}
      </Link>
    )
  }

  return (
    <Link href={href} prefetch={false} className="block h-full">
      {cardContent}
    </Link>
  );
}
