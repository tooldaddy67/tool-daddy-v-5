import Link from 'next/link';
import dynamic from 'next/dynamic';
import { MobileHomeStatic } from '@/components/mobile/mobile-home-static';
import { DesktopHome } from '@/components/layout/desktop-home';

const MobileHome = dynamic(() => import('@/components/mobile/mobile-home').then(mod => mod.MobileHome), {
  ssr: true, // Keep SSR for SEO on the home screen
  loading: () => <div className="min-h-screen bg-background animate-pulse" />
});

export default function Home() {
  return (
    <div className="relative">
      {/* LCP Optimization Layer for Mobile */}
      <div className="xl:hidden">
        <MobileHomeStatic />

        <div id="mobile-client-grid" className="absolute top-0 left-0 w-full z-10 opacity-0 transition-opacity duration-300">
          <MobileHome />
        </div>

        {/* Cleanup Script: Hides the SSR layer once client-side React takes over */}
        <script dangerouslySetInnerHTML={{
          __html: `
                    (function() {
                        function swap() {
                            var ssrLayer = document.getElementById('mobile-ssr-home');
                            var clientGrid = document.getElementById('mobile-client-grid');
                            
                            if (!window.TOOL_DADY_HYDRATED) {
                                setTimeout(swap, 100);
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
                                }, 50);
                            }
                        }

                        if (document.readyState === 'loading') {
                            window.addEventListener('DOMContentLoaded', swap);
                        } else {
                            swap();
                        }
                        setTimeout(swap, 2000);
                    })()
                `}} />
      </div>

      <DesktopHome />
    </div>
  );
}
