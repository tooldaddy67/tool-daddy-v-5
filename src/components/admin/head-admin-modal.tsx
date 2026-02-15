'use client';

import { useState, useEffect } from 'react';
import { useFirebase } from '@/firebase';
import { useRouter } from 'next/navigation';
import { verifyHeadAdminPassword } from '@/app/actions/head-admin';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lock, ShieldAlert, CheckCircle2, UserCheck, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';

export function HeadAdminModal() {
    const { user } = useFirebase();
    const router = useRouter();
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [lockedUntil, setLockedUntil] = useState<number | null>(null);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        if (!isOpen) {
            setPassword('');
            setError(null);
            setShowPassword(false);
            if (!success) setLockedUntil(null);
        }
    }, [isOpen, success]);

    const handleApply = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || user.isAnonymous) return;

        setLoading(true);
        setError(null);

        try {
            const idToken = await user.getIdToken();
            const result = await verifyHeadAdminPassword(password, idToken);

            if (result.isValid) {
                setSuccess(true);
                sessionStorage.setItem('head-admin-auth', 'true');
            } else if (result.isLocked) {
                setLockedUntil(result.lockedUntil || Date.now() + 60000);
                setError('Too many failed attempts. Your IP is blocked for 1 minute.');
            } else {
                setError(result.error || 'Incorrect head-admin password.');
            }
        } catch (err: any) {
            setError('An unexpected error occurred.');
        } finally {
            setLoading(false);
        }
    };

    const isLocked = lockedUntil ? lockedUntil > Date.now() : false;

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="hidden md:flex gap-2 border-primary/50 hover:bg-primary/10 transition-all duration-300">
                    <UserCheck className="h-4 w-4" /> Apply for Head-Admin
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] border-primary/20 bg-background/95 backdrop-blur-xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        <Lock className="h-5 w-5 text-primary" />
                        Head-Admin Access
                    </DialogTitle>
                    <DialogDescription className="text-muted-foreground/80">
                        Restricted portal for administrative advancement. Access requires secondary verification.
                    </DialogDescription>
                </DialogHeader>

                {success ? (
                    <div className="py-8 text-center space-y-6 animate-in fade-in zoom-in duration-300">
                        <div className="mx-auto w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center border border-green-500/20 shadow-[0_0_20px_rgba(34,197,94,0.15)]">
                            <CheckCircle2 className="h-10 w-10 text-green-500" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-2xl font-bold text-green-500 tracking-tight">VIP Access Granted</h3>
                            <p className="text-sm text-muted-foreground max-w-[280px] mx-auto text-balance">
                                Your administrative standing has been verified. Welcome to the elite tier of Tool Daddy.
                            </p>
                        </div>
                        <Button
                            className="w-full bg-green-600 hover:bg-green-700 text-white"
                            onClick={() => {
                                setIsOpen(false);
                                router.push('/admin/head-dashboard');
                            }}
                        >
                            Enter Command Center
                        </Button>
                    </div>
                ) : (
                    <form onSubmit={handleApply} className="space-y-5 py-4">
                        <div className="space-y-3">
                            <div className="relative group">
                                <Input
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Enter secure access key"
                                    value={password}
                                    onChange={(e) => {
                                        setPassword(e.target.value);
                                        setError(null);
                                    }}
                                    disabled={loading || isLocked}
                                    className={cn(
                                        "pr-10 bg-muted/50 focus-visible:ring-primary/30 transition-all",
                                        error && "border-destructive focus-visible:ring-destructive/30"
                                    )}
                                    autoComplete="off"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                    disabled={isLocked}
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>

                            {error && (
                                <div className="flex items-start gap-2 p-3 rounded-md bg-destructive/10 border border-destructive/20 text-destructive animate-in slide-in-from-top-1 duration-200">
                                    <ShieldAlert className="h-4 w-4 mt-0.5 shrink-0" />
                                    <p className="text-xs font-medium leading-tight">
                                        {error}
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="space-y-3">
                            <Button
                                type="submit"
                                className={cn(
                                    "w-full font-semibold tracking-wide transition-all duration-300",
                                    isLocked ? "bg-muted text-muted-foreground cursor-not-allowed" : "bg-primary hover:shadow-[0_0_15px_rgba(var(--primary),0.3)]"
                                )}
                                disabled={loading || isLocked || !password}
                            >
                                {loading ? (
                                    <div className="flex items-center gap-2">
                                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                        Verifying Identity...
                                    </div>
                                ) : isLocked ? 'System Temporarily Locked' : 'Authorize Access'}
                            </Button>

                            {isLocked && (
                                <div className="text-center">
                                    <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-bold">
                                        Security Lockout Active
                                    </p>
                                    <p className="text-[9px] text-muted-foreground/60 mt-1">
                                        Re-authentication available in {Math.ceil((lockedUntil! - Date.now()) / 1000)}s
                                    </p>
                                </div>
                            )}
                        </div>
                    </form>
                )}

                {!success && !isLocked && (
                    <div className="pt-2">
                        <p className="text-[10px] text-center text-muted-foreground/60">
                            Attempts are monitored and logged by IP address.
                        </p>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
