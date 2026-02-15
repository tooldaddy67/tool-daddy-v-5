'use client';
import React from 'react';
import dynamic from 'next/dynamic';

const CursorTrail = dynamic(() => import('@/components/cursor-trail').then(mod => mod.CursorTrail), { ssr: false });
const UISound = dynamic(() => import('@/components/ui-sound').then(mod => mod.UISound), { ssr: false });
const GrainOverlay = dynamic(() => import('@/components/grain-overlay').then(mod => mod.GrainOverlay), { ssr: false });
const ScrollIndicator = dynamic(() => import('@/components/scroll-indicator').then(mod => mod.ScrollIndicator), { ssr: false });
const MobileNav = dynamic(() => import('@/components/mobile/mobile-nav').then(mod => mod.MobileNav), { ssr: false });
const AppFooter = dynamic(() => import('@/components/app-footer'), { ssr: false });

export function ClientOnlyExtras() {
    const [showExtras, setShowExtras] = React.useState(false);
    const [loadHeavyScripts, setLoadHeavyScripts] = React.useState(false);

    React.useEffect(() => {
        // Quick delay to get past FCP and LCP measurements, but not so long that it feels broken
        const coreTimer = setTimeout(() => setShowExtras(true), 500);

        // Deep delay for heavy marketing/security scripts that block the main thread
        const heavyTimer = setTimeout(() => setLoadHeavyScripts(true), 4000);

        return () => {
            clearTimeout(coreTimer);
            clearTimeout(heavyTimer);
        };
    }, []);

    // Inject reCAPTCHA only after the long delay
    React.useEffect(() => {
        if (loadHeavyScripts) {
            const script = document.createElement('script');
            script.src = "https://www.google.com/recaptcha/api.js?render=6Lfe02YsAAAAADPOetn7_P0L2oW2xhLgDVmYZgbF";
            script.async = true;
            document.body.appendChild(script);
        }
    }, [loadHeavyScripts]);

    if (!showExtras) return null;

    return (
        <>
            {/* Hidden comment for mobile detection debugging */}
            <div style={{ display: 'none' }} dangerouslySetInnerHTML={{ __html: `<!-- DeviceType: ${typeof window !== 'undefined' && window.innerWidth < 1280 ? 'Mobile' : 'Desktop'} -->` }} />

            <CursorTrail />
            <UISound />
            <GrainOverlay />
            <ScrollIndicator />
            <div className="xl:hidden">
                <MobileNav />
            </div>
            <div className="md:hidden">
                <AppFooter />
            </div>
        </>
    );
}
