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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useUser, useAuth } from '@/firebase';
import { LogIn, LogOut, Loader2, Sparkles, UserPlus, CheckCircle2, ShieldCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useSettings } from '@/components/settings-provider';

interface UserAuthButtonProps {
    customTrigger?: React.ReactNode;
}

export function UserAuthButton({ customTrigger }: UserAuthButtonProps) {
    const { user, isUserLoading } = useUser();
    const supabase = useAuth(); // This is now the Supabase client
    const { toast } = useToast();
    const { settings, updateSettings } = useSettings();
    const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);
    const [magicLinkSent, setMagicLinkSent] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);

    // State for auth forms
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [authMode, setAuthMode] = useState<'login' | 'signup' | 'magic'>('login');

    const { isAdmin: adminStatus } = useAdmin();

    useEffect(() => {
        setIsAdmin(adminStatus);
    }, [adminStatus]);

    // Handle email/password auth (login or signup)
    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!supabase) return;
        setIsLoading(true);

        try {
            if (authMode === 'login') {
                const { data, error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
                toast({ title: 'Successfully signed in!', description: 'Welcome to Tool Daddy!' });
                setIsAuthDialogOpen(false);
                setEmail('');
                setPassword('');
            } else if (authMode === 'signup') {
                const { data, error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            full_name: email.split('@')[0],
                            display_name: email.split('@')[0],
                        },
                    },
                });
                if (error) throw error;

                if (data.user && !data.session) {
                    // Email confirmation required
                    toast({
                        title: 'Check your email!',
                        description: 'We sent a confirmation link. Click it to activate your account.',
                    });
                } else {
                    toast({ title: 'Account created!', description: 'Welcome to Tool Daddy!' });
                    setIsAuthDialogOpen(false);
                }
                setEmail('');
                setPassword('');
            }
        } catch (error: any) {
            toast({
                title: 'Authentication failed',
                description: error.message || 'Something went wrong',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Handle magic link (passwordless)
    const handleMagicLink = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!supabase) return;
        setIsLoading(true);

        try {
            const { error } = await supabase.auth.signInWithOtp({
                email,
                options: {
                    emailRedirectTo: window.location.origin,
                },
            });
            if (error) throw error;
            setMagicLinkSent(true);
            toast({ title: 'Magic Link sent!', description: 'Check your inbox to sign in.' });
        } catch (error: any) {
            toast({ title: 'Error sending link', description: error.message, variant: 'destructive' });
        } finally {
            setIsLoading(false);
        }
    };

    // Handle sign out
    const handleSignOut = async () => {
        if (!supabase) return;
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
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
                <DialogContent className="w-[95vw] sm:w-full sm:max-w-[425px] rounded-xl sm:rounded-lg border-primary/20 bg-background/95 backdrop-blur-xl p-4 sm:p-6 overflow-y-auto max-h-[90vh]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-2xl font-bold font-headline">
                            <Sparkles className="h-6 w-6 text-primary" />
                            Tool Daddy Cloud
                        </DialogTitle>
                        <DialogDescription>
                            Sign in or create an account to get started.
                        </DialogDescription>
                    </DialogHeader>

                    <Tabs defaultValue="login" className="mt-4">
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="login">Sign In</TabsTrigger>
                            <TabsTrigger value="signup">Sign Up</TabsTrigger>
                            <TabsTrigger value="magic">Magic Link</TabsTrigger>
                        </TabsList>

                        {/* Email/Password Login */}
                        <TabsContent value="login" className="mt-4">
                            <form onSubmit={handleAuth} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="login-email">Email</Label>
                                    <Input
                                        id="login-email"
                                        type="email"
                                        placeholder="name@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="h-11 rounded-xl"
                                        required
                                        onFocus={() => setAuthMode('login')}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="login-password">Password</Label>
                                    <Input
                                        id="login-password"
                                        type="password"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="h-11 rounded-xl"
                                        required
                                        onFocus={() => setAuthMode('login')}
                                    />
                                </div>
                                <Button
                                    type="submit"
                                    className="w-full h-11 font-semibold rounded-xl"
                                    disabled={isLoading}
                                    onClick={() => setAuthMode('login')}
                                >
                                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogIn className="mr-2 h-4 w-4" />}
                                    Sign In
                                </Button>
                            </form>
                        </TabsContent>

                        {/* Email/Password Signup */}
                        <TabsContent value="signup" className="mt-4">
                            <form onSubmit={handleAuth} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="signup-email">Email</Label>
                                    <Input
                                        id="signup-email"
                                        type="email"
                                        placeholder="name@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="h-11 rounded-xl"
                                        required
                                        onFocus={() => setAuthMode('signup')}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="signup-password">Password</Label>
                                    <Input
                                        id="signup-password"
                                        type="password"
                                        placeholder="Min 6 characters"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="h-11 rounded-xl"
                                        required
                                        onFocus={() => setAuthMode('signup')}
                                    />
                                </div>
                                <Button
                                    type="submit"
                                    className="w-full h-11 font-semibold rounded-xl"
                                    disabled={isLoading}
                                    onClick={() => setAuthMode('signup')}
                                >
                                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserPlus className="mr-2 h-4 w-4" />}
                                    Create Account
                                </Button>
                            </form>
                        </TabsContent>

                        {/* Magic Link */}
                        <TabsContent value="magic" className="mt-4">
                            {magicLinkSent ? (
                                <div className="flex flex-col items-center justify-center space-y-4 py-4 text-center">
                                    <div className="rounded-full bg-primary/10 p-4 border border-primary/20">
                                        <CheckCircle2 className="h-8 w-8 text-primary" />
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="font-bold text-lg">Check your email</h3>
                                        <p className="text-sm text-muted-foreground">
                                            Login link sent to <span className="font-semibold text-foreground">{email}</span>
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
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="h-11 rounded-xl"
                                            required
                                        />
                                    </div>
                                    <div className="bg-primary/5 rounded-xl p-3 text-xs text-muted-foreground border border-primary/10">
                                        <p className="flex items-start gap-2">
                                            <Sparkles className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                                            Password-free sign in. New here? We'll create your account automatically.
                                        </p>
                                    </div>
                                    <Button
                                        type="submit"
                                        className="w-full h-11 font-semibold rounded-xl"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                                        Get Magic Link
                                    </Button>
                                </form>
                            )}
                        </TabsContent>
                    </Tabs>

                    <p className="text-[10px] text-center text-muted-foreground px-4 mt-2">
                        By continuing, you agree to our terms of service and privacy policy.
                    </p>
                </DialogContent>
            </Dialog>
        </>
    );
}
