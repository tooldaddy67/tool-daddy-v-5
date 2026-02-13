"use client"

import { ArrowDown, Sparkles } from 'lucide-react';
import { useUser } from '@/firebase';
import { cn } from '@/lib/utils';
import { HeroSection } from '@/components/home/hero-section';
// Dynamic imports to reduce initial bundle size and TBT
import dynamic from 'next/dynamic';

const DashboardWidgets = dynamic(() => import('@/components/dashboard-widgets').then(mod => mod.DashboardWidgets), {
  loading: () => <div className="min-h-[200px] w-full animate-pulse bg-muted/10 rounded-xl" />,
  ssr: false
});

const BentoGrid = dynamic(() => import('@/components/home/bento-grid').then(mod => mod.BentoGrid));

const FeaturedTools = dynamic(() => import('@/components/home/featured-tools').then(mod => mod.FeaturedTools));

import { MobileHome } from '@/components/mobile/mobile-home';

export default function Home() {
  const { user, isUserLoading } = useUser();
  // Show dashboard skeleton while loading, or if we have a user (anonymous or real)
  const showDashboard = isUserLoading || !!user;

  return (
    <>
      <MobileHome />
      <div className="hidden md:flex flex-col w-full min-h-screen">
        <main className="flex-1">
          {/* New Hero Section */}
          <HeroSection />

          {/* Bento Grid Features */}
          <BentoGrid />

          {/* Dashboard / Featured Tools Section */}
          <div className="relative w-full bg-background/50 backdrop-blur-sm">

            <div className="space-y-12">
              {showDashboard && (
                <section className="px-4 md:px-6 py-12 max-w-7xl mx-auto border-b border-white/5 min-h-[400px]">
                  <div className="flex flex-col items-center justify-center text-center space-y-4 mb-8">
                    <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl font-headline">Your Dashboard</h2>
                    <p className="text-muted-foreground">Quick access to your recent activities.</p>
                  </div>
                  <DashboardWidgets />
                </section>
              )}

              {/* Featured Tools & Link to All */}
              <FeaturedTools />

            </div>
          </div>
        </main>
      </div>
    </>
  );
}

// Helper to avoid import issues if cn isn't globally available here (though it should be via @/lib/utils)
