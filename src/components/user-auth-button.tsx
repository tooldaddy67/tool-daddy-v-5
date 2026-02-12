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

    // Reset OTP state when dialog closes
    useEffect(() => {
        if (!isAuthDialogOpen) {
            setOtpSent(false);
            setOtpCode('');
        }
    }, [isAuthDialogOpen]);

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

        if (authMode === 'signup') {
            if (!otpSent) {
                await handleSendOtp();
            } else {
                await handleVerifyAndSignup(e);
            }
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
            url: window.location.origin + window.location.pathname,
            handleCodeInApp: true,
        };

        try {
            await sendSignInLinkToEmail(auth, email, actionCodeSettings);
            window.localStorage.setItem('emailForSignIn', email);
            setMagicLinkSent(true);
            toast({ title: 'Magic Link sent!', description: 'Check your inbox to sign in instantly.' });
        } catch (error: any) {
            toast({ title: 'Error sending link', description: error.message, variant: 'destructive' });
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
                            Sign in or create an account with a passwordless magic link.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="mt-6">
                        {magicLinkSent ? (
                            <div className="flex flex-col items-center justify-center space-y-6 py-4 text-center animate-in fade-in zoom-in-95 duration-300">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full" />
                                    <div className="relative rounded-full bg-primary/10 p-4 border border-primary/20">
                                        <CheckCircle2 className="h-10 w-10 text-primary" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <h3 className="font-bold text-xl">Check your email</h3>
                                    <p className="text-sm text-muted-foreground max-w-[280px] mx-auto leading-relaxed">
                                        We've sent a secure login link to <span className="font-semibold text-foreground underline decoration-primary/30">{email}</span>. Click it to sign in!
                                    </p>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-xs h-9 px-4 rounded-full border-primary/20 hover:bg-primary/5 hover:text-primary transition-all"
                                    onClick={() => setMagicLinkSent(false)}
                                >
                                    Use a different email
                                </Button>
                            </div>
                        ) : (
                            <form onSubmit={handleMagicLink} className="space-y-6">
                                <div className="space-y-3">
                                    <Label htmlFor="email-magic" className="text-sm font-medium ml-1">Email Address</Label>
                                    <div className="relative group">
                                        <Input
                                            id="email-magic"
                                            type="email"
                                            placeholder="name@example.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="h-12 border-border/40 bg-muted/30 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all rounded-xl pl-4"
                                            required
                                        />
                                    </div>
                                    <div className="bg-primary/5 rounded-xl p-4 text-xs text-muted-foreground border border-primary/10 leading-relaxed">
                                        <p className="flex items-start gap-2">
                                            <Sparkles className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                                            We'll send you a secure link for a password-free experience.
                                            New here? We'll create your account automatically.
                                        </p>
                                    </div>
                                </div>
                                <Button
                                    type="submit"
                                    className="w-full h-12 text-base font-semibold rounded-xl shadow-lg shadow-primary/10 hover:shadow-primary/20 transition-all"
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    ) : (
                                        <Sparkles className="mr-2 h-5 w-5" />
                                    )}
                                    Get Magic Link
                                </Button>

                                <p className="text-[10px] text-center text-muted-foreground px-4">
                                    By continuing, you agree to our terms of service and privacy policy.
                                    Magic links expire in 10 minutes for your security.
                                </p>
                            </form>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
