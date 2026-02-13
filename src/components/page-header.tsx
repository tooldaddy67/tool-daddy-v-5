'use client';

import { useState } from 'react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { ALL_TOOLS } from '@/lib/constants';
import { Fragment } from 'react';
import { HomeIcon, Settings, BookOpen, History } from 'lucide-react';
import { ThemeToggle } from './theme-toggle';
import { NotificationBell } from './notification-bell';
import { SettingsDialog } from './settings-dialog';
import { Button } from '@/components/ui/button';
import { useSettings } from '@/components/settings-provider';

export default function PageHeader() {
  const pathname = usePathname();
  const currentTool = ALL_TOOLS.find((tool) => tool.href === pathname);
  const isHome = pathname === '/';
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { settings } = useSettings();

  const authRoutes = ['/login', '/signup'];

  return (
    <>
      <header className={cn(
        "hidden md:flex sticky top-0 z-50 h-16 items-center gap-4 border-b border-white/10 px-4 md:px-6 transition-all duration-300 shadow-[0_4px_30px_rgba(0,0,0,0.1)] backdrop-filter-none relative overflow-hidden",
        settings.sidebarStyle === 'mini' && "md:pl-2"
      )}>
        {/* Liquid Gloss Overlay */}
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />

        <div className="relative z-10 md:hidden">
          <SidebarTrigger />
        </div>
        {!authRoutes.includes(pathname) && (
          <div className="relative z-10">
            <Breadcrumb>
              <BreadcrumbList>
                {!isHome && (
                  <>
                    <BreadcrumbItem>
                      <BreadcrumbLink asChild>
                        <Link href="/"><HomeIcon className="w-4 h-4" /></Link>
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                  </>
                )}
                <BreadcrumbItem>
                  {isHome ? (
                    <BreadcrumbPage
                      className="font-bold bg-clip-text text-transparent bg-gradient-to-b from-white via-white/90 to-white/40"
                      style={{ WebkitBoxReflect: 'below -4px linear-gradient(transparent, rgba(255,255,255,0.15))' } as any}
                    >
                      Home
                    </BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink asChild><Link href="/#tools">Tools</Link></BreadcrumbLink>
                  )}
                </BreadcrumbItem>
                {currentTool && (
                  <Fragment>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      <BreadcrumbPage
                        className="font-bold bg-clip-text text-transparent bg-gradient-to-b from-white via-white/90 to-white/40"
                        style={{ WebkitBoxReflect: 'below -4px linear-gradient(transparent, rgba(255,255,255,0.15))' } as any}
                      >
                        {currentTool.name}
                      </BreadcrumbPage>
                    </BreadcrumbItem>
                  </Fragment>
                )}
                {pathname === '/history' && (
                  <Fragment>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      <BreadcrumbPage>History</BreadcrumbPage>
                    </BreadcrumbItem>
                  </Fragment>
                )}
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        )}
        <div className="flex-1"></div>
        <div className="flex items-center gap-1">
          <Link href="/blog">
            <Button
              variant="ghost"
              size="icon"
              className="w-10 h-10 rounded-full"
              aria-label="Blog"
            >
              <BookOpen className="h-5 w-5" />
            </Button>
          </Link>
          <Link href="/history">
            <Button
              variant="ghost"
              size="icon"
              className="w-10 h-10 rounded-full"
              aria-label="History"
            >
              <History className="h-5 w-5" />
            </Button>
          </Link>
          <NotificationBell />
          <Button
            variant="ghost"
            size="icon"
            className="w-10 h-10 rounded-full"
            onClick={() => setIsSettingsOpen(true)}
            aria-label="Open settings"
          >
            <Settings className="h-5 w-5" />
          </Button>
          <ThemeToggle />
        </div>
      </header>

      <SettingsDialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen} />
    </>
  );
}
