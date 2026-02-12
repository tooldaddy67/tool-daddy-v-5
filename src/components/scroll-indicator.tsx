'use client';

import { useEffect, useState } from 'react';
import { useSettings } from '@/components/settings-provider';

export function ScrollIndicator() {
    const { settings } = useSettings();
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        if (!settings.showScrollIndicator) return;

        const updateScroll = () => {
            const currentScroll = window.scrollY;
            const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
            if (scrollHeight) {
                setProgress(Number((currentScroll / scrollHeight).toFixed(2)) * 100);
            }
        };

        window.addEventListener('scroll', updateScroll);
        return () => window.removeEventListener('scroll', updateScroll);
    }, [settings.showScrollIndicator]);

    if (!settings.showScrollIndicator) return null;

    return (
        <div className="fixed top-0 left-0 w-full h-[3px] z-[100] pointer-events-none">
            <div
                className="h-full bg-primary transition-all duration-150 ease-out"
                style={{
                    width: `${progress}%`,
                    boxShadow: settings.accentGradient ? '0 0 10px hsla(var(--primary), 0.5)' : 'none'
                }}
            />
        </div>
    );
}
