'use client';

import { useEffect, useRef } from 'react';
import { useSettings } from '@/components/settings-provider';

export function CursorTrail() {
    const { settings } = useSettings();
    const particlesRef = useRef<{ x: number; y: number; element: HTMLDivElement; age: number }[]>([]);

    useEffect(() => {
        if (!settings.showCursorEffect) return;

        const handleMouseMove = (e: MouseEvent) => {
            const particle = document.createElement('div');
            particle.className = 'cursor-particle';

            // Random size and opacity
            const size = Math.random() * 6 + 2;
            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;
            particle.style.left = `${e.clientX}px`;
            particle.style.top = `${e.clientY}px`;
            particle.style.opacity = '0.8';
            particle.style.transition = 'all 0.8s ease-out';

            document.body.appendChild(particle);

            // Small offset for animation
            const offX = (Math.random() - 0.5) * 40;
            const offY = (Math.random() - 0.5) * 40;

            requestAnimationFrame(() => {
                particle.style.transform = `translate(${offX}px, ${offY}px) scale(0)`;
                particle.style.opacity = '0';
            });

            setTimeout(() => {
                if (particle.parentNode) {
                    document.body.removeChild(particle);
                }
            }, 800);
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, [settings.showCursorEffect]);

    return null;
}
