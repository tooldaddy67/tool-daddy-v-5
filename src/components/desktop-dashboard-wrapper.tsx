"use client";

import dynamic from 'next/dynamic';

export const DesktopDashboard = dynamic(
    () => import('@/components/desktop-dashboard').then(mod => mod.DesktopDashboard),
    { ssr: false }
);
