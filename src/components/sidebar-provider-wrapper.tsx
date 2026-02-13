'use client';

import { SidebarProvider } from '@/components/ui/sidebar';
import { useSettings } from '@/components/settings-provider';
import { ReactNode } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

export function SidebarProviderWrapper({ children }: { children: ReactNode }) {
    const { settings } = useSettings();
    const isMobile = useIsMobile();

    // When mini style is active, we force the sidebar to stay collapsed
    // On mobile, we also force it collapsed to prevent layout shifts
    const isMini = settings.sidebarStyle === 'mini';
    const shouldBeOpen = !isMini && !isMobile;

    return (
        <SidebarProvider
            defaultOpen={shouldBeOpen}
            open={shouldBeOpen ? undefined : false}
            style={{
                "--sidebar-width": "18rem",
                "--sidebar-width-icon": "60px",
            } as React.CSSProperties}
        >
            {children}
        </SidebarProvider>
    );
}
