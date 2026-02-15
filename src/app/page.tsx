import Link from 'next/link';
import dynamic from 'next/dynamic';
import { MobileHomeStatic } from '@/components/mobile/mobile-home-static';
import { MobileHomeClient, DesktopDashboardClient } from '@/components/home-client';
import { HomeTools } from '@/components/home-tools';

export default function Home() {
  return (
    <div className="relative">
      {/* LCP Optimization Layer for Mobile */}
      <div className="xl:hidden">
        <MobileHomeStatic />

        <div id="mobile-client-grid" className="absolute top-0 left-0 w-full z-10 opacity-0 transition-opacity duration-300">
          <MobileHomeClient />
        </div>

        {/* Cleanup Script: Hides the SSR layer once client-side React takes over */}
        <script dangerouslySetInnerHTML={{
          __html: `
                    (function() {
                        var startTime = Date.now();
                        function swap() {
                            var ssrLayer = document.getElementById('mobile-ssr-home');
                            var clientGrid = document.getElementById('mobile-client-grid');
                            
                            if (!window.TOOL_DADY_HYDRATED && (Date.now() - startTime < 8000)) {
                                setTimeout(swap, 50);
                                return;
                            }

                            if (clientGrid) {
                                clientGrid.style.opacity = '1';
                                setTimeout(function() {
                                    clientGrid.style.position = 'relative'; 
                                    if (ssrLayer) {
                                        ssrLayer.style.opacity = '0';
                                        setTimeout(function() { ssrLayer.style.display = 'none'; }, 200);
                                    }
                                }, 30);
                            }
                        }

                        if (document.readyState === 'loading') {
                            window.addEventListener('DOMContentLoaded', swap);
                        } else {
                            swap();
                        }
                        // Safety fallback
                        setTimeout(swap, 1500);
                    })()
                `}} />
      </div>

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
          <DesktopDashboardClient />

          <HomeTools />
        </main>
      </div>
    </div>
  );
}
