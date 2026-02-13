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

export default function ToolCard({ href, name, description, icon: Icon, isExternal, variantIndex = 0 }: ToolCardProps) {
  const variant = ICON_VARIANTS[variantIndex % ICON_VARIANTS.length];

  const cardContent = (
    <div
      className={cn(
        "tool-island flex flex-col justify-between transition-all duration-500",
        "bg-card border border-border",
        "shadow-sm hover:-translate-y-2 group relative overflow-visible"
      )}
      style={{
        '--hover-shadow-color': 'var(--primary)',
        height: 'calc(320px * var(--spacing-multiplier))',
        padding: 'calc(2rem * var(--spacing-multiplier))',
        borderRadius: 'var(--radius)',
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
      <div className="flex items-center justify-between mb-4">
        <div
          className={cn("p-2.5 flex items-center justify-center transition-transform group-hover:scale-110 bg-primary/10")}
          style={{ borderRadius: 'calc(var(--radius) * 0.7)' }}
        >
          <Icon className={cn("h-5 w-5 text-primary")} />
        </div>
        <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-white/5 flex items-center justify-center opacity-40 group-hover:opacity-100 transition-opacity">
          <Check className="w-4 h-4 text-muted-foreground" />
        </div>
      </div>

      {/* Title & Description (30% Secondary/Text) */}
      <div className="space-y-3 mb-4 flex-1 overflow-hidden">
        <h3
          className="text-xl font-bold tracking-tight text-foreground group-hover:text-primary transition-colors leading-[1.2]"
          style={{ textShadow: 'var(--text-glow)' }}
        >
          {name}
        </h3>
        <p className="text-muted-foreground text-[13px] leading-relaxed line-clamp-2">
          {description}
        </p>
      </div>

      {/* CTA (10% Accent - Rule 60-30-10) */}
      <div className="w-full">
        <div
          className={cn(
            "w-full h-11 flex items-center justify-center gap-2",
            "font-bold transition-all active:scale-[0.98]",
            "bg-primary text-primary-foreground hover:bg-primary/90"
          )}
          style={{ borderRadius: 'calc(var(--radius) * 0.7)' }}
        >
          <span className="text-sm tracking-tight">Launch tool</span>
          <ArrowUpRight className="w-4 h-4 opacity-70 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
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
