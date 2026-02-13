'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useUser, useAuth, useFirebase } from '@/firebase';
import { updateProfile, GoogleAuthProvider, reauthenticateWithPopup, EmailAuthProvider, reauthenticateWithCredential, sendPasswordResetEmail } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { Settings, Type, Palette, CheckCircle2, Layers, Maximize, Activity, Gauge, Image as ImageIcon, Sparkles, UserIcon, ShieldCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useSettings, type FontPair, type ColorTheme, type BlurIntensity, type BorderStyle, type UIDensity, type BGStyle, type SidebarStyle, type CardStyle } from '@/components/settings-provider';
// @ts-ignore
import { Slider } from '@/components/ui/slider';
import { ScrollArea } from '@/components/ui/scroll-area';
import { deleteUserData, deleteUserAccount } from '@/lib/user-data-service';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Lock, Bell, FileText, Trash2, HelpCircle, CloudOff, LayoutTemplate, Shield, LogOut, Database, ChevronRight, Heart, Share2, ExternalLink, MessageCircle, AlertCircle } from 'lucide-react';

interface SettingsContentProps {
    isDialog?: boolean;
    onClose?: () => void;
}

export function SettingsContent({ isDialog = false, onClose }: SettingsContentProps) {
    const { user } = useUser();
    const auth = useAuth();
    const router = useRouter();
    const { firestore } = useFirebase();
    const { toast } = useToast();
    const { settings, updateSettings } = useSettings();
    const [showAllFonts, setShowAllFonts] = useState(false);
    const [newDisplayName, setNewDisplayName] = useState(user?.displayName || '');
    const [isAdmin, setIsAdmin] = useState(false);
    const [isDeletingData, setIsDeletingData] = useState(false);
    const [isDeletingAccount, setIsDeletingAccount] = useState(false);
    const [showDisablePersistenceDialog, setShowDisablePersistenceDialog] = useState(false);

    const [isReauthenticating, setIsReauthenticating] = useState(false);

    // Re-authentication state
    const [showReauthDialog, setShowReauthDialog] = useState(false);
    const [reauthPassword, setReauthPassword] = useState('');

    // Fetch isAdmin status
    useEffect(() => {
        async function checkAdmin() {
            if (user && firestore) {
                const { getDoc } = await import('firebase/firestore');
                const userDoc = await getDoc(doc(firestore, 'users', user.uid));
                if (userDoc.exists()) {
                    setIsAdmin(!!userDoc.data()?.isAdmin);
                }
            }
        }
        checkAdmin();
    }, [user, firestore]);


    const handleDataPersistenceChange = async (enabled: boolean) => {
        if (!enabled) {
            // Logic handled by AlertDialog
        } else {
            await updateSettings({ dataPersistence: true });
            toast({ title: "Cloud Storage Enabled", description: "Your data will now be saved to the cloud." });
        }
    };

    const confirmDisablePersistence = async () => {
        setIsDeletingData(true);
        try {
            if (user && firestore) {
                await deleteUserData(firestore, user.uid);
            }
            await updateSettings({ dataPersistence: false });
            toast({ title: "Cloud Storage Disabled", description: "All cloud data has been deleted." });
        } catch (error) {
            console.error(error);
            toast({ title: "Error", description: "Failed to delete data.", variant: "destructive" });
        } finally {
            setIsDeletingData(false);
        }
    };

    const handleReauthAndDelete = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!auth.currentUser || !firestore) return;

        setIsReauthenticating(true);
        try {
            const credential = EmailAuthProvider.credential(auth.currentUser.email!, reauthPassword);
            await reauthenticateWithCredential(auth.currentUser, credential);

            // Re-auth successful, delete account
            await deleteUserAccount(firestore, auth.currentUser);
            setShowReauthDialog(false);
            if (onClose) onClose();
            toast({ title: "Account Deleted", description: "We're sorry to see you go." });
            window.location.href = '/';

        } catch (error: any) {
            console.log("Re-auth failed:", error.code);
            if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
                toast({ title: "Incorrect Password", description: "Please try again.", variant: "destructive" });
            } else {
                toast({ title: "Verification Failed", description: error.message, variant: "destructive" });
            }
        } finally {
            setIsReauthenticating(false);
        }
    };

    const handleDeleteAccount = async () => {
        setIsDeletingAccount(true);
        try {
            if (!user || !firestore || !auth.currentUser) {
                toast({ title: "Error", description: "Failed to delete account. Please try again later.", variant: "destructive" });
                return;
            }

            await deleteUserAccount(firestore, auth.currentUser);
            if (onClose) onClose();
            toast({ title: "Account Deleted", description: "We're sorry to see you go." });
            window.location.href = '/';
        } catch (error: any) {
            if (error.code === 'auth/requires-recent-login') {
                console.log("Re-authentication required.");
                // Check provider to decide re-auth method
                const providerId = auth.currentUser?.providerData[0]?.providerId;

                if (providerId === 'password') {
                    // Show password dialog
                    setShowReauthDialog(true);
                    toast({ title: "Security Check", description: "Please enter your password to confirm deletion." });
                } else if (providerId === 'google.com') {
                    // Google Re-auth
                    toast({ title: "Security Check", description: "Please sign in again to confirm account deletion." });
                    try {
                        if (auth.currentUser) {
                            const provider = new GoogleAuthProvider();
                            await reauthenticateWithPopup(auth.currentUser, provider);

                            // Retry deletion after successful re-auth
                            if (firestore) {
                                await deleteUserAccount(firestore, auth.currentUser);
                                if (onClose) onClose();
                                toast({ title: "Account Deleted", description: "We're sorry to see you go." });
                                window.location.href = '/';
                            }
                        }
                    } catch (reAuthError: any) {
                        console.error("Re-auth failed", reAuthError);
                        if (reAuthError.code === 'auth/popup-closed-by-user') {
                            toast({ title: "Action Cancelled", description: "Account deletion cancelled." });
                        } else if (reAuthError.code === 'auth/cancelled-popup-request') {
                            // Ignore multiple popup requests
                        } else {
                            toast({ title: "Verification Failed", description: "Could not verify your identity. Account not deleted.", variant: "destructive" });
                        }
                    }
                } else {
                    toast({ title: "Security Check", description: "Please sign out and sign in again to delete your account.", variant: "destructive" });
                }
            } else {
                toast({ title: "Error", description: "Failed to delete account. Please try again later.", variant: "destructive" });
            }
        } finally {
            setIsDeletingAccount(false);
        }
    };

    return (
        <div
            className={cn("flex flex-col h-full overflow-hidden", !isDialog && "min-h-screen")}
            style={{
                backdropFilter: 'blur(var(--glass-blur, 12px))',
                background: 'hsl(var(--background) / var(--glass-opacity, 0.9))',
            } as React.CSSProperties}
        >
            <div className={cn("px-6 py-4 border-b border-border/50 flex items-center justify-between bg-muted/20", !isDialog && "pt-8 pb-6")}>
                <div className="flex items-center gap-2 text-xl font-bold font-headline">
                    <Settings className="h-5 w-5 text-primary" />
                    Settings
                </div>
            </div>

            <Tabs defaultValue="general" className="flex-1 flex flex-col overflow-hidden">
                <div className="px-6 pt-4">
                    <TabsList className="flex w-full overflow-x-auto sm:grid sm:grid-cols-3 h-auto p-0 sm:p-1 gap-2 sm:gap-1 no-scrollbar bg-transparent sm:bg-muted">
                        <TabsTrigger value="general" className="flex-shrink-0 px-4 py-2 rounded-full sm:rounded-sm border border-border/50 sm:border-transparent bg-background/50 sm:bg-transparent data-[state=active]:bg-primary data-[state=active]:text-primary-foreground sm:data-[state=active]:bg-background sm:data-[state=active]:text-foreground shadow-none">General</TabsTrigger>
                        <TabsTrigger value="privacy" className="flex-shrink-0 px-4 py-2 rounded-full sm:rounded-sm border border-border/50 sm:border-transparent bg-background/50 sm:bg-transparent data-[state=active]:bg-primary data-[state=active]:text-primary-foreground sm:data-[state=active]:bg-background sm:data-[state=active]:text-foreground shadow-none">Privacy & Account</TabsTrigger>
                        <TabsTrigger value="help" className="flex-shrink-0 px-4 py-2 rounded-full sm:rounded-sm border border-border/50 sm:border-transparent bg-background/50 sm:bg-transparent data-[state=active]:bg-primary data-[state=active]:text-primary-foreground sm:data-[state=active]:bg-background sm:data-[state=active]:text-foreground shadow-none">Help & Guide</TabsTrigger>
                    </TabsList>
                </div>

                <ScrollArea className="flex-1 px-6 py-4">
                    <TabsContent value="general" className="space-y-8 mt-0">
                        {/* ... Content same as before ... */}
                        <div className="text-sm text-muted-foreground mb-4">
                            Customize appearance and profile settings.
                        </div>

                        {/* Profile Section */}
                        {user && !user.isAnonymous && (
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 text-sm font-semibold opacity-70 uppercase tracking-wider text-primary">
                                    <UserIcon className="w-4 h-4" />
                                    <span>Profile</span>
                                </div>
                                <div className="space-y-2 bg-muted/30 p-4 rounded-xl border border-border/50">
                                    <Label htmlFor="display-name">Display Name</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            id="display-name"
                                            placeholder="Your name"
                                            value={newDisplayName}
                                            onChange={(e) => setNewDisplayName(e.target.value)}
                                            maxLength={25}
                                            className="border-primary/20"
                                        />
                                        <Button
                                            size="sm"
                                            onClick={async () => {
                                                if (user && !user.isAnonymous && auth.currentUser) {
                                                    await updateProfile(auth.currentUser, { displayName: newDisplayName });
                                                }
                                                await updateSettings({ displayName: newDisplayName });
                                                toast({ title: 'Profile Updated', description: "Username changed successfully." });
                                            }}
                                        >
                                            Save
                                        </Button>
                                    </div>

                                    {!isAdmin && (
                                        <div className="pt-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="w-full text-xs opacity-50 hover:opacity-100 justify-start px-0"
                                                onClick={async () => {
                                                    const code = window.prompt("Enter Admin Access Code:");
                                                    if (code === "tooldaddy-omlet-is-gay-famboy") {
                                                        if (!user || !firestore) return;
                                                        try {
                                                            await setDoc(doc(firestore, 'users', user.uid), { isAdmin: true }, { merge: true });
                                                            toast({ title: "Admin Access Granted", description: "You are now an admin. Refresh page to see changes." });
                                                            setIsAdmin(true);
                                                        } catch (e) {
                                                            console.error(e);
                                                            toast({ title: "Error", description: "Failed to update profile", variant: "destructive" });
                                                        }
                                                    } else if (code) {
                                                        toast({ title: "Invalid Code", variant: "destructive" });
                                                    }
                                                }}
                                            >
                                                <ShieldCheck className="mr-2 h-3 w-3" /> Request Admin Access
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Site Identity Section - Hidden on mobile */}
                        <div className="space-y-4 hidden md:block">
                            <div className="flex items-center gap-2 text-sm font-semibold opacity-70 uppercase tracking-wider text-primary">
                                <ShieldCheck className="w-4 h-4" />
                                dict<span>Brand Identity</span>
                            </div>
                            <div className="bg-muted/30 p-4 rounded-xl border border-border/50 space-y-3">
                                <Label className="text-xs font-bold uppercase opacity-50">Custom Site Title</Label>
                                <Input
                                    placeholder="e.g. My Tool Suite"
                                    value={settings.siteTitle}
                                    onChange={(e) => updateSettings({ siteTitle: e.target.value })}
                                    maxLength={25}
                                    className="h-9 bg-background/50 border-border/50 focus:border-primary/50 transition-colors"
                                />
                                <p className="text-[10px] text-muted-foreground italic">Changes the brand text in the sidebar and header.</p>
                            </div>
                        </div>

                        {/* Appearance Sections (Typography, Colors, etc.) */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-sm font-semibold opacity-70 uppercase tracking-wider text-primary">
                                <Type className="w-4 h-4" />
                                <span>Typography</span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {([
                                    { id: 'tech', label: 'Tech Vanguard', headline: 'var(--font-space-grotesk)', body: 'var(--font-inter)' },
                                    { id: 'modern', label: 'Modern Minimal', headline: 'var(--font-outfit)', body: 'var(--font-plus-jakarta-sans)' },
                                    { id: 'classic', label: 'Classic Pro', headline: 'var(--font-inter)', body: 'var(--font-inter)' },
                                    { id: 'friendly', label: 'Friendly', headline: 'var(--font-quicksand)', body: 'var(--font-nunito)' },
                                    { id: 'elegant', label: 'Elegant', headline: 'var(--font-playfair-display)', body: 'var(--font-lora)' },
                                    { id: 'futuristic', label: 'Futuristic', headline: 'var(--font-syne)', body: 'var(--font-inter)' },
                                    { id: 'monospace', label: 'Monospace', headline: 'var(--font-jetbrains-mono)', body: 'var(--font-roboto-mono)' },
                                    { id: 'playful', label: 'Playful', headline: 'var(--font-fredoka)', body: 'var(--font-quicksand)' },
                                    { id: 'royal', label: 'Royal', headline: 'var(--font-cinzel)', body: 'var(--font-eb-garamond)' },
                                ] as { id: FontPair; label: string; headline: string; body: string }[]).slice(0, showAllFonts ? undefined : 4).map((f) => (
                                    <button
                                        key={f.id}
                                        onClick={() => updateSettings({ fontPair: f.id })}
                                        className={cn(
                                            "flex flex-col items-start p-3 rounded-xl border text-left transition-all glow-card",
                                            settings.fontPair === f.id
                                                ? "border-primary bg-primary/10 glow-sm"
                                                : "border-border/50 bg-muted/30 hover:bg-muted/50"
                                        )}
                                    >
                                        <div className="flex justify-between w-full items-start mb-2">
                                            <span className="text-[10px] font-bold opacity-70 uppercase tracking-tight">{f.label}</span>
                                            {settings.fontPair === f.id && <CheckCircle2 className="w-3 h-3 text-primary" />}
                                        </div>
                                        <span className="text-lg font-bold block mb-1" style={{ fontFamily: f.headline }}>ABC</span>
                                        <span className="text-xs opacity-80 leading-tight" style={{ fontFamily: f.body }}>Preview text.</span>
                                    </button>
                                ))}
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowAllFonts(!showAllFonts)}
                                className="w-full text-xs font-bold opacity-60 hover:opacity-100 mt-2"
                            >
                                {showAllFonts ? 'Show Less' : 'Show More Fonts'}
                            </Button>
                        </div>

                        {/* Color Themes */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-sm font-semibold opacity-70 uppercase tracking-wider text-primary">
                                <Palette className="w-4 h-4" />
                                <span>Brand Style</span>
                            </div>

                            <div className="flex flex-wrap gap-4 justify-between px-2 bg-muted/30 p-4 rounded-xl border border-border/50">
                                {([
                                    { id: 'rose', color: '#fb7185' },
                                    { id: 'sunset', color: '#fb923c' },
                                    { id: 'amber', color: '#f97316' },
                                    { id: 'emerald', color: '#34d399' },
                                    { id: 'green', color: '#10b981' },
                                    { id: 'cyan', color: '#06b6d4' },
                                    { id: 'blue', color: '#3b82f6' },
                                    { id: 'indigo', color: '#818cf8' },
                                    { id: 'purple', color: '#a855f7' },
                                    { id: 'slate', color: '#94a3b8' }
                                ] as { id: ColorTheme; color: string }[]).map((c) => (
                                    <button
                                        key={c.id}
                                        onClick={() => updateSettings({ colorTheme: c.id })}
                                        className={cn(
                                            "relative w-10 h-10 rounded-full border-2 transition-all flex items-center justify-center hover:scale-110",
                                            settings.colorTheme === c.id ? "border-primary p-0.5" : "border-transparent"
                                        )}
                                    >
                                        <div className="w-full h-full rounded-full shadow-inner" style={{ backgroundColor: c.color }} />
                                        {settings.colorTheme === c.id && (
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-full">
                                                <CheckCircle2 className="w-5 h-5 text-white" />
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* UI Layout Features */}
                        <div className="space-y-6 pt-4 border-t border-border/50">
                            <div className="flex items-center gap-2 text-sm font-semibold opacity-70 uppercase tracking-wider text-primary">
                                <LayoutTemplate className="w-4 h-4" />
                                <span>Workspace Layout</span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-3 bg-muted/30 p-4 rounded-xl border border-border/50 hidden md:block">
                                    <Label className="flex items-center gap-2 text-xs font-bold uppercase opacity-50">
                                        <Database className="w-3 h-3 text-primary" /> Sidebar Style
                                    </Label>
                                    <div className="flex gap-1 bg-background/50 p-1 rounded-lg">
                                        {(['full', 'mini', 'float'] as SidebarStyle[]).map((s) => (
                                            <Button
                                                key={s}
                                                variant={settings.sidebarStyle === s ? 'default' : 'ghost'}
                                                size="sm"
                                                className="flex-1 text-[10px] h-8 rounded-md capitalize"
                                                onClick={() => updateSettings({ sidebarStyle: s })}
                                            >
                                                {s}
                                            </Button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-3 bg-muted/30 p-4 rounded-xl border border-border/50">
                                    <Label className="flex items-center gap-2 text-xs font-bold uppercase opacity-50">
                                        <Layers className="w-3 h-3 text-primary" /> Card Aesthetic
                                    </Label>
                                    <div className="flex gap-1 bg-background/50 p-1 rounded-lg">
                                        {(['glass', 'neo', 'minimal'] as CardStyle[]).map((c) => (
                                            <Button
                                                key={c}
                                                variant={settings.cardStyle === c ? 'default' : 'ghost'}
                                                size="sm"
                                                className="flex-1 text-[10px] h-8 rounded-md capitalize"
                                                onClick={() => updateSettings({ cardStyle: c })}
                                            >
                                                {c}
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Visual Refinement Section */}
                        <div className="space-y-6 pt-4 border-t border-border/50">
                            <div className="flex items-center gap-2 text-sm font-semibold opacity-70 uppercase tracking-wider text-primary">
                                <Maximize className="w-4 h-4" />
                                <span>Visual Refinement</span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-muted/30 p-4 rounded-xl border border-border/50">
                                <div className="space-y-3">
                                    <Label className="flex items-center gap-2 text-[10px] font-bold uppercase opacity-50">
                                        <Layers className="w-3 h-3 text-primary" /> Glass Intensity
                                    </Label>
                                    <div className="flex gap-1 bg-background/40 p-1 rounded-lg">
                                        {(['low', 'medium', 'high'] as BlurIntensity[]).map((b) => (
                                            <Button
                                                key={b}
                                                variant={settings.blurIntensity === b ? 'default' : 'ghost'}
                                                size="sm"
                                                className="flex-1 text-[10px] h-7 rounded-md capitalize"
                                                onClick={() => {
                                                    const BLUR_PRESETS = { low: '4px', medium: '16px', high: '32px' };

                                                    // 1. Immediate Visual Update
                                                    document.documentElement.style.setProperty('--glass-blur', BLUR_PRESETS[b]);

                                                    // 2. Persist
                                                    updateSettings({ blurIntensity: b });
                                                }}
                                            >
                                                {b}
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <Label className="flex items-center gap-2 text-[10px] font-bold uppercase opacity-50">
                                        <Maximize className="w-3 h-3 text-primary" /> Corner Style
                                    </Label>
                                    <div className="flex gap-1 bg-background/40 p-1 rounded-lg">
                                        {(['sharp', 'smooth', 'round'] as BorderStyle[]).map((s) => (
                                            <Button
                                                key={s}
                                                variant={settings.borderStyle === s ? 'default' : 'ghost'}
                                                size="sm"
                                                className="flex-1 text-[10px] h-7 rounded-md capitalize"
                                                onClick={() => {
                                                    const CORNER_PRESETS = { sharp: 0, smooth: 12, round: 24 }; // Pixels
                                                    const newRadius = CORNER_PRESETS[s];

                                                    // 1. Update React State & Persistence
                                                    updateSettings({
                                                        borderStyle: s,
                                                        cardRoundness: newRadius
                                                    });

                                                    // 2. Force Immediate CSS Update (Bypasses React Cycle lag)
                                                    document.documentElement.style.setProperty('--radius', `${newRadius}px`);
                                                    document.documentElement.style.setProperty('--card-radius', `${newRadius}px`);
                                                }}
                                            >
                                                {s}
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-3 hidden sm:block">
                                    <Label className="flex items-center gap-2 text-[10px] font-bold uppercase opacity-50">
                                        <Activity className="w-3 h-3 text-primary" /> UI Density
                                    </Label>
                                    <div className="flex gap-1 bg-background/40 p-1 rounded-lg">
                                        {(['compact', 'standard', 'cozy'] as UIDensity[]).map((d) => (
                                            <Button key={d} variant={settings.uiDensity === d ? 'default' : 'ghost'} size="sm" className="flex-1 text-[10px] h-7 rounded-md capitalize" onClick={() => updateSettings({ uiDensity: d })}>{d}</Button>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <Label className="flex items-center gap-2 text-[10px] font-bold uppercase opacity-50">
                                        <ImageIcon className="w-3 h-3 text-primary" /> Background
                                    </Label>
                                    <div className="flex gap-1 bg-background/40 p-1 rounded-lg">
                                        {(['dark', 'mesh', 'pulse'] as BGStyle[]).map((bg) => (
                                            <Button key={bg} variant={settings.bgStyle === bg ? 'default' : 'ghost'} size="sm" className="flex-1 text-[10px] h-7 rounded-md capitalize" onClick={() => updateSettings({ bgStyle: bg })}>{bg}</Button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Granular Card Customization */}
                            <div className="space-y-4 pt-2">
                                <Label className="flex items-center gap-2 text-xs font-bold uppercase opacity-50">
                                    <Layers className="w-3 h-3 text-primary" /> Card Customization
                                </Label>
                                <div className="bg-muted/30 p-4 rounded-xl border border-border/50 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <Label className="text-[10px] font-medium">Roundness</Label>
                                            <span className="text-[10px] text-muted-foreground">{settings.cardRoundness}px</span>
                                        </div>
                                        <Slider
                                            value={[settings.cardRoundness]}
                                            min={0}
                                            max={60}
                                            step={1}
                                            onValueChange={([v]) => {
                                                updateSettings({ cardRoundness: v });
                                                document.documentElement.style.setProperty('--radius', `${v}px`);
                                                document.documentElement.style.setProperty('--card-radius', `${v}px`);
                                            }}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <Label className="text-[10px] font-medium">Glass Opacity</Label>
                                            <span className="text-[10px] text-muted-foreground">{settings.glassOpacity}%</span>
                                        </div>
                                        <Slider
                                            value={[settings.glassOpacity]}
                                            min={0}
                                            max={100}
                                            step={1}
                                            onValueChange={([v]) => updateSettings({ glassOpacity: v })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <Label className="text-[10px] font-medium">Glow Strength</Label>
                                            <span className="text-[10px] text-muted-foreground">{settings.cardGlowStrength}%</span>
                                        </div>
                                        <Slider
                                            value={[settings.cardGlowStrength]}
                                            min={0}
                                            max={100}
                                            step={1}
                                            onValueChange={([v]) => updateSettings({ cardGlowStrength: v })}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between pt-2">
                                        <Label className="text-[10px] font-medium">Text Glow Effect</Label>
                                        <Switch
                                            checked={settings.textGlow}
                                            onCheckedChange={(v) => updateSettings({ textGlow: v })}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Advanced Feel - Effects & Polish */}
                        <div className="space-y-4 pt-4 border-t border-border/50">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2 text-sm font-semibold opacity-70 uppercase tracking-wider text-primary">
                                    <Sparkles className="w-4 h-4" />
                                    <span>Experience Polish</span>
                                </div>
                                <div className="flex items-center gap-1.5 opacity-80 pl-6">
                                    <AlertCircle className="w-3 h-3 text-red-500" />
                                    <p className="text-[10px] text-red-500 font-medium italic">Enabling these features may slow down your site speed</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 px-2">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label className="text-sm font-medium">Glow Gradients</Label>
                                        <p className="text-[10px] text-muted-foreground">Add neon glows to brand elements</p>
                                    </div>
                                    <Switch checked={settings.accentGradient} onCheckedChange={(v) => updateSettings({ accentGradient: v })} />
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label className="text-sm font-medium">Grain Texture</Label>
                                        <p className="text-[10px] text-muted-foreground">High-end subtle film grain overlay</p>
                                    </div>
                                    <Switch checked={settings.showGrain} onCheckedChange={(v) => updateSettings({ showGrain: v })} />
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label className="text-sm font-medium">Scroll Progress</Label>
                                        <p className="text-[10px] text-muted-foreground">Top bar showing scroll depth</p>
                                    </div>
                                    <Switch checked={settings.showScrollIndicator} onCheckedChange={(v) => updateSettings({ showScrollIndicator: v })} />
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label className="text-sm font-medium">UI Sound Effects</Label>
                                        <p className="text-[10px] text-muted-foreground">Subtle audible feedback on clicks</p>
                                    </div>
                                    <Switch checked={settings.enableSound} onCheckedChange={(v) => updateSettings({ enableSound: v })} />
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label className="text-sm font-medium">Cursor Effects</Label>
                                        <p className="text-[10px] text-muted-foreground">Interactive sparkles following mouse</p>
                                    </div>
                                    <Switch checked={settings.showCursorEffect} onCheckedChange={(v) => updateSettings({ showCursorEffect: v })} />
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label className="text-sm font-medium">Animation Speed</Label>
                                        <p className="text-[10px] text-muted-foreground">Adjust responsiveness of transitions</p>
                                    </div>
                                    <div className="w-24 px-2">
                                        <Slider
                                            value={[settings.animSpeed]}
                                            min={0.5}
                                            max={2}
                                            step={0.1}
                                            onValueChange={([v]) => updateSettings({ animSpeed: v })}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="privacy" className="space-y-6 mt-0">
                        <div className="text-sm text-muted-foreground mb-4">
                            Manage how your data is stored and used.
                        </div>

                        <div className="space-y-6">
                            {/* Data Persistence */}
                            <div className="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-muted/30 hover:bg-muted/40 transition-colors">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 font-semibold">
                                        <Database className="w-4 h-4 text-primary" />
                                        Data Persistence
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Save your palettes, todo lists, and history to the cloud. Disabling this will delete your cloud data.
                                    </p>
                                </div>
                                <Switch
                                    checked={settings.dataPersistence}
                                    onCheckedChange={(checked) => {
                                        if (checked) {
                                            handleDataPersistenceChange(true);
                                        } else {
                                            setShowDisablePersistenceDialog(true);
                                        }
                                    }}
                                />
                            </div>

                            <AlertDialog open={showDisablePersistenceDialog} onOpenChange={setShowDisablePersistenceDialog}>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Disable Cloud Storage?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This will <strong>permanently delete</strong> all your saved data (History, Palettes, Todos) from our servers.
                                            Future data will not be saved. This action cannot be undone.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction
                                            onClick={async (e) => {
                                                e.preventDefault(); // Prevent auto-close to show loading state if needed, though we use isDeletingData
                                                await confirmDisablePersistence();
                                                setShowDisablePersistenceDialog(false);
                                            }}
                                            className="bg-destructive hover:bg-destructive/90"
                                        >
                                            {isDeletingData ? 'Deleting...' : 'Yes, Delete My Data'}
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>

                            {/* Notifications */}
                            <div className="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-muted/30 hover:bg-muted/40 transition-colors">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 font-semibold">
                                        <Bell className="w-4 h-4 text-primary" />
                                        Notifications
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Receive updates and alerts from Tool Daddy.
                                    </p>
                                </div>
                                <Switch
                                    checked={settings.notifications}
                                    onCheckedChange={(checked) => updateSettings({ notifications: checked })}
                                />
                            </div>

                            {/* Account Management & Admin */}
                            <div className="space-y-3 pt-4">
                                <h3 className="text-xs font-bold uppercase opacity-50 tracking-wider">Account Management</h3>
                                <div className="grid grid-cols-1 gap-3">
                                    {isAdmin && (
                                        <Button
                                            variant="outline"
                                            className="w-full justify-between h-12 bg-primary/5 border-primary/20 hover:bg-primary/10 group"
                                            onClick={() => {
                                                if (onClose) onClose();
                                                router.push('/admin/dashboard');
                                            }}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                                    <ShieldCheck className="w-4 h-4 text-primary" />
                                                </div>
                                                <div className="text-left">
                                                    <span className="block text-sm font-bold">Admin Dashboard</span>
                                                    <span className="text-[10px] text-muted-foreground">Manage site systems</span>
                                                </div>
                                            </div>
                                            <ChevronRight className="w-4 h-4 opacity-50 group-hover:translate-x-0.5 transition-transform" />
                                        </Button>
                                    )}

                                    <Button
                                        variant="outline"
                                        className="w-full justify-between h-12 bg-muted/30 border-border/50 hover:bg-muted/50 group"
                                        onClick={async () => {
                                            try {
                                                await auth.signOut();
                                                if (onClose) onClose();
                                                toast({ title: "Logged Out", description: "Come back soon!" });
                                                router.push('/');
                                            } catch (error) {
                                                toast({ title: "Error", description: "Failed to log out", variant: "destructive" });
                                            }
                                        }}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                                                <LogOut className="w-4 h-4" />
                                            </div>
                                            <div className="text-left">
                                                <span className="block text-sm font-bold">Sign Out</span>
                                                <span className="text-[10px] text-muted-foreground">End your session</span>
                                            </div>
                                        </div>
                                        <ChevronRight className="w-4 h-4 opacity-50 group-hover:translate-x-0.5 transition-transform" />
                                    </Button>
                                </div>
                            </div>

                            {/* Privacy Policy */}
                            <Dialog>
                                <DialogTrigger asChild>
                                    <button className="w-full flex items-center justify-between p-4 rounded-xl border border-border/50 bg-muted/30 hover:bg-muted/40 transition-colors text-left">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 font-semibold">
                                                <Shield className="w-4 h-4 text-primary" />
                                                Privacy Policy
                                            </div>
                                            <p className="text-xs text-muted-foreground">
                                                Read about how we handle your data and privacy.
                                            </p>
                                        </div>
                                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                                    </button>
                                </DialogTrigger>
                                <DialogContent className="w-[calc(100%-2rem)] sm:max-w-[600px] h-[80vh] sm:h-[70vh] flex flex-col border-primary/20 bg-background/95 backdrop-blur-3xl p-0 overflow-hidden rounded-3xl sm:rounded-xl">
                                    <div className="px-6 py-4 pt-8 sm:pt-4 border-b border-border/50 flex items-center justify-between bg-muted/20">
                                        <DialogTitle className="flex items-center gap-2 text-xl font-bold font-headline">
                                            <Shield className="h-5 w-5 text-primary" />
                                            Privacy Policy
                                        </DialogTitle>
                                    </div>
                                    <ScrollArea className="flex-1 px-6 py-4">
                                        <div className="space-y-4 text-sm text-foreground/80">
                                            <p className="font-bold text-xs text-muted-foreground uppercase tracking-wider mb-2">Last Updated: October 2026</p>

                                            <p>
                                                At Tool Daddy, we prioritize your privacy. We believe in transparency and user control. We calculate nothing, store only what you ask us to, and sell nothing.
                                            </p>

                                            <div className="space-y-2">
                                                <h3 className="font-bold text-primary">1. Data Collection</h3>
                                                <p>We collect minimal information to provide our services:</p>
                                                <ul className="list-disc list-inside pl-2 space-y-1 text-muted-foreground">
                                                    <li><strong>Authentication:</strong> Your email and basic profile info (via Firebase Auth) to identify you.</li>
                                                    <li><strong>User Content:</strong> Data generated by you (todo lists, color palettes, history) is stored in our database for your convenience.</li>
                                                </ul>
                                            </div>

                                            <div className="space-y-2">
                                                <h3 className="font-bold text-primary">2. Data Usage</h3>
                                                <p>Your data is used solely to provide the functionality of the application. We do not analyze, sell, or share your personal data with third parties.</p>
                                            </div>

                                            <div className="space-y-2">
                                                <h3 className="font-bold text-primary">3. Data Persistence</h3>
                                                <p>By default, your generated content is saved to the cloud so you can access it from any device. You can disable this feature at any time in the settings. Disabling persistence will permanently delete your cloud data.</p>
                                            </div>

                                            <div className="space-y-2">
                                                <h3 className="font-bold text-primary">4. User Rights</h3>
                                                <p>You have full control over your data. You can:</p>
                                                <ul className="list-disc list-inside pl-2 space-y-1 text-muted-foreground">
                                                    <li><strong>Access:</strong> View your data at any time.</li>
                                                    <li><strong>Delete:</strong> Permanently delete your account and all associated data via the "Delete Account" button in settings.</li>
                                                </ul>
                                            </div>
                                        </div>
                                    </ScrollArea>
                                    <DialogFooter className="px-6 py-4 border-t border-border/50 bg-muted/20">
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>

                            {/* Delete Account */}
                            <div className="p-4 rounded-xl border border-destructive/20 bg-destructive/5 space-y-3 mt-8">
                                <div className="flex items-center gap-2 font-semibold text-destructive">
                                    <Trash2 className="w-4 h-4" />
                                    Danger Zone
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Permanently delete your account and all data.
                                </p>

                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="destructive" className="w-full">Delete Account</Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                This action cannot be undone. This will permanently delete your account and remove your data from our servers.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive hover:bg-destructive/90">
                                                {isDeletingAccount ? 'Goodbye...' : 'Yes, Delete Account'}
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="help" className="space-y-6 mt-0">
                        <div className="space-y-4">
                            <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 flex flex-col space-y-2">
                                <div className="flex items-center gap-2 font-bold text-lg text-primary">
                                    <Sparkles className="w-5 h-5" />
                                    Getting Started
                                </div>
                                <p className="text-sm text-foreground/80">
                                    Welcome to Tool Daddy! We offer a suite of free, privacy-focused tools to help you create, edit, and organize. All processing happens securely, and your data stays with you.
                                </p>
                            </div>

                            <Accordion type="single" collapsible className="w-full">
                                <AccordionItem value="media-tools">
                                    <AccordionTrigger className="font-semibold">Media Tools</AccordionTrigger>
                                    <AccordionContent className="space-y-3 pt-2">
                                        <div className="grid gap-2 text-sm text-muted-foreground">
                                            <div className="p-2 rounded-lg bg-muted/40 hover:bg-muted/60 transition-colors">
                                                <span className="font-bold text-foreground block">AI Image Enhancer</span>
                                                Upscale low-resolution images and remove noise using advanced AI models.
                                            </div>
                                            <div className="p-2 rounded-lg bg-muted/40 hover:bg-muted/60 transition-colors">
                                                <span className="font-bold text-foreground block">Image & Video Compressor</span>
                                                Reduce file sizes efficiently without sacrificing visual quality. Ideal for web optimization.
                                            </div>
                                            <div className="p-2 rounded-lg bg-muted/40 hover:bg-muted/60 transition-colors">
                                                <span className="font-bold text-foreground block">YouTube Downloader</span>
                                                Download videos and audio directly from YouTube for offline access.
                                            </div>
                                            <div className="p-2 rounded-lg bg-muted/40 hover:bg-muted/60 transition-colors">
                                                <span className="font-bold text-foreground block">Converters</span>
                                                Easily convert images (PNG/JPG/WEBP) and videos to audio formats.
                                            </div>
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>

                                <AccordionItem value="productivity">
                                    <AccordionTrigger className="font-semibold">Productivity</AccordionTrigger>
                                    <AccordionContent className="space-y-3 pt-2">
                                        <div className="grid gap-2 text-sm text-muted-foreground">
                                            <div className="p-2 rounded-lg bg-muted/40 hover:bg-muted/60 transition-colors">
                                                <span className="font-bold text-foreground block">Simple Notepad</span>
                                                A distraction-free space for jotting down ideas. Notes are saved automatically.
                                            </div>
                                            <div className="p-2 rounded-lg bg-muted/40 hover:bg-muted/60 transition-colors">
                                                <span className="font-bold text-foreground block">Todo List</span>
                                                Manage your tasks with multiple lists. Syncs across devices if Cloud Storage is enabled.
                                            </div>
                                            <div className="p-2 rounded-lg bg-muted/40 hover:bg-muted/60 transition-colors">
                                                <span className="font-bold text-foreground block">Scanning & Security</span>
                                                Generate secure passwords and create custom QR codes instantly.
                                            </div>
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>

                                <AccordionItem value="creative">
                                    <AccordionTrigger className="font-semibold">Creative Suite</AccordionTrigger>
                                    <AccordionContent className="space-y-3 pt-2">
                                        <div className="grid gap-2 text-sm text-muted-foreground">
                                            <div className="p-2 rounded-lg bg-muted/40 hover:bg-muted/60 transition-colors">
                                                <span className="font-bold text-foreground block">Color Palettes</span>
                                                Generate harmonious color schemes or extract dominant colors from any image.
                                            </div>
                                            <div className="p-2 rounded-lg bg-muted/40 hover:bg-muted/60 transition-colors">
                                                <span className="font-bold text-foreground block">AI Playlist Maker</span>
                                                Create Spotify playlists based on your mood or activities using AI.
                                            </div>
                                            <div className="p-2 rounded-lg bg-muted/40 hover:bg-muted/60 transition-colors">
                                                <span className="font-bold text-foreground block">Drawing Canvas</span>
                                                Sketch and draw freely. Save your creations as images.
                                            </div>
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                                <AccordionItem value="utilities">
                                    <AccordionTrigger className="font-semibold">Utilities</AccordionTrigger>
                                    <AccordionContent className="space-y-3 pt-2">
                                        <div className="grid gap-2 text-sm text-muted-foreground">
                                            <div className="p-2 rounded-lg bg-muted/40 hover:bg-muted/60 transition-colors">
                                                <span className="font-bold text-foreground block">Metadata Extractor</span>
                                                View hidden details (Exif data) in your image files.
                                            </div>
                                            <div className="p-2 rounded-lg bg-muted/40 hover:bg-muted/60 transition-colors">
                                                <span className="font-bold text-foreground block">Timer & Stopwatch</span>
                                                Simple, reliable time tracking tools.
                                            </div>
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                                <AccordionItem value="data-privacy">
                                    <AccordionTrigger className="font-semibold">Data & Privacy</AccordionTrigger>
                                    <AccordionContent className="space-y-3 pt-2 text-sm text-muted-foreground">
                                        <p><strong>Cloud Sync:</strong> By default, we save your data (todos, palettes, history) to the cloud so you can access it anywhere. usage is tied to your account.</p>
                                        <p><strong>Local Mode:</strong> You can disable "Data Persistence" in the Privacy tab. This deletes cloud data and stores everything locally on your device instead.</p>
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>

                            <div className="space-y-3 pt-4 border-t border-border/50">
                                <h3 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">Support & Community</h3>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        onClick={() => {
                                            if (onClose) onClose();
                                            router.push('/buy-me-a-coffee');
                                        }}
                                        className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl border border-border/50 bg-muted/30 hover:bg-primary/10 hover:border-primary/30 transition-all group"
                                    >
                                        <Heart className="w-6 h-6 text-pink-500 group-hover:scale-110 transition-transform" />
                                        <div className="text-center">
                                            <span className="block font-bold text-sm">Buy us a Coffee</span>
                                            <span className="text-[10px] text-muted-foreground">Support development</span>
                                        </div>
                                    </button>
                                    <button
                                        onClick={() => {
                                            if (navigator.share) {
                                                navigator.share({
                                                    title: 'Tool Daddy',
                                                    text: 'Check out these awesome free tools!',
                                                    url: window.location.origin
                                                }).catch(() => { });
                                            } else {
                                                navigator.clipboard.writeText(window.location.origin);
                                                toast({ title: "Link Copied", description: "Share it with your friends!" });
                                            }
                                        }}
                                        className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl border border-border/50 bg-muted/30 hover:bg-blue-500/10 hover:border-blue-500/30 transition-all group"
                                    >
                                        <Share2 className="w-6 h-6 text-blue-500 group-hover:scale-110 transition-transform" />
                                        <div className="text-center">
                                            <span className="block font-bold text-sm">Share with Friends</span>
                                            <span className="text-[10px] text-muted-foreground">Spread the word</span>
                                        </div>
                                    </button>
                                    <button
                                        onClick={() => {
                                            if (onClose) onClose();
                                            router.push('/feedback');
                                        }}
                                        className="col-span-2 flex items-center justify-center gap-2 p-3 rounded-xl border border-border/50 bg-muted/30 hover:bg-muted/50 transition-colors"
                                    >
                                        <MessageCircle className="w-4 h-4 text-muted-foreground" />
                                        <span className="text-sm font-semibold">Report Bug / Suggest Feature</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </TabsContent>
                </ScrollArea>

                {isDialog && onClose && (
                    <div className="px-6 py-4 border-t border-border/50 bg-muted/20">
                        <Button className="w-full h-10 font-bold" onClick={onClose}>
                            Done
                        </Button>
                    </div>
                )}
            </Tabs>

            {/* Password Re-auth Dialog */}
            <Dialog open={showReauthDialog} onOpenChange={setShowReauthDialog}>
                <DialogContent className="sm:max-w-[400px] border-primary/20 bg-background/95 backdrop-blur-xl">
                    <DialogHeader>
                        <DialogTitle>Confirm Deletion</DialogTitle>
                        <DialogDescription>
                            Please enter your password to confirm permanently deleting your account.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleReauthAndDelete} className="space-y-4 pt-2">
                        <div className="space-y-2">
                            <Label htmlFor="current-password">Current Password</Label>
                            <Input
                                id="current-password"
                                type="password"
                                value={reauthPassword}
                                onChange={(e) => setReauthPassword(e.target.value)}
                                required
                            />
                            <div className="flex justify-end">
                                <Button
                                    type="button"
                                    variant="link"
                                    className="p-0 h-auto text-xs text-muted-foreground hover:text-primary"
                                    onClick={async () => {
                                        if (auth.currentUser?.email) {
                                            try {
                                                await sendPasswordResetEmail(auth, auth.currentUser.email);
                                                toast({ title: "Email Sent", description: "Password reset link sent to your email." });
                                            } catch (error: any) {
                                                console.error("Reset password error", error);
                                                toast({ title: "Error", description: error.message, variant: "destructive" });
                                            }
                                        }
                                    }}
                                >
                                    Forgot Password?
                                </Button>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="ghost" onClick={() => setShowReauthDialog(false)}>Cancel</Button>
                            <Button type="submit" variant="destructive" disabled={isReauthenticating}>
                                {isReauthenticating ? 'Verifying...' : 'Delete Account'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
