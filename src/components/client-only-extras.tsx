'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

const CursorTrail = dynamic(() => import('@/components/cursor-trail').then(mod => mod.CursorTrail), { ssr: false });
const UISound = dynamic(() => import('@/components/ui-sound').then(mod => mod.UISound), { ssr: false });
const GrainOverlay = dynamic(() => import('@/components/grain-overlay').then(mod => mod.GrainOverlay), { ssr: false });
const ScrollIndicator = dynamic(() => import('@/components/scroll-indicator').then(mod => mod.ScrollIndicator), { ssr: false });
const FloatingFeedback = dynamic(() => import('@/components/floating-feedback').then(mod => mod.FloatingFeedback), { ssr: false });

export function ClientOnlyExtras() {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        setIsMobile(window.innerWidth < 1280);
    }, []);

    if (isMobile) {
        return (
            <>
                <FloatingFeedback />
            </>
        );
    }

    return (
        <>
            <CursorTrail />
            <UISound />
            <GrainOverlay />
            <ScrollIndicator />
            <FloatingFeedback />
        </>
    );
}
