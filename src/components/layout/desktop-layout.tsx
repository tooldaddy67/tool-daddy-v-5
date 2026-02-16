'use client';

import dynamic from 'next/dynamic';
import { SidebarProviderWrapper } from '@/components/sidebar-provider-wrapper';

const AppSidebar = dynamic(() => import('@/components/app-sidebar'), { ssr: false });
const PageHeader = dynamic(() => import('@/components/page-header'), { ssr: false });
const AppFooter = dynamic(() => import('@/components/app-footer'), { ssr: false });

export function DesktopLayout({ children }: { children: React.ReactNode }) {
    return (
        <SidebarProviderWrapper>
            <AppSidebar />
            <main className="flex-1 flex flex-col min-h-screen w-full relative">
                <PageHeader />
                <div className="flex-1 w-full flex flex-col items-center">{children}</div>
                <AppFooter />
            </main>
        </SidebarProviderWrapper>
    );
}
