"use client"

import { ArrowDown, Sparkles } from 'lucide-react';
import ToolGridLoader from '@/components/tool-grid-loader';
import { DashboardWidgets } from '@/components/dashboard-widgets';
import { useUser } from '@/firebase';
// @ts-ignore
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export default function Home() {
  const { user, isUserLoading } = useUser();
  const showDashboard = !!user; // Show for everyone (guests and logged in)
  const isRealUser = user && !user.isAnonymous;

  return (
    <div className="flex flex-col w-full">
      <main className="flex-1">
        <section className={cn(
          "relative w-full flex flex-col items-center justify-center text-center px-4 md:px-6 transition-all duration-700",
          showDashboard ? "py-12 md:py-20 min-h-[60vh]" : "h-[calc(100vh-4rem)]"
        )}>
          <div className="space-y-6 w-full max-w-4xl mx-auto">
            <div className="space-y-4">
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl/none font-headline">
                Tool <span className="text-primary">Daddy</span>
              </h1>
              <p className="mx-auto text-foreground/80 md:text-xl max-w-[600px]">
                {isRealUser
                  ? "Welcome back! Here's a quick summary of your digital toolkit."
                  : "Welcome to Tool Daddy! Your personal dashboard is ready."
                }
              </p>
            </div>

            {showDashboard && (
              <div className="pt-8 w-full">
                <DashboardWidgets />
              </div>
            )}
          </div>

          {!showDashboard && (
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2">
              <div className="flex flex-col items-center gap-2 text-muted-foreground animate-bounce">
                <ArrowDown className="w-6 h-6" />
              </div>
            </div>
          )}
        </section>

        <section id="tools" className="w-full py-12 md:py-24 lg:pb-32">
          <div className="px-4 md:px-6 space-y-12">
            <div className="flex flex-col items-center justify-center text-center space-y-4 mb-8">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl font-headline">Explore Tools</h2>
              <div className="h-1 w-20 bg-primary/40 rounded-full" />
            </div>
            <ToolGridLoader />
          </div>
        </section>
      </main>
    </div>
  );
}

// Helper to avoid import issues if cn isn't globally available here (though it should be via @/lib/utils)
