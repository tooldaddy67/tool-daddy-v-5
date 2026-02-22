import Link from 'next/link';
import dynamic from 'next/dynamic';
import { HomeTools } from '@/components/home-tools';

const MobileHome = dynamic(() => import('@/components/mobile/mobile-home').then(mod => mod.MobileHome), {
  loading: () => <div className="min-h-screen bg-background animate-pulse" />
});

import { DesktopDashboard } from '@/components/desktop-dashboard-wrapper';

export default function Home() {
  return (
    <>
      <MobileHome />
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
          <HomeTools />
        </main>
      </div>
    </>
  );
}
