'use client';

import React from 'react';
import nextDynamic from 'next/dynamic';
import { LazyMotion, domAnimation } from 'framer-motion';
import { SidebarProviderWrapper } from '@/components/sidebar-provider-wrapper';
import { ClientOnlyExtras } from '@/components/client-only-extras';

// Move dynamic imports here where ssr: false is allowed (Client Component)
const AppSidebar = nextDynamic(() => import('@/components/app-sidebar'), { ssr: false });
const PageHeader = nextDynamic(() => import('@/components/page-header'), { ssr: false });
const AppFooter = nextDynamic(() => import('@/components/app-footer'), { ssr: false });
const FloatingFeedback = nextDynamic(() => import('@/components/floating-feedback').then(mod => mod.FloatingFeedback), { ssr: false });
const BrutalLockout = nextDynamic(() => import('@/components/brutal-lockout').then(mod => mod.BrutalLockout), { ssr: false });

interface RootLayoutClientProps {
    children: React.ReactNode;
    isMobile: boolean;
    lockoutStatus: {
        isLocked: boolean;
        lockedUntil: number;
    };
}

export function RootLayoutClient({ children, isMobile, lockoutStatus }: RootLayoutClientProps) {
    if (lockoutStatus.isLocked && lockoutStatus.lockedUntil) {
        return <BrutalLockout lockedUntil={lockoutStatus.lockedUntil} />;
    }

    return (
        <LazyMotion features={domAnimation}>
            <ClientOnlyExtras />
            {isMobile ? (
                <main className="flex-1 flex flex-col min-h-screen w-full relative">
                    <div className="flex-1 w-full flex flex-col items-center">{children}</div>
                </main>
            ) : (
                <SidebarProviderWrapper>
                    <AppSidebar />
                    <main className="flex-1 flex flex-col min-h-screen w-full relative">
                        <PageHeader />
                        <div className="flex-1 w-full flex flex-col items-center">{children}</div>
                        <AppFooter />
                    </main>
                </SidebarProviderWrapper>
            )}
            <FloatingFeedback />
        </LazyMotion>
    );
}
