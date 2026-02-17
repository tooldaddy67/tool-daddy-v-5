'use client';

import { useState, useEffect, ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Lock, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';

// import { verifyAdminPassword } from '@/app/actions/admin';
const verifyAdminPassword = async (pass: string) => ({ isValid: false, isLocked: false, error: 'Admin features are disabled.' });

export function AdminPasswordGate({ children }: { children: ReactNode }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [passwordInput, setPasswordInput] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [passwordError, setPasswordError] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const [failedAttempts, setFailedAttempts] = useState(0);
    const [systemError, setSystemError] = useState<string | null>(null);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const stored = sessionStorage.getItem('admin-auth');
            if (stored === 'true') setIsAuthenticated(true);
        }
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsVerifying(true);
        setSystemError(null);
        setPasswordError(false);
        try {
            console.log(`[AdminGate] Attempt #${failedAttempts + 1}`);
            const result = await verifyAdminPassword(passwordInput);
            console.log('[AdminGate] Server Response:', result);

            if (result.isValid) {
                setIsAuthenticated(true);
                setPasswordError(false);
                setFailedAttempts(0);
                sessionStorage.setItem('admin-auth', 'true');
            } else if (result.isLocked) {
                console.log('[AdminGate] Lockout confirmed by server. Reloading...');
                window.location.reload();
            } else {
                if (result.error) {
                    setSystemError(result.error);
                } else {
                    const newAttempts = failedAttempts + 1;
                    console.log(`[AdminGate] Invalid password. Client-side attempts: ${newAttempts}/4`);
                    setFailedAttempts(newAttempts);
                    setPasswordError(true);

                    if (newAttempts >= 4) {
                        console.log('[AdminGate] Client-side limit reached. Forcing security reload...');
                        window.location.reload();
                        return;
                    }
                }
            }
        } catch (error: any) {
            console.error('[AdminGate] Verification crashed:', error);
            setSystemError(error.message || 'An unexpected error occurred during verification.');
        } finally {
            setIsVerifying(false);
        }
    };

    if (isAuthenticated) return <>{children}</>;

    return (
        <div className="flex h-[70vh] w-full items-center justify-center">
            <Card className="w-full max-w-md mx-4 overflow-hidden">
                <div className="h-1 bg-gradient-to-r from-primary/50 via-primary to-primary/50" />
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4 p-3 rounded-full bg-primary/10 w-fit border border-primary/20">
                        <Lock className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="bg-gradient-to-br from-white to-slate-400 bg-clip-text text-transparent">Administrator Access</CardTitle>
                    <CardDescription>Enter the secure enclave access key to continue.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="relative">
                            <Input
                                type={showPassword ? 'text' : 'password'}
                                value={passwordInput}
                                onChange={(e) => {
                                    setPasswordInput(e.target.value);
                                    setPasswordError(false);
                                    setSystemError(null);
                                }}
                                placeholder="Access Key"
                                className={cn(
                                    "bg-slate-900/50 border-white/10 focus:border-primary/50 transition-all",
                                    (passwordError || systemError) ? 'border-destructive focus:border-destructive' : ''
                                )}
                                autoFocus
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>

                        {passwordError && (
                            <div className="p-3 rounded-lg border border-destructive/20 bg-destructive/10 text-destructive text-sm flex gap-2 items-center animate-in fade-in slide-in-from-top-1">
                                <span className="font-bold">Access Denied:</span> Incorrect password.
                            </div>
                        )}

                        {systemError && (
                            <div className="p-3 rounded-lg border border-amber-500/20 bg-amber-500/10 text-amber-500 text-sm flex flex-col gap-1 animate-in fade-in slide-in-from-top-1">
                                <p className="font-bold flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                                    Security Interface Error
                                </p>
                                <p className="text-xs opacity-80">{systemError}</p>
                            </div>
                        )}

                        <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold" disabled={isVerifying}>
                            {isVerifying ? (
                                <>
                                    <span className="animate-spin mr-2 h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full" />
                                    Verifying...
                                </>
                            ) : (
                                <>
                                    <Lock className="mr-2 h-4 w-4" />
                                    Unlock Enclave
                                </>
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
