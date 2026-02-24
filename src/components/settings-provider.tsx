'use client';

import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { useFirebase } from '@/firebase/provider';
import { cn } from '@/lib/utils';
import dynamic from 'next/dynamic';

const SettingsDialog = dynamic(() => import('@/components/settings-dialog').then(mod => mod.SettingsDialog), {
    ssr: false
});

export type FontPair = 'tech' | 'modern' | 'classic' | 'friendly' | 'elegant' | 'futuristic' | 'monospace' | 'playful' | 'royal';
export type ColorTheme = 'purple' | 'cyan' | 'green' | 'blue' | 'amber' | 'rose' | 'indigo' | 'emerald' | 'slate' | 'sunset' | 'custom';
export type BlurIntensity = 'low' | 'medium' | 'high';
export type UIDensity = 'compact' | 'standard' | 'cozy';
export type BorderStyle = 'sharp' | 'smooth' | 'round';
export type BGStyle = 'dark' | 'mesh' | 'pulse';
export type SidebarStyle = 'full' | 'mini' | 'float';
export type CardStyle = 'glass' | 'neo' | 'minimal';
export type Outfit = 'default' | 'windows-xp' | 'mac-os' | 'elementary-os' | 'linux-mint' | 'kde-plasma' | 'terminal';

interface UserSettings {
    displayName: string;
    siteTitle: string;
    fontPair: FontPair;
    colorTheme: ColorTheme;
    primaryColor: string; // HSL value like "271 91% 65%"
    blurIntensity: BlurIntensity;
    uiDensity: UIDensity;
    borderStyle: BorderStyle;
    bgStyle: BGStyle;
    animSpeed: number;
    sidebarStyle: SidebarStyle;
    cardStyle: CardStyle;
    showCursorEffect: boolean;
    showGrain: boolean;
    showScrollIndicator: boolean;
    enableSound: boolean;
    accentGradient: boolean;
    dataPersistence: boolean;
    notifications: boolean;
    // Granular Customization
    cardRoundness: number;
    glassOpacity: number;
    cardGlowStrength: number;
    textGlow: boolean;
    showMusicPlayer: boolean;
    outfit: Outfit;
}

interface SettingsContextType {
    settings: UserSettings;
    updateSettings: (newSettings: Partial<UserSettings>) => Promise<void>;
    isLoading: boolean;
    settingsOpen: boolean;
    setSettingsOpen: (open: boolean) => void;
}

const defaultSettings: UserSettings = {
    displayName: '',
    siteTitle: 'Tool Daddy',
    fontPair: 'tech',
    colorTheme: 'green',
    primaryColor: '142 70% 45%',
    blurIntensity: 'high',
    uiDensity: 'compact',
    borderStyle: 'smooth',
    bgStyle: 'dark',
    animSpeed: 1,
    sidebarStyle: 'full',
    cardStyle: 'neo',
    showCursorEffect: false,
    showGrain: false,
    showScrollIndicator: false,
    enableSound: false,
    accentGradient: false,
    dataPersistence: true,
    notifications: true,
    // Defaults
    cardRoundness: 12, // ~0.75rem
    glassOpacity: 90,
    cardGlowStrength: 40,
    textGlow: false,
    showMusicPlayer: false,
    outfit: 'default',
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
    custom: { primary: '271 91% 65%', primaryForeground: '0 0% 100%', accent: '271 91% 15%' },
};

const BLUR_MAP: Record<BlurIntensity, string> = { low: '2px', medium: '20px', high: '40px' };
const RADIUS_MAP: Record<BorderStyle, number> = { sharp: 0, smooth: 12, round: 24 };
const DENSITY_MAP: Record<UIDensity, string> = { compact: '0.9', standard: '1', cozy: '1.1' };

