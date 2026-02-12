'use client';

import { useEffect, useRef } from 'react';
import { useSettings } from '@/components/settings-provider';

export function UISound() {
    const { settings } = useSettings();
    const audioCtx = useRef<AudioContext | null>(null);

    useEffect(() => {
        if (!settings.enableSound) return;

        const initAudio = () => {
            if (!audioCtx.current) {
                audioCtx.current = new (window.AudioContext || (window as any).webkitAudioContext)();
            }
            if (audioCtx.current.state === 'suspended') {
                audioCtx.current.resume();
            }
        };

        const playTick = () => {
            if (!audioCtx.current || !settings.enableSound) return;

            const osc = audioCtx.current.createOscillator();
            const gain = audioCtx.current.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(800, audioCtx.current.currentTime);
            osc.frequency.exponentialRampToValueAtTime(100, audioCtx.current.currentTime + 0.05);

            gain.gain.setValueAtTime(0.05, audioCtx.current.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.current.currentTime + 0.05);

            osc.connect(gain);
            gain.connect(audioCtx.current.destination);

            osc.start();
            osc.stop(audioCtx.current.currentTime + 0.05);
        };

        const handleClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (target.closest('button') || target.closest('a') || target.closest('input[type="checkbox"]')) {
                initAudio();
                playTick();
            }
        };

        window.addEventListener('mousedown', handleClick);
        return () => window.removeEventListener('mousedown', handleClick);
    }, [settings.enableSound]);

    return null;
}
