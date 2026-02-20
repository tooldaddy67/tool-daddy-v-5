'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useMemo } from 'react';
import { ALL_TOOLS } from '@/lib/tools-data';

export function ToolCTA() {
    // Select a random tool on mount (client-side only to avoid hydration mismatch)
    // Actually, random on server->client hydration causes mismatch. 
    // Better to pick one deterministically or use useEffect.
    // For simplicity, let's just pick "AI Text Humanizer" or "AI Playlist Maker" as they are popular.
    // OR, we can just render a generic "Check out our tools" CTA.
    // But the requirement said "Try our [Tool Name] tool now!".

    // Let's pick a featured tool.
    const featuredTools = ALL_TOOLS.filter(t => t.isPopular || t.isNew);
    // We'll deterministically pick one based on the hour or just the first one?
    // Let's use a simple deterministic logic: Day of year % featuredTools.length.

    // To avoid hydration errors, we can just hardcode a specific set or rotating list in a way that matches server/client.
    // Or just use "AI Text Humanizer" as the default flagship.

    const tool = ALL_TOOLS.find(t => t.href === '/ai-text-humanizer') || featuredTools[0];

    if (!tool) return null;

    return (
        <div className="my-12 not-prose">
            <Card className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-primary/20 overflow-hidden relative">
                <div className="absolute top-0 right-0 -mr-16 -mt-16 w-32 h-32 bg-primary/20 blur-[60px] rounded-full" />
                <CardContent className="p-8 flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
                    <div className="space-y-2 text-center md:text-left">
                        <div className="flex items-center justify-center md:justify-start gap-2 text-primary font-bold">
                            <Sparkles className="w-5 h-5" />
                            <span>Recommended Tool</span>
                        </div>
                        <h3 className="text-2xl font-bold font-headline">{tool.name}</h3>
                        <p className="text-muted-foreground max-w-md">
                            {tool.description}
                        </p>
                    </div>
                    <Button asChild size="lg" className="font-bold shrink-0">
                        <Link href={tool.href}>
                            Try it Now <ArrowRight className="ml-2 w-4 h-4" />
                        </Link>
                    </Button>
                </CardContent>
            </Card>
            <p className="text-center text-sm text-muted-foreground mt-4">
                Discover more free tools at <Link href="/" className="text-primary hover:underline font-semibold">Tool Daddy</Link>
            </p>
        </div>
    );
}
