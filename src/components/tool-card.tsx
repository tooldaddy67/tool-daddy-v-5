import { cn } from '@/lib/utils';
import { ArrowUpRight, Check, type LucideIcon } from 'lucide-react';
import Link from 'next/link';

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
  const variant = ICON_VARIANTS[variantIndex % ICON_VARIANTS.length];

  const cardContent = (
    <div
      className={cn(
        "tool-island flex flex-col justify-between transition-all duration-500",
        "bg-card border border-border",
        "shadow-sm hover:-translate-y-2 group relative overflow-visible",
        className
      )}
      style={{
        '--hover-shadow-color': 'var(--primary)',
        height: compact ? 'auto' : 'calc(320px * var(--spacing-multiplier))',
        minHeight: compact ? '160px' : undefined,
        padding: compact ? '1.25rem' : 'calc(2rem * var(--spacing-multiplier))',
        borderRadius: 'var(--radius)',
        ...style
      } as React.CSSProperties}
    >
      {/* Dynamic Background Glow on Hover */}
      <div
        className="absolute inset-0 transition-opacity duration-500 opacity-0 group-hover:opacity-100 pointer-events-none -z-10"
        style={{
          borderRadius: 'var(--radius)',
          boxShadow: `0 20px 50px -10px hsl(var(--primary) / var(--card-glow-strength))`,
        }}
      />

      {/* Top Bar - Icon & Status */}
      <div className={cn("flex items-center justify-between", compact ? "mb-3" : "mb-4")}>
        <div
          className={cn(
            "flex items-center justify-center transition-transform group-hover:scale-110 bg-primary/10",
            compact ? "p-2" : "p-2.5"
          )}
          style={{ borderRadius: 'calc(var(--radius) * 0.7)' }}
        >
          <Icon className={cn("text-primary", compact ? "h-4 w-4" : "h-5 w-5")} />
        </div>
        <div className={cn(
          "rounded-full bg-zinc-100 dark:bg-white/5 flex items-center justify-center opacity-40 group-hover:opacity-100 transition-opacity",
          compact ? "w-6 h-6" : "w-8 h-8"
        )}>
          <Check className={cn("text-muted-foreground", compact ? "w-3 h-3" : "w-4 h-4")} />
        </div>
      </div>

      {/* Title & Description (30% Secondary/Text) */}
      <div className={cn("space-y-2 flex-1 overflow-hidden", compact ? "mb-3" : "mb-4 space-y-3")}>
        <h3
          className={cn(
            "font-bold tracking-tight text-foreground group-hover:text-primary transition-colors leading-[1.2]",
            compact ? "text-sm" : "text-xl"
          )}
          style={{ textShadow: 'var(--text-glow)' }}
        >
          {name}
        </h3>
        <p className={cn(
          "text-muted-foreground leading-relaxed line-clamp-2",
          compact ? "text-[10px]" : "text-[13px]"
        )}>
          {description}
        </p>
      </div>

      {/* CTA (10% Accent - Rule 60-30-10) */}
      <div className="w-full">
        <div
          className={cn(
            "w-full flex items-center justify-center gap-2",
            "font-bold transition-all active:scale-[0.98]",
            "bg-primary text-primary-foreground hover:bg-primary/90",
            compact ? "h-8 text-[10px]" : "h-11 text-sm"
          )}
          style={{ borderRadius: 'calc(var(--radius) * 0.7)' }}
        >
          <span className="tracking-tight">Launch</span>
          <ArrowUpRight className={cn("opacity-70 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform", compact ? "w-3 h-3" : "w-4 h-4")} />
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
