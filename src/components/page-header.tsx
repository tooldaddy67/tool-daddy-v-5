'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
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
import { HomeIcon, Settings, BookOpen, History, Music } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';
import { NotificationBell } from './notification-bell';
const SettingsDialog = dynamic(() => import('./settings-dialog').then(mod => mod.SettingsDialog), {
  ssr: false
});
import { Button } from '@/components/ui/button';
import { useSettings } from '@/components/settings-provider';
import { DesktopMusicPlayer } from './desktop-music-player';

export default function PageHeader() {
  const pathname = usePathname();
  const currentTool = ALL_TOOLS.find((tool) => tool.href === pathname);
  const isHome = pathname === '/';
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { settings, updateSettings } = useSettings();

  const authRoutes = ['/login', '/signup'];

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: process.env.NEXT_PUBLIC_BASE_URL || 'https://tool-daddy.com',
      },
      ...(currentTool ? [{
        '@type': 'ListItem',
        position: 2,
        name: currentTool.name,
        item: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://tool-daddy.com'}${currentTool.href}`,
      }] : []),
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      <header className={cn(
        "hidden xl:flex sticky top-0 z-50 h-16 items-center gap-4 border-b border-white/10 px-4 xl:px-6 transition-all duration-300 shadow-sm relative overflow-hidden",
        settings.sidebarStyle === 'mini' && "xl:pl-2"
      )}>
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
                    <BreadcrumbPage className="font-bold text-foreground">
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
                      <BreadcrumbPage className="font-bold text-foreground">
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
          <Button
            asChild
            variant="ghost"
            size="icon"
            className="w-10 h-10 rounded-full"
            aria-label="Blog"
          >
            <Link href="/blog">
              <BookOpen className="h-5 w-5" />
            </Link>
          </Button>
          <Button
            asChild
            variant="ghost"
            size="icon"
            className="w-10 h-10 rounded-full"
            aria-label="History"
          >
            <Link href="/history">
              <History className="h-5 w-5" />
            </Link>
          </Button>
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
          <Button
            variant="ghost"
            size="icon"
            className={cn("w-10 h-10 rounded-full", settings.showMusicPlayer && "text-primary bg-primary/10")}
            onClick={() => updateSettings({ showMusicPlayer: !settings.showMusicPlayer })}
            aria-label="Toggle Music Player"
          >
            <Music className="h-5 w-5" />
          </Button>
          <ThemeToggle />
        </div>
      </header>
      <DesktopMusicPlayer />

      <SettingsDialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen} />
    </>
  );
}
