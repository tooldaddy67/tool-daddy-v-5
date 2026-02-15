'use client';

import { useState, useEffect, ReactNode } from 'react';
import { useFirebase } from '@/firebase';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Lock, Eye, EyeOff, ShieldCheck, Loader2, AlertCircle } from 'lucide-react';
import { verifyHeadAdminPassword } from '@/app/actions/head-admin';

export function HeadAdminPasswordGate({ children }: { children: ReactNode }) {
    const { user, isUserLoading } = useFirebase();
    const router = useRouter();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [passwordInput, setPasswordInput] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isVerifying, setIsVerifying] = useState(false);
    const [lockedUntil, setLockedUntil] = useState<number | null>(null);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const stored = sessionStorage.getItem('head-admin-auth');
            if (stored === 'true') setIsAuthenticated(true);
        }
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || user.isAnonymous) return;

        setIsVerifying(true);
        setError(null);

        try {
            const idToken = await user.getIdToken();
            const result = await verifyHeadAdminPassword(passwordInput, idToken);

            if (result.isValid) {
                setIsAuthenticated(true);
                sessionStorage.setItem('head-admin-auth', 'true');
            } else if (result.isLocked) {
                setLockedUntil(result.lockedUntil || Date.now() + 60000);
                setError('IP blocked for 1 minute due to multiple failed attempts.');
            } else {
                setError(result.error || 'Invalid head-admin credentials.');
            }
        } catch (err) {
            setError('Verification failed. Please try again.');
        } finally {
            setIsVerifying(false);
        }
    };

    if (isUserLoading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-background">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (isAuthenticated) return <>{children}</>;

    const isLocked = lockedUntil ? lockedUntil > Date.now() : false;

    return (
        <div className="flex h-screen w-full items-center justify-center bg-[#020617] p-4">
            <Card className="w-full max-w-md border-primary/20 bg-slate-950/50 backdrop-blur-xl shadow-2xl">
                <CardHeader className="text-center space-y-2">
                    <div className="mx-auto mb-4 p-4 rounded-full bg-primary/10 w-fit border border-primary/20 shadow-[0_0_15px_rgba(var(--primary),0.1)]">
                        <ShieldCheck className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle className="text-2xl font-bold tracking-tight text-white">Elite Access Required</CardTitle>
                    <CardDescription className="text-slate-400">
                        This area is restricted to Top-Tier Administrators.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <div className="relative group">
                                <Input
                                    type={showPassword ? 'text' : 'password'}
                                    value={passwordInput}
                                    onChange={(e) => { setPasswordInput(e.target.value); setError(null); }}
                                    placeholder="Enter Head-Admin Key"
                                    className={`bg-slate-900/50 border-slate-800 focus:border-primary/50 transition-all ${error ? 'border-destructive/50' : ''}`}
                                    autoFocus
                                    disabled={isVerifying || isLocked}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                                    disabled={isLocked}
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                            {error && (
                                <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm animate-in slide-in-from-top-1">
                                    <AlertCircle className="h-4 w-4" />
                                    <span>{error}</span>
                                </div>
                            )}
                        </div>

                        <div className="space-y-3">
                            <Button
                                type="submit"
                                className="w-full h-11 bg-primary hover:bg-primary/90 text-white font-semibold shadow-lg shadow-primary/20"
                                disabled={isVerifying || isLocked || !passwordInput}
                            >
                                {isVerifying ? (
                                    <div className="flex items-center gap-2">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        <span>Authorizing...</span>
                                    </div>
                                ) : isLocked ? 'Security Lockout' : 'Access Command Center'}
                            </Button>

                            {isLocked && (
                                <p className="text-center text-[10px] text-slate-500 uppercase tracking-widest font-bold">
                                    Wait {Math.ceil((lockedUntil! - Date.now()) / 1000)}s for retry
                                </p>
                            )}
                        </div>
                    </form>

                    <div className="mt-8 pt-6 border-t border-slate-800/50 text-center">
                        <button
                            onClick={() => router.push('/admin/dashboard')}
                            className="text-xs text-slate-500 hover:text-primary transition-colors flex items-center justify-center gap-1 mx-auto"
                        >
                            Return to Standard Dashboard
                        </button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
