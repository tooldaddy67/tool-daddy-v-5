'use client';

import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { useFirebase, useDoc } from '@/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { cn } from '@/lib/utils';

export type FontPair = 'tech' | 'modern' | 'classic' | 'friendly' | 'elegant' | 'futuristic' | 'monospace' | 'playful' | 'royal';
export type ColorTheme = 'purple' | 'cyan' | 'green' | 'blue' | 'amber' | 'rose' | 'indigo' | 'emerald' | 'slate' | 'sunset';
export type BlurIntensity = 'low' | 'medium' | 'high';
export type UIDensity = 'compact' | 'standard' | 'cozy';
export type BorderStyle = 'sharp' | 'smooth' | 'round';
export type BGStyle = 'dark' | 'mesh' | 'pulse';

interface UserSettings {
    displayName: string;
    fontPair: FontPair;
    colorTheme: ColorTheme;
    blurIntensity: BlurIntensity;
    uiDensity: UIDensity;
    borderStyle: BorderStyle;
    bgStyle: BGStyle;
    animSpeed: number;
}

interface SettingsContextType {
    settings: UserSettings;
    updateSettings: (newSettings: Partial<UserSettings>) => Promise<void>;
    isLoading: boolean;
}

const defaultSettings: UserSettings = {
    displayName: '',
    fontPair: 'tech',
    colorTheme: 'purple',
    blurIntensity: 'medium',
    uiDensity: 'standard',
    borderStyle: 'smooth',
    bgStyle: 'dark',
    animSpeed: 1,
};

export const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const FONT_PAIRS: Record<FontPair, { headline: string; body: string }> = {
    tech: { headline: 'var(--font-space-grotesk)', body: 'var(--font-inter)' },
    modern: { headline: 'var(--font-outfit)', body: 'var(--font-plus-jakarta-sans)' },
    classic: { headline: 'var(--font-inter)', body: 'var(--font-inter)' },
    friendly: { headline: 'var(--font-quicksand)', body: 'var(--font-nunito)' },
    elegant: { headline: 'var(--font-playfair-display)', body: 'var(--font-lora)' },
    futuristic: { headline: 'var(--font-syne)', body: 'var(--font-inter)' },
    monospace: { headline: 'var(--font-jetbrains-mono)', body: 'var(--font-roboto-mono)' },
    playful: { headline: 'var(--font-fredoka)', body: 'var(--font-quicksand)' },
    royal: { headline: 'var(--font-cinzel)', body: 'var(--font-eb-garamond)' },
};

const COLOR_THEMES: Record<ColorTheme, { primary: string; primaryForeground: string; accent: string }> = {
    purple: { primary: '271 91% 65%', primaryForeground: '0 0% 100%', accent: '271 91% 15%' },
    cyan: { primary: '188 86% 53%', primaryForeground: '188 86% 10%', accent: '188 86% 15%' },
    green: { primary: '142 70% 45%', primaryForeground: '142 70% 5%', accent: '142 70% 15%' },
    blue: { primary: '217 91% 60%', primaryForeground: '0 0% 100%', accent: '217 91% 15%' },
    amber: { primary: '38 92% 50%', primaryForeground: '38 92% 5%', accent: '38 92% 15%' },
    rose: { primary: '346 84% 61%', primaryForeground: '0 0% 100%', accent: '346 84% 15%' },
    indigo: { primary: '226 70% 55%', primaryForeground: '0 0% 100%', accent: '226 70% 15%' },
    emerald: { primary: '158 64% 52%', primaryForeground: '0 0% 100%', accent: '158 64% 15%' },
    slate: { primary: '215 16% 47%', primaryForeground: '0 0% 100%', accent: '215 16% 15%' },
    sunset: { primary: '22 90% 60%', primaryForeground: '0 0% 100%', accent: '22 90% 15%' },
};

const BLUR_MAP: Record<BlurIntensity, string> = { low: '2px', medium: '20px', high: '40px' };
const RADIUS_MAP: Record<BorderStyle, string> = { sharp: '0px', smooth: '0.8rem', round: '1.5rem' };
const DENSITY_MAP: Record<UIDensity, string> = { compact: '0.9', standard: '1', cozy: '1.1' };

