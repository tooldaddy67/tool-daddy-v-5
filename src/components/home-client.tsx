'use client';

import React from 'react';
import dynamic from 'next/dynamic';

export const MobileHomeClient = dynamic(() => import('@/components/mobile/mobile-home').then(mod => mod.MobileHome), {
    ssr: false,
    loading: () => <div className="min-h-screen bg-background animate-pulse" />
});

export const DesktopDashboardClient = dynamic(() => import('@/components/desktop-dashboard').then(mod => mod.DesktopDashboard), {
    ssr: false
});
