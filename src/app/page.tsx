"use client"

import { ArrowDown, Sparkles } from 'lucide-react';

import { DashboardWidgets } from '@/components/dashboard-widgets';
import { useUser } from '@/firebase';
// @ts-ignore
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { HeroSection } from '@/components/home/hero-section';
import { BentoGrid } from '@/components/home/bento-grid';
import { FeaturedTools } from '@/components/home/featured-tools';
import { MobileHome } from '@/components/mobile/mobile-home';

export default function Home() {
  const { user, isUserLoading } = useUser();
  const showDashboard = !!user; // Show for everyone (guests and logged in)
  const isRealUser = user && !user.isAnonymous;

  return (
    <div className="flex flex-col w-full min-h-screen">
      <main className="flex-1">
        {/* New Hero Section */}
        <HeroSection />

        {/* Bento Grid Features */}
        <BentoGrid />

        {/* Dashboard / Featured Tools Section */}
        <div className="relative w-full bg-background/50 backdrop-blur-sm">

          <div className="space-y-12">
            {showDashboard && (
              <section className="px-4 md:px-6 py-12 max-w-7xl mx-auto border-b border-white/5">
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
  );
}

// Helper to avoid import issues if cn isn't globally available here (though it should be via @/lib/utils)
