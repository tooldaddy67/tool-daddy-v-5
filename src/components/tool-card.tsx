import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { type LucideIcon } from 'lucide-react';
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
  { bg: 'bg-blue-500/10', border: 'border-blue-500/20', text: 'text-blue-400', glow: 'rgba(59, 130, 246, 0.5)' },
  { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-400', glow: 'rgba(16, 185, 129, 0.5)' },
  { bg: 'bg-amber-500/10', border: 'border-amber-500/20', text: 'text-amber-400', glow: 'rgba(245, 158, 11, 0.5)' },
  { bg: 'bg-purple-500/10', border: 'border-purple-500/20', text: 'text-purple-400', glow: 'rgba(168, 85, 247, 0.5)' },
  { bg: 'bg-rose-500/10', border: 'border-rose-500/20', text: 'text-rose-400', glow: 'rgba(244, 63, 94, 0.5)' },
  { bg: 'bg-indigo-500/10', border: 'border-indigo-500/20', text: 'text-indigo-400', glow: 'rgba(79, 70, 229, 0.5)' },
  { bg: 'bg-red-500/10', border: 'border-red-500/20', text: 'text-red-400', glow: 'rgba(239, 68, 68, 0.5)' },
  { bg: 'bg-cyan-500/10', border: 'border-cyan-500/20', text: 'text-cyan-400', glow: 'rgba(6, 182, 212, 0.5)' },
  { bg: 'bg-orange-500/10', border: 'border-orange-500/20', text: 'text-orange-400', glow: 'rgba(249, 115, 22, 0.5)' },
];

export default function ToolCard({ href, name, description, icon: Icon, isExternal, variantIndex = 0 }: ToolCardProps) {
  const variant = ICON_VARIANTS[variantIndex % ICON_VARIANTS.length];

  const cardContent = (
    <Card
      className={cn(
        "h-full glass-panel tool-island transition-all duration-300",
        "border-border/20 shadow-lg"
      )}
      style={{ '--glow-color': variant.glow } as React.CSSProperties}
    >
      <CardHeader className="flex flex-row items-start gap-4 space-y-0">
        <div
          className={cn(
            "p-3 rounded-lg border shrink-0 transition-all duration-300",
            variant.bg, variant.border, variant.text
          )}
        >
          <Icon className="h-6 w-6" />
        </div>
        <div className="pt-1 flex-1 min-w-0">
          <CardTitle className="font-headline text-lg sm:text-xl leading-tight line-clamp-2">{name}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  )

  if (isExternal) {
    return (
      <Link
        href={`/external-redirect?to=${encodeURIComponent(href)}&name=${encodeURIComponent(name)}`}
        className="group h-full"
      >
        {cardContent}
      </Link>
    )
  }

  return (
    <Link href={href} prefetch={false} className="group h-full">
      {cardContent}
    </Link>
  );
}
