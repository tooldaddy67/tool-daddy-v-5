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
      <div className="hidden md:flex flex-col w-full min-h-screen py-12 px-6">
        <main className="flex-1 w-full max-w-7xl mx-auto space-y-24">
          {/* Desktop Branding Hero */}
          <section className="text-center space-y-6 pt-12">
            <h1 className="text-6xl font-black tracking-tighter uppercase font-headline">
              <span className="text-white">Tool</span>{" "}
              <span className="text-cyan-400">Daddy</span>
            </h1>
            <p className="text-lg font-medium text-muted-foreground max-w-2xl mx-auto uppercase tracking-[0.2em]">
              The ultimate free online tool suite. <br />
              Image compression, video conversion, AI tools, and more.
            </p>
          </section>

          {/* Featured Collections / Tools Section */}
          <div className="space-y-20">
            {/* Show activity if logged in */}
            {user && (
              <section className="space-y-8">
                <div className="flex items-center justify-between">
                  <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Jump Back In</h2>
                  <Link href="/history" className="text-sm font-bold text-muted-foreground hover:text-white transition-colors uppercase">View Full History</Link>
                </div>
                <DashboardWidgets />
              </section>
            )}

            {/* The Main Tool Grid - Full available tools */}
            <section className="space-y-12">
              <div className="flex flex-col items-center text-center space-y-4 mb-16">
                <h2 className="text-4xl font-black tracking-tight uppercase font-headline">Explore All Utilities</h2>
                <div className="h-1 w-20 bg-cyan-400 rounded-full" />
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
