'use client';

import { SidebarProvider } from '@/components/ui/sidebar';
import { useSettings } from '@/components/settings-provider';
import { ReactNode } from 'react';

export function SidebarProviderWrapper({ children }: { children: ReactNode }) {
    const { settings } = useSettings();

    // When mini style is active, we force the sidebar to stay collapsed
    // We use the 'open' prop to control it definitively based on settings
    const isMini = settings.sidebarStyle === 'mini';

    return (
        <SidebarProvider
            defaultOpen={!isMini}
            open={isMini ? false : undefined}
            style={{
                "--sidebar-width": "18rem",
                "--sidebar-width-icon": "60px",
            } as React.CSSProperties}
        >
            {children}
        </SidebarProvider>
    );
}
