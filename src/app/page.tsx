"use client"

import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useUser } from '@/firebase';
import ToolGrid from '@/components/tool-grid';
import { MobileHome } from '@/components/mobile/mobile-home';

const DashboardWidgets = dynamic(() => import('@/components/dashboard-widgets').then(mod => mod.DashboardWidgets), {
  loading: () => <div className="min-h-[200px] w-full animate-pulse bg-muted/10 rounded-xl" />,
  ssr: false
});

export default function Home() {
  const { user } = useUser();

  return (
    <>
      <MobileHome />
      <div className="hidden md:flex flex-col w-full min-h-screen relative overflow-hidden mesh-bg">
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

          {/* Featured Collections / Tools Section */}
          <div className="space-y-32">
            {/* Show activity if logged in */}
            {user && (
              <section className="space-y-12">
                <div className="flex items-center justify-between border-b border-zinc-100 dark:border-white/5 pb-6">
                  <h2 className="text-3xl font-black text-foreground uppercase tracking-tight">Jump Back In</h2>
                  <Link href="/history" className="text-xs font-bold text-muted-foreground hover:text-primary transition-colors uppercase tracking-widest">View Full History</Link>
                </div>
                <DashboardWidgets />
              </section>
            )}

            {/* The Main Tool Grid - Full available tools */}
            <section className="space-y-16">
              <div className="flex flex-col items-center text-center space-y-4">
                <h2 className="text-4xl font-black tracking-tighter uppercase font-headline">Explore All Utilities</h2>
                <div className="h-1.5 w-16 bg-red-500 rounded-full" />
              </div>
              <ToolGrid />
            </section>
          </div>
        </main>
      </div>
    </>
  );
}

// Helper to avoid import issues if cn isn't globally available here (though it should be via @/lib/utils)
