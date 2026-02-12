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
import { useUser, useAuth, useFirebase } from '@/firebase';
import { signOut, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail, sendSignInLinkToEmail, isSignInWithEmailLink, signInWithEmailLink } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { LogIn, LogOut, User as UserIcon, Loader2, Sparkles, UserPlus, CheckCircle2, ShieldCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useSettings } from '@/components/settings-provider';
import { updateProfile } from 'firebase/auth';

export function UserAuthButton() {
    const { user, isUserLoading } = useUser();
    const auth = useAuth();
    const { firestore } = useFirebase();
    const { toast } = useToast();
    const { settings, updateSettings } = useSettings();
    const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);
    const [magicLinkSent, setMagicLinkSent] = useState(false);
    const [magicLinkEmail, setMagicLinkEmail] = useState('');
    const [isAdmin, setIsAdmin] = useState(false);

    // State for auth forms
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [authMode, setAuthMode] = useState<'login' | 'signup' | 'magic'>('login');

    // OTP State
    const [otpSent, setOtpSent] = useState(false);
    const [otpCode, setOtpCode] = useState('');

    useEffect(() => {
        if (user) {
            checkAdminStatus();
        } else {
            setIsAdmin(false);
        }
    }, [user]);

    const checkAdminStatus = async () => {
        if (!user || !firestore) return;
        try {
            const docRef = doc(firestore, 'users', user.uid);
            const snap = await getDoc(docRef);
            if (snap.exists() && snap.data().isAdmin === true) {
                setIsAdmin(true);
            }
        } catch (e) {
            console.error("Error checking admin status", e);
        }
    };

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

    const handleSendOtp = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/auth/otp/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to send OTP');
            }

            setOtpSent(true);
            toast({ title: "OTP Sent", description: "Please check your email for the verification code." });
        } catch (error: any) {
            toast({
                title: "Error Sending OTP",
                description: error.message,
                variant: 'destructive'
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyAndSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            // Verify OTP
            const res = await fetch('/api/auth/otp/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, code: otpCode }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Invalid OTP');
            }

            // If OTP is valid, proceed to create user
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            if (userCredential.user) {
                await updateProfile(userCredential.user, { displayName: email.split('@')[0] });
            }
            toast({ title: "Account created successfully" });
            setIsAuthDialogOpen(false);
            // Reset state
            setOtpSent(false);
            setOtpCode('');
            setEmail('');
            setPassword('');

        } catch (error: any) {
            toast({
                title: "Verification Failed",
                description: error.message,
                variant: 'destructive'
            });
        } finally {
            setIsLoading(false);
        }
    };


    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();

        if (authMode === 'signup' && !otpSent) {
            await handleSendOtp();
            return;
        }

        if (authMode === 'signup' && otpSent) {
            await handleVerifyAndSignup(e);
            return;
        }

        setIsLoading(true);
        try {
            if (authMode === 'login') {
                await signInWithEmailAndPassword(auth, email, password);
                toast({ title: "Signed in successfully" });
                setIsAuthDialogOpen(false);
            }
            // Signup logic is handled above now
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
                        {isAdmin && (
                            <>
                                <Link href="/admin/dashboard" className="w-full cursor-pointer">
                                    <DropdownMenuItem>
                                        <ShieldCheck className="mr-2 h-4 w-4" />
                                        <span>Admin</span>
                                    </DropdownMenuItem>
                                </Link>
                                <DropdownMenuSeparator />
                            </>
                        )}
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
                <DialogContent className="w-[95vw] sm:w-full sm:max-w-[400px] rounded-xl sm:rounded-lg border-primary/20 bg-background/95 backdrop-blur-xl p-4 sm:p-6 overflow-y-auto max-h-[90vh]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-2xl font-bold font-headline">
                            <Sparkles className="h-6 w-6 text-primary" />
                            Tool Daddy Cloud
                        </DialogTitle>
                        <DialogDescription>
                            Sync your creations and settings across all your devices.
                        </DialogDescription>
                    </DialogHeader>

                    <Tabs defaultValue="login" className="w-full mt-4" onValueChange={(v) => { setAuthMode(v as any); setMagicLinkSent(false); setOtpSent(false); }}>
                        <TabsList className="grid w-full grid-cols-3 bg-muted/50 h-auto p-1">
                            <TabsTrigger value="login" className="text-xs sm:text-sm py-2">Sign In</TabsTrigger>
                            <TabsTrigger value="signup" className="text-xs sm:text-sm py-2">Sign Up</TabsTrigger>
                            <TabsTrigger value="magic" className="text-xs sm:text-sm py-2">Magic Link</TabsTrigger>
                        </TabsList>

                        {/* ... Login Tab ... */}
                        <TabsContent value="login" className="space-y-4 py-4 mt-0">
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
                            <form onSubmit={handleAuth} className="space-y-4">
                                {!otpSent ? (
                                    <>
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
                                    </>
                                ) : (
                                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="otp-code">Verification Code</Label>
                                            <p className="text-xs text-muted-foreground">
                                                We sent a code to <span className="font-medium text-foreground">{email}</span>.
                                            </p>
                                            <Input
                                                id="otp-code"
                                                type="text"
                                                placeholder="123456"
                                                value={otpCode}
                                                onChange={(e) => setOtpCode(e.target.value)}
                                                className="border-border/50 focus:border-primary/50 text-center tracking-widest text-lg"
                                                required
                                                maxLength={6}
                                            />
                                        </div>
                                        <div className="flex gap-2">
                                            <Button type="button" variant="outline" className="flex-1" onClick={() => setOtpSent(false)}>
                                                Back
                                            </Button>
                                            <Button type="submit" className="flex-[2]" disabled={isLoading}>
                                                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
                                                Verify & Create
                                            </Button>
                                        </div>
                                        <div className="text-center">
                                            <button
                                                type="button"
                                                className="text-xs text-primary hover:underline"
                                                onClick={handleSendOtp}
                                                disabled={isLoading}
                                            >
                                                Resend Code
                                            </button>
                                        </div>
                                    </div>
                                )}
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
        </>
    );
}
