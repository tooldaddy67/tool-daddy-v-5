'use client';

import React from 'react';
import { useSettings } from '@/components/settings-provider';
import { DesktopDashboard } from '@/components/desktop-dashboard-wrapper';
import { HomeTools } from '@/components/home-tools';
import { TerminalLayout } from '@/components/outfits/terminal-layout';
import { XPToolLayout } from '@/components/outfits/xp-layout';
import { MacLaunchpadLayout } from '@/components/outfits/mac-layout';

export function HomeContent() {
    const { settings } = useSettings();

    if (settings.outfit === 'terminal') {
        return <TerminalLayout />;
    }

    if (settings.outfit === 'windows-xp') {
        return <XPToolLayout />;
    }

    if (settings.outfit === 'mac-os') {
        return <MacLaunchpadLayout />;
    }

    return (
        <div className="hidden xl:flex flex-col w-full min-h-screen relative overflow-hidden mesh-bg">
            <main className="flex-1 w-full max-w-7xl mx-auto px-12 py-24 space-y-32 relative z-10">
                {/* Desktop Branding Hero */}
                <section className="text-center space-y-8 py-12">
                    <div className="space-y-4">
                        <h1 className="text-7xl font-black tracking-tight uppercase font-headline text-primary">
                            The New Standard <br />
                            <span className="text-zinc-400">for Digital Tools</span>
                        </h1>
                        <p className="text-lg font-medium text-muted-foreground max-w-2xl mx-auto uppercase tracking-[0.3em] opacity-80">
                            <span style={{ color: '#D8B4FE' }}>Performance.</span> <span style={{ color: '#D35400' }}>Privacy.</span> <span style={{ color: '#D2B1A3' }}>Precision.</span>
                        </p>
                    </div>
                    <div className="flex items-center justify-center gap-4 pt-4">
                        <div className="h-[1px] w-12 bg-zinc-200 dark:bg-white/10" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Everything you need, in one place</span>
                        <div className="h-[1px] w-12 bg-zinc-200 dark:bg-white/10" />
                    </div>
                </section>

                <DesktopDashboard />
                <HomeTools />
            </main>
        </div>
    );
}
