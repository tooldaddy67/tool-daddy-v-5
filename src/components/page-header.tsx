'use client';

import { SidebarTrigger } from '@/components/ui/sidebar';
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
import { HomeIcon } from 'lucide-react';
import { ThemeToggle } from './theme-toggle';
import { NotificationBell } from './notification-bell';

export default function PageHeader() {
  const pathname = usePathname();
  const currentTool = ALL_TOOLS.find((tool) => tool.href === pathname);
  const isHome = pathname === '/';

  const authRoutes = ['/login', '/signup'];

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/50 backdrop-blur-lg px-4 md:px-6">
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
        <ThemeToggle />
      </div>
    </header>
  );
}
