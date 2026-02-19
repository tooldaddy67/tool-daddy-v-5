import { useState, useEffect } from 'react';
import { useAdmin } from '@/hooks/use-admin';
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
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useUser, useAuth } from '@/firebase';
import {
    sendSignInLinkToEmail,
    signOut,
    GoogleAuthProvider,
    signInWithPopup
} from 'firebase/auth';
import { LogIn, LogOut, Loader2, Sparkles, CheckCircle2, ShieldCheck, Mail } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useSettings } from '@/components/settings-provider';

interface UserAuthButtonProps {
    customTrigger?: React.ReactNode;
}

export function UserAuthButton({ customTrigger }: UserAuthButtonProps) {
    const { user, isUserLoading } = useUser();
    const auth = useAuth();
    const { toast } = useToast();
    const { settings } = useSettings();
    const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);
    const [magicLinkSent, setMagicLinkSent] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);

    // State for auth forms
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const { isAdmin: adminStatus } = useAdmin();

    useEffect(() => {
        setIsAdmin(adminStatus);
    }, [adminStatus]);

    // Handle Google Sign In
    const handleGoogleAuth = async () => {
        if (!auth) return;
        setIsLoading(true);
        try {
            const provider = new GoogleAuthProvider();
            provider.addScope('profile');
            provider.addScope('email');

            // Preferred method for desktop: Popup
            await signInWithPopup(auth, provider);

            toast({ title: 'Successfully signed in!', description: 'Welcome to Tool Daddy!' });
            setIsAuthDialogOpen(false);
        } catch (error: any) {
            console.error("Google Sign-In Error:", error);

            let errorMessage = 'Could not sign in with Google. Please try again.';
            if (error.code === 'auth/popup-closed-by-user') {
                errorMessage = 'Sign-in cancelled. Please do not close the popup until you are signed in.';
            } else if (error.code === 'auth/popup-blocked') {
                errorMessage = 'Popup blocked. Please allow popups for this site.';
            } else if (error.code === 'auth/cancelled-popup-request') {
                errorMessage = 'Only one sign-in attempt allowed at a time.';
            }

            toast({
                title: 'Sign in failed',
                description: errorMessage,
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Handle magic link (passwordless)
    const handleMagicLink = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!auth) return;
        setIsLoading(true);

        try {
            const actionCodeSettings = {
                url: window.location.origin,
                handleCodeInApp: true,
            };
            await sendSignInLinkToEmail(auth, email, actionCodeSettings);

            // Save email for email link sign-in
            window.localStorage.setItem('emailForSignIn', email);

            setMagicLinkSent(true);
            toast({ title: 'Magic Link sent!', description: 'Check your inbox to sign in.' });
        } catch (error: any) {
            console.error(error);
            toast({ title: 'Error sending link', description: error.message, variant: 'destructive' });
        } finally {
            setIsLoading(false);
        }
    };

    // Handle sign out
    const handleSignOut = async () => {
        if (!auth) return;
        try {
            await signOut(auth);
            toast({ title: 'Signed out', description: 'See you next time!' });
        } catch (error: any) {
            toast({ title: 'Error signing out', description: error.message, variant: 'destructive' });
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
                        {customTrigger ? (
                            <div role="button" className="cursor-pointer">{customTrigger}</div>
                        ) : (
                            <Button variant="ghost" className="relative h-10 w-auto rounded-full flex items-center gap-2 pl-2 pr-4 hover:bg-muted/50 transition-colors">
                                <Avatar className="h-8 w-8 border border-primary/20">
                                    <AvatarImage src={user.photoURL || ''} alt={user.displayName || 'User'} />
                                    <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                                        {(user.displayName || user.email || 'U').charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col items-start text-sm auth-text">
                                    <span className="font-semibold text-foreground/80 max-w-[100px] truncate">
                                        {user.displayName || 'User'}
                                    </span>
                                </div>
                            </Button>
                        )}
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
                                <DropdownMenuItem asChild>
                                    <Link href="/admin/dashboard" className="cursor-pointer">
                                        <ShieldCheck className="mr-2 h-4 w-4" />
                                        <span>Admin Panel</span>
                                    </Link>
                                </DropdownMenuItem>
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
                // Not logged in
                customTrigger ? (
                    <div onClick={() => setIsAuthDialogOpen(true)} role="button" aria-label="Sign In">
                        {customTrigger}
                    </div>
                ) : (
                    <Button onClick={() => setIsAuthDialogOpen(true)} variant="default" size="sm" className="gap-2" aria-label="Sign In">
                        <LogIn className="h-4 w-4" />
                        <span className="hidden sm:inline auth-text">Sign In</span>
                    </Button>
                )
            )}

            <Dialog open={isAuthDialogOpen} onOpenChange={setIsAuthDialogOpen}>
                <DialogContent className="w-[95vw] sm:w-full sm:max-w-[400px] rounded-xl sm:rounded-lg border-primary/20 bg-background/95 backdrop-blur-xl p-4 sm:p-6 overflow-y-auto max-h-[90vh]">
                    <DialogHeader>
                        <DialogTitle className="text-center text-2xl font-bold font-headline mb-2">
                            Welcome Back
                        </DialogTitle>
                        <DialogDescription className="text-center">
                            Sign in to sync your tools and settings.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="mt-6 space-y-4">
                        {/* Google Sign In */}
                        <Button
                            variant="outline"
                            className="w-full h-12 rounded-xl text-base font-medium hover:bg-muted/50 transition-colors relative"
                            onClick={handleGoogleAuth}
                            disabled={isLoading}
                        >
                            <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                                <path
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                    fill="#4285F4"
                                />
                                <path
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    fill="#34A853"
                                />
                                <path
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z"
                                    fill="#FBBC05"
                                />
                                <path
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                    fill="#EA4335"
                                />
                            </svg>
                            Continue with Google
                        </Button>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-muted" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-background px-2 text-muted-foreground">
                                    Or continue with email
                                </span>
                            </div>
                        </div>

                        {/* Magic Link Form */}
                        {magicLinkSent ? (
                            <div className="flex flex-col items-center justify-center space-y-4 py-4 text-center animate-in fade-in slide-in-from-bottom-4">
                                <div className="rounded-full bg-primary/10 p-4 border border-primary/20">
                                    <CheckCircle2 className="h-8 w-8 text-primary" />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="font-bold text-lg">Check your email</h3>
                                    <p className="text-sm text-muted-foreground">
                                        We sent a magic link to <span className="font-semibold text-foreground">{email}</span>
                                    </p>
                                </div>
                                <Button variant="outline" size="sm" onClick={() => setMagicLinkSent(false)}>
                                    Use a different email
                                </Button>
                            </div>
                        ) : (
                            <form onSubmit={handleMagicLink} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="email-magic" className="sr-only">Email Address</Label>
                                    <Input
                                        id="email-magic"
                                        type="email"
                                        placeholder="name@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="h-12 rounded-xl"
                                        required
                                        disabled={isLoading}
                                    />
                                </div>
                                <Button
                                    type="submit"
                                    className="w-full h-12 font-semibold rounded-xl"
                                    disabled={isLoading}
                                >
                                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Mail className="mr-2 h-4 w-4" />}
                                    Send Magic Link
                                </Button>
                            </form>
                        )}

                        <p className="text-[10px] text-center text-muted-foreground pt-4">
                            By continuing, you agree to our Terms of Service and Privacy Policy.
                        </p>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
