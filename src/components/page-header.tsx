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
import { HomeIcon, Settings } from 'lucide-react';
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
        "sticky top-0 z-50 flex h-16 items-center gap-4 border-b bg-background/90 backdrop-blur-lg px-4 md:px-6 transition-all duration-300",
        settings.sidebarStyle === 'mini' && "md:pl-2", // Less padding if mini to align better, but gap is handled by flex
        isHome && "hidden md:flex"
      )}>
        <div className="md:hidden">
          <SidebarTrigger />
        </div>
        {!authRoutes.includes(pathname) && (
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
                {isHome ? <BreadcrumbPage>Home</BreadcrumbPage> : <BreadcrumbLink asChild><Link href="/#tools">Tools</Link></BreadcrumbLink>}
              </BreadcrumbItem>
              {currentTool && (
                <Fragment>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage>{currentTool.name}</BreadcrumbPage>
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
        )}
        <div className="flex-1"></div>
        <div className="flex items-center gap-1">
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
