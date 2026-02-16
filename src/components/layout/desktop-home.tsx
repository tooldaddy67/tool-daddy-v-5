'use client';

import Link from 'next/link';
import dynamic from 'next/dynamic';
import { Sparkles, Minimize, Shuffle, ChevronDown } from 'lucide-react';

const DesktopDashboard = dynamic(() => import('@/components/desktop-dashboard').then(mod => mod.DesktopDashboard), {
    ssr: false
});

const DynamicToolCard = dynamic(() => import('@/components/dynamic-tool-card'), { ssr: true });

export function DesktopHome() {
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

                {/* Desktop Dashboard UI */}
                <DesktopDashboard />

                {/* Explore Our Tools Section */}
                <section className="space-y-12 py-12">
                    <div className="flex flex-col items-center text-center space-y-4">
                        <h2 className="text-4xl font-bold tracking-tight font-headline">Explore Our Tools</h2>
                        <p className="text-muted-foreground max-w-2xl text-lg">
                            Discover a wide range of utilities designed to boost your productivity.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <DynamicToolCard
                            name="AI Image Enhancer"
                            description="Upscale and enhance your images before being redirected."
                            href="/ai-image-enhancer"
                            icon={Sparkles}
                            isExternal={false}
                            variantIndex={0}
                        />
                        <DynamicToolCard
                            name="Image Compressor"
                            description="Reduce image file size while maintaining quality."
                            href="/image-compressor"
                            icon={Minimize}
                            variantIndex={1}
                        />
                        <DynamicToolCard
                            name="Token Generator"
                            description="Generate random strings with customizable character sets."
                            href="/token-generator"
                            icon={Shuffle}
                            variantIndex={2}
                        />
                    </div>

                    <div className="flex justify-center">
                        <Link href="/tools" className="group flex flex-col items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                            <span className="text-lg font-medium">Explore More Tools</span>
                            <ChevronDown className="w-6 h-6 animate-bounce group-hover:text-primary" />
                        </Link>
                    </div>
                </section>
            </main>
        </div>
    );
}