export function SettingsProvider({ children }: { children: React.ReactNode }) {
    const { user, firestore } = useFirebase();
    const [localSettings, setLocalSettings] = useState<UserSettings>(defaultSettings);
    const [isLocalLoaded, setIsLocalLoaded] = useState(false);
    const [isDesktop, setIsDesktop] = useState(typeof window !== 'undefined' ? window.innerWidth >= 1024 : true);

    // Handle Window Resize
    useEffect(() => {
        const handleResize = () => {
            setIsDesktop(window.innerWidth >= 1024);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const settingsDocRef = useMemo(() => {
        if (!user || user.isAnonymous || !firestore) return null;
        return doc(firestore, 'users', user.uid, 'settings', 'preferences');
    }, [user, firestore]);

    const { data: cloudSettings, isLoading: isCloudLoading } = useDoc<UserSettings>(settingsDocRef);

    // Load from localStorage on mount
    useEffect(() => {
        const stored = localStorage.getItem('tool-dady-settings');
        if (stored) {
            try {
                setLocalSettings(prev => ({ ...prev, ...JSON.parse(stored) }));
            } catch (e) {
                console.error('Failed to parse settings', e);
            }
        }
        setIsLocalLoaded(true);
    }, []);

    // Sync Cloud to Local
    useEffect(() => {
        if (cloudSettings) {
            setLocalSettings(prev => ({ ...prev, ...cloudSettings }));
            localStorage.setItem('tool-dady-settings', JSON.stringify({ ...localSettings, ...cloudSettings }));
        }
    }, [cloudSettings]);

    // Apply Settings to Body
    useEffect(() => {
        if (!isLocalLoaded) return;

        const root = document.documentElement;
        const fonts = FONT_PAIRS[localSettings.fontPair];
        const colors = COLOR_THEMES[localSettings.colorTheme];

        root.style.setProperty('--font-headline', fonts.headline);
        root.style.setProperty('--font-body', fonts.body);
        root.style.setProperty('--primary', colors.primary);
        root.style.setProperty('--primary-foreground', colors.primaryForeground);
        root.style.setProperty('--accent', colors.accent);

        root.style.setProperty('--sidebar-primary', colors.primary);
        root.style.setProperty('--sidebar-ring', colors.primary);

        if (isDesktop) {
            root.style.setProperty('--glass-blur', BLUR_MAP[localSettings.blurIntensity]);
            root.style.setProperty('--radius', RADIUS_MAP[localSettings.borderStyle]);
            root.style.setProperty('--spacing-multiplier', DENSITY_MAP[localSettings.uiDensity]);
            root.style.setProperty('--anim-speed', localSettings.animSpeed.toString());
        } else {
            // Standard values for mobile/tablet
            root.style.setProperty('--glass-blur', '12px');
            root.style.setProperty('--radius', '0.8rem');
            root.style.setProperty('--spacing-multiplier', '1');
            root.style.setProperty('--anim-speed', '1');
        }
    }, [localSettings, isLocalLoaded, isDesktop]);

    const updateSettings = async (newSettings: Partial<UserSettings>) => {
        const updated = { ...localSettings, ...newSettings };
        setLocalSettings(updated);
        localStorage.setItem('tool-dady-settings', JSON.stringify(updated));

        if (settingsDocRef) {
            try {
                await setDoc(settingsDocRef, updated, { merge: true });
            } catch (e) {
                console.error('Failed to update cloud settings', e);
            }
        }
    };

    const value = {
        settings: localSettings,
        updateSettings,
        isLoading: !isLocalLoaded || (!!user && !user.isAnonymous && isCloudLoading),
    };

    return (
        <SettingsContext.Provider value={value}>
            <div className={cn(
                "min-h-screen transition-all duration-700",
                isDesktop && localSettings.bgStyle === 'mesh' ? 'mesh-bg' : '',
                isDesktop && localSettings.bgStyle === 'pulse' ? 'pulse-bg' : '',
                (!isDesktop || localSettings.bgStyle === 'dark') ? 'bg-background' : ''
            )}>
                {children}
            </div>
        </SettingsContext.Provider>
    );
}

export const useSettings = () => {
    const context = useContext(SettingsContext);
    if (context === undefined) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
};
