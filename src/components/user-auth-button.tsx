import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Link from 'next/link';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useUser, useAuth } from '@/firebase';
import { signOut, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail, sendSignInLinkToEmail, isSignInWithEmailLink, signInWithEmailLink } from 'firebase/auth';
import { LogIn, LogOut, User as UserIcon, Settings, Loader2, Sparkles, UserPlus, Type, Palette, CheckCircle2, Layers, Maximize, Activity, Gauge, Image as ImageIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { useSettings, type FontPair, type ColorTheme, type BlurIntensity, type BorderStyle, type UIDensity, type BGStyle } from '@/components/settings-provider';
import { updateProfile } from 'firebase/auth';
// @ts-ignore
import { motion, AnimatePresence } from 'framer-motion';
import { Slider } from '@/components/ui/slider';
import { ScrollArea } from '@/components/ui/scroll-area';

export function UserAuthButton() {
    const { user, isUserLoading } = useUser();
    const auth = useAuth();
    const { toast } = useToast();
    const { settings, updateSettings } = useSettings();
    const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);
    const [showAllFonts, setShowAllFonts] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [magicLinkSent, setMagicLinkSent] = useState(false);
    const [magicLinkEmail, setMagicLinkEmail] = useState('');

    // State for auth forms
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [authMode, setAuthMode] = useState<'login' | 'signup' | 'magic'>('login');
    const [newDisplayName, setNewDisplayName] = useState('');

    useEffect(() => {
        if (user?.displayName) {
            setNewDisplayName(user.displayName);
        }
    }, [user]);

    useEffect(() => {
        // Check for email link on load
        if (isSignInWithEmailLink(auth, window.location.href)) {
            let email = window.localStorage.getItem('emailForSignIn');
            if (!email) {
                // If email is not saved, prompt user (could be opened on a different device)
                email = window.prompt('Please provide your email for confirmation');
            }
            if (email) {
                setIsLoading(true);
                signInWithEmailLink(auth, email, window.location.href)
                    .then((result) => {
                        window.localStorage.removeItem('emailForSignIn');
                        toast({ title: 'Successfully signed in!', description: 'Welcome to Tool Daddy!' });
                        // Clear the URL parameters to avoid re-triggering
                        window.history.replaceState({}, document.title, window.location.pathname);
                    })
                    .catch((error) => {
                        toast({ title: 'Sign-in failed', description: error.message, variant: 'destructive' });
                    })
                    .finally(() => {
                        setIsLoading(false);
                    });
            }
        }
    }, [auth]);

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            if (authMode === 'login') {
                await signInWithEmailAndPassword(auth, email, password);
                toast({ title: "Signed in successfully" });
                setIsAuthDialogOpen(false);
            } else {
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                if (userCredential.user) {
                    await updateProfile(userCredential.user, { displayName: email.split('@')[0] });
                }
                toast({ title: "Account created successfully" });
                setIsAuthDialogOpen(false);
            }
        } catch (error: any) {
            toast({
                title: "Authentication failed",
                description: error.message,
                variant: 'destructive'
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleMagicLink = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        const actionCodeSettings = {
            // URL you want to redirect back to. The domain (tool-daddy.com) for this URL must be in the authorized domains list in the Firebase Console.
            url: window.location.href,
            handleCodeInApp: true,
        };

        try {
            await sendSignInLinkToEmail(auth, magicLinkEmail, actionCodeSettings);
            window.localStorage.setItem('emailForSignIn', magicLinkEmail);
            setMagicLinkSent(true);
            toast({ title: 'Link sent!', description: 'Check your email to sign in.' });
        } catch (error: any) {
            toast({ title: 'Error sending link', description: error.message, variant: 'destructive' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleForgotPassword = async () => {
        if (!email) {
            toast({ title: "Email required", description: "Please enter your email address first.", variant: 'destructive' });
            return;
        }
        setIsLoading(true);
        try {
            await sendPasswordResetEmail(auth, email);
            toast({ title: "Reset email sent", description: "Check your inbox for instructions." });
        } catch (error: any) {
            toast({
                title: "Failed to send reset email",
                description: error.message,
                variant: 'destructive'
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleSignOut = async () => {
        try {
            await signOut(auth);
            toast({ title: "Signed out", description: "See you next time!" });
        } catch (error: any) {
            toast({ title: "Error signing out", description: error.message, variant: 'destructive' });
        }
    };

    if (isUserLoading) {
        return (
            <Button variant="ghost" size="icon" className="w-10 h-10 rounded-full">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </Button>
        );
    }

    return (
        <>
            {user && !user.isAnonymous ? (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="relative h-10 w-auto rounded-full flex items-center gap-2 pl-2 pr-4 hover:bg-muted/50 transition-colors">
                            <Avatar className="h-8 w-8 border border-primary/20">
                                <AvatarImage src={user.photoURL || ''} alt={user.displayName || 'User'} />
                                <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                                    {(user.displayName || user.email || 'U').charAt(0).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col items-start text-sm">
                                <span className="font-semibold text-foreground/80 max-w-[100px] truncate">
                                    {user.displayName || 'User'}
                                </span>
                            </div>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" forceMount>
                        <DropdownMenuLabel className="font-normal">
                            <div className="flex flex-col space-y-1">
                                <p className="text-sm font-medium leading-none">{user.displayName || 'User'}</p>
                                <p className="text-xs leading-none text-muted-foreground">
                                    {user.email}
                                </p>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => setIsSettingsOpen(true)}>
                            <Settings className="mr-2 h-4 w-4" />
                            <span>Settings</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleSignOut} className="text-red-500 focus:text-red-500">
                            <LogOut className="mr-2 h-4 w-4" />
                            <span>Log out</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            ) : (
                <Button onClick={() => setIsAuthDialogOpen(true)} variant="default" size="sm" className="gap-2">
                    <LogIn className="h-4 w-4" />
                    <span className="hidden sm:inline">Sign In</span>
                </Button>
            )}

            <Dialog open={isAuthDialogOpen} onOpenChange={setIsAuthDialogOpen}>
                <DialogContent className="sm:max-w-[400px] border-primary/20 bg-background/95 backdrop-blur-xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-2xl font-bold font-headline">
                            <Sparkles className="h-6 w-6 text-primary" />
                            Tool Daddy Cloud
                        </DialogTitle>
                        <DialogDescription>
                            Sync your creations and settings across all your devices.
                        </DialogDescription>
                    </DialogHeader>

                    <Tabs defaultValue="login" className="w-full mt-4" onValueChange={(v) => { setAuthMode(v as any); setMagicLinkSent(false); }}>
                        <TabsList className="grid w-full grid-cols-3 bg-muted/50">
                            <TabsTrigger value="login">Sign In</TabsTrigger>
                            <TabsTrigger value="signup">Sign Up</TabsTrigger>
                            <TabsTrigger value="magic">Magic Link</TabsTrigger>
                        </TabsList>

                        {/* ... Login Tab ... */}
                        <TabsContent value="login" className="space-y-4 py-4 mt-0">
                            {/* ... existing login form ... */}
                            <form onSubmit={handleAuth} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="email-login">Email Address</Label>
                                    <Input
                                        id="email-login"
                                        type="email"
                                        placeholder="name@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="border-border/50 focus:border-primary/50"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="password-login">Password</Label>
                                        <button type="button" className="text-[10px] text-primary hover:underline" onClick={handleForgotPassword}>
                                            Forgot password?
                                        </button>
                                    </div>
                                    <Input
                                        id="password-login"
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="border-border/50 focus:border-primary/50"
                                        required
                                    />
                                </div>
                                <Button type="submit" className="w-full h-11" disabled={isLoading}>
                                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogIn className="mr-2 h-4 w-4" />}
                                    Sign In
                                </Button>
                            </form>
                        </TabsContent>

                        {/* ... Signup Tab ... */}
                        <TabsContent value="signup" className="space-y-4 py-4 mt-0">
                            {/* ... existing signup form ... */}
                            <form onSubmit={handleAuth} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="email-signup">Email Address</Label>
                                    <Input
                                        id="email-signup"
                                        type="email"
                                        placeholder="name@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="border-border/50 focus:border-primary/50"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="password-signup">Password</Label>
                                    <Input
                                        id="password-signup"
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="border-border/50 focus:border-primary/50"
                                        required
                                    />
                                </div>
                                <Button type="submit" className="w-full h-11" disabled={isLoading}>
                                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserPlus className="mr-2 h-4 w-4" />}
                                    Create Account
                                </Button>
                            </form>
                        </TabsContent>

                        {/* ... Magic Link Tab ... */}
                        <TabsContent value="magic" className="space-y-4 py-4 mt-0">
                            {magicLinkSent ? (
                                <div className="flex flex-col items-center justify-center space-y-4 py-6 text-center">
                                    <div className="rounded-full bg-green-500/10 p-3">
                                        <CheckCircle2 className="h-8 w-8 text-green-500" />
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="font-semibold text-lg">Check your email</h3>
                                        <p className="text-sm text-muted-foreground max-w-[260px] mx-auto">
                                            We sent a sign-in link to <span className="font-medium text-foreground">{magicLinkEmail}</span>
                                        </p>
                                    </div>
                                    <Button variant="outline" size="sm" onClick={() => setMagicLinkSent(false)}>
                                        Use a different email
                                    </Button>
                                </div>
                            ) : (
                                <form onSubmit={handleMagicLink} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="email-magic">Email Address</Label>
                                        <Input
                                            id="email-magic"
                                            type="email"
                                            placeholder="name@example.com"
                                            value={magicLinkEmail}
                                            onChange={(e) => setMagicLinkEmail(e.target.value)}
                                            className="border-border/50 focus:border-primary/50"
                                            required
                                        />
                                    </div>
                                    <div className="bg-primary/5 rounded-lg p-3 text-xs text-muted-foreground border border-primary/10">
                                        <p>We'll send you a magic link for a password-free sign in experience.</p>
                                    </div>
                                    <Button type="submit" className="w-full h-11" disabled={isLoading}>
                                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                                        Send Magic Link
                                    </Button>
                                </form>
                            )}
                        </TabsContent>
                    </Tabs>
                </DialogContent>
            </Dialog>

            <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
                <DialogContent className="sm:max-w-[550px] border-primary/20 bg-background/95 backdrop-blur-2xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-2xl font-bold font-headline">
                            <Settings className="h-6 w-6 text-primary" />
                            Personalization
                        </DialogTitle>
                        <DialogDescription>
                            Customize your Tool Daddy look and feel.
                        </DialogDescription>
                    </DialogHeader>

                    <ScrollArea className="max-h-[60vh] pr-4">
                        <div className="space-y-8 py-4">
                            {/* Profile Section */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 text-sm font-semibold opacity-70 uppercase tracking-wider">
                                    <UserIcon className="w-4 h-4" />
                                    <span>Profile</span>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="display-name">Username</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            id="display-name"
                                            placeholder="Your name"
                                            value={newDisplayName}
                                            onChange={(e) => setNewDisplayName(e.target.value)}
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
                                                setIsSettingsOpen(false);
                                            }}
                                        >
                                            Save
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            {/* Font Pairings Section */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 text-sm font-semibold opacity-70 uppercase tracking-wider">
                                    <Type className="w-4 h-4" />
                                    <span>Typography</span>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
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

                            {/* Color Themes Section */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 text-sm font-semibold opacity-70 uppercase tracking-wider">
                                    <Palette className="w-4 h-4" />
                                    <span>Color Themes</span>
                                </div>
                                <div className="flex flex-wrap gap-4 justify-between px-2">
                                    {([
                                        { id: 'purple', color: '#a855f7' },
                                        { id: 'cyan', color: '#06b6d4' },
                                        { id: 'green', color: '#10b981' },
                                        { id: 'blue', color: '#3b82f6' },
                                        { id: 'amber', color: '#f97316' },
                                        { id: 'rose', color: '#fb7185' },
                                        { id: 'indigo', color: '#818cf8' },
                                        { id: 'emerald', color: '#34d399' },
                                        { id: 'slate', color: '#94a3b8' },
                                        { id: 'sunset', color: '#fb923c' }
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

                            {/* Advanced Section - Desktop Only */}
                            <div className="hidden lg:block space-y-6 pt-4 border-t border-border/50">
                                <div className="flex items-center gap-2 text-sm font-semibold opacity-70 uppercase tracking-wider">
                                    <Sparkles className="w-4 h-4" />
                                    <span>Display & Feel</span>
                                </div>

                                {/* Blur */}
                                <div className="space-y-3">
                                    <Label className="flex items-center gap-2">
                                        <Layers className="w-4 h-4 text-primary" />
                                        Glass Intensity ({settings.blurIntensity})
                                    </Label>
                                    <div className="flex gap-2">
                                        {(['low', 'medium', 'high'] as BlurIntensity[]).map((b) => (
                                            <Button
                                                key={b}
                                                variant={settings.blurIntensity === b ? 'default' : 'outline'}
                                                size="sm"
                                                className="flex-1 text-[10px] uppercase font-bold"
                                                onClick={() => updateSettings({ blurIntensity: b })}
                                            >
                                                {b}
                                            </Button>
                                        ))}
                                    </div>
                                </div>

                                {/* Corners */}
                                <div className="space-y-3">
                                    <Label className="flex items-center gap-2">
                                        <Maximize className="w-4 h-4 text-primary" />
                                        Corner Style ({settings.borderStyle})
                                    </Label>
                                    <div className="flex gap-2">
                                        {(['sharp', 'smooth', 'round'] as BorderStyle[]).map((s) => (
                                            <Button
                                                key={s}
                                                variant={settings.borderStyle === s ? 'default' : 'outline'}
                                                size="sm"
                                                className="flex-1 text-[10px] uppercase font-bold"
                                                onClick={() => updateSettings({ borderStyle: s })}
                                            >
                                                {s}
                                            </Button>
                                        ))}
                                    </div>
                                </div>

                                {/* Density */}
                                <div className="space-y-3">
                                    <Label className="flex items-center gap-2">
                                        <Activity className="w-4 h-4 text-primary" />
                                        UI Density ({settings.uiDensity})
                                    </Label>
                                    <div className="flex gap-2">
                                        {(['compact', 'standard', 'cozy'] as UIDensity[]).map((d) => (
                                            <Button
                                                key={d}
                                                variant={settings.uiDensity === d ? 'default' : 'outline'}
                                                size="sm"
                                                className="flex-1 text-[10px] uppercase font-bold"
                                                onClick={() => updateSettings({ uiDensity: d })}
                                            >
                                                {d}
                                            </Button>
                                        ))}
                                    </div>
                                </div>

                                {/* Animation Speed */}
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <Label className="flex items-center gap-2">
                                            <Gauge className="w-4 h-4 text-primary" />
                                            Anim Speed
                                        </Label>
                                        <span className="text-[10px] font-bold opacity-50">{settings.animSpeed.toFixed(1)}x</span>
                                    </div>
                                    <Slider
                                        value={[settings.animSpeed]}
                                        min={0.5}
                                        max={1.5}
                                        step={0.1}
                                        onValueChange={([v]) => updateSettings({ animSpeed: v })}
                                    />
                                </div>

                                {/* Backgrounds */}
                                <div className="space-y-3">
                                    <Label className="flex items-center gap-2">
                                        <ImageIcon className="w-4 h-4 text-primary" />
                                        Background Style ({settings.bgStyle})
                                    </Label>
                                    <div className="flex gap-2">
                                        {(['dark', 'mesh', 'pulse'] as BGStyle[]).map((bg) => (
                                            <Button
                                                key={bg}
                                                variant={settings.bgStyle === bg ? 'default' : 'outline'}
                                                size="sm"
                                                className="flex-1 text-[10px] uppercase font-bold"
                                                onClick={() => updateSettings({ bgStyle: bg })}
                                            >
                                                {bg}
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Mobile Only: Simple Banner */}
                            <div className="lg:hidden p-4 rounded-xl bg-primary/5 border border-primary/20 text-center space-y-2 mb-4">
                                <Sparkles className="w-6 h-6 text-primary mx-auto animate-pulse" />
                                <p className="text-xs font-medium">Advanced personalization features are available on desktop for the best experience.</p>
                            </div>
                        </div>
                    </ScrollArea>

                    <DialogFooter>
                        <Button className="w-full h-12 text-lg font-bold" onClick={() => setIsSettingsOpen(false)}>
                            Done
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