export function SettingsProvider({ children }: { children: React.ReactNode }) {
    const { user } = useFirebase();
    const [localSettings, setLocalSettings] = useState<UserSettings>(defaultSettings);
    const [isLocalLoaded, setIsLocalLoaded] = useState(false);
    const [isDesktop, setIsDesktop] = useState(typeof window !== 'undefined' ? window.innerWidth >= 1024 : true);

    // Global Settings Dialog State
    const [settingsOpen, setSettingsOpen] = useState(false);

    // Handle Window Resize
    useEffect(() => {
        const handleResize = () => {
            setIsDesktop(window.innerWidth >= 1024);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

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

    // Apply Settings to Body
    useEffect(() => {
        if (!isLocalLoaded) return;

        const root = document.documentElement;
        const fonts = FONT_PAIRS[localSettings.fontPair];
        const colors = COLOR_THEMES[localSettings.colorTheme];

        root.style.setProperty('--font-headline', fonts.headline);
        root.style.setProperty('--font-body', fonts.body);

        const primary = localSettings.colorTheme === 'custom' ? localSettings.primaryColor : colors.primary;
        root.style.setProperty('--primary', primary || COLOR_THEMES.purple.primary);
        root.style.setProperty('--primary-foreground', colors.primaryForeground);
        root.style.setProperty('--accent', colors.accent);

        root.setAttribute('data-sidebar-style', localSettings.sidebarStyle);
        root.setAttribute('data-card-style', localSettings.cardStyle);
        root.setAttribute('data-outfit', localSettings.outfit);

        const body = document.body;
        body.classList.remove('sidebar-mini', 'sidebar-float', 'ui-neo', 'ui-minimal', 'ui-glass');
        if (localSettings.sidebarStyle === 'mini') body.classList.add('sidebar-mini');
        if (localSettings.sidebarStyle === 'float') body.classList.add('sidebar-float');
        if (localSettings.cardStyle === 'neo') body.classList.add('ui-neo');
        if (localSettings.cardStyle === 'minimal') body.classList.add('ui-minimal');
        if (localSettings.cardStyle === 'glass') body.classList.add('ui-glass');

        root.style.setProperty('--sidebar-primary', colors.primary);
        root.style.setProperty('--sidebar-ring', colors.primary);
        root.style.setProperty('--accent-gradient', localSettings.accentGradient ? '1' : '0');

        // Effects Attributes
        root.setAttribute('data-grain', localSettings.showGrain ? 'true' : 'false');
        root.setAttribute('data-glow', localSettings.accentGradient ? 'true' : 'false');

        root.style.setProperty('--anim-speed', localSettings.animSpeed.toString());

        root.style.setProperty('--glass-blur', BLUR_MAP[localSettings.blurIntensity]);
        // UNIFIED RADIUS: Slider controls global radius
        root.style.setProperty('--radius', `${localSettings.cardRoundness}px`);
        root.style.setProperty('--spacing-multiplier', DENSITY_MAP[localSettings.uiDensity]);

        // Granular customization
        root.style.setProperty('--card-radius', `${localSettings.cardRoundness}px`);
        root.style.setProperty('--glass-opacity', `${localSettings.glassOpacity / 100}`);
        root.style.setProperty('--card-glow-strength', `${localSettings.cardGlowStrength / 100}`);
        root.style.setProperty('--text-glow', localSettings.textGlow ? '0 0 10px var(--primary)' : 'none');
    }, [localSettings, isLocalLoaded, isDesktop]);

    const updateSettings = async (newSettings: Partial<UserSettings>) => {
        // Automatically sync cardRoundness when borderStyle changes
        if (newSettings.borderStyle) {
            newSettings.cardRoundness = RADIUS_MAP[newSettings.borderStyle];
        }

        const updated = { ...localSettings, ...newSettings };

        // Force light theme for XP and Mac outfits when they are first selected
        if (newSettings.outfit === 'windows-xp' || newSettings.outfit === 'mac-os') {
            // Need a way to set next-themes theme. 
            // In Next.js with next-themes, we usually use useTheme()
            // Since we're in a provider, we can't use useTheme() here easily if it's outside.
            // But we can manually set it in localStorage and trigger a refresh or use document.documentElement
            document.documentElement.classList.remove('dark');
            document.documentElement.style.colorScheme = 'light';
            localStorage.setItem('theme', 'light');
        }

        setLocalSettings(updated);
        localStorage.setItem('tool-dady-settings', JSON.stringify(updated));
    };

    const value = {
        settings: localSettings,
        updateSettings,
        isLoading: !isLocalLoaded,
        settingsOpen,
        setSettingsOpen
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
                <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
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
