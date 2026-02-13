'use client';

import { useState, useEffect, ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Lock, Eye, EyeOff } from 'lucide-react';

import { verifyAdminPassword } from '@/app/actions/admin';

export function AdminPasswordGate({ children }: { children: ReactNode }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [passwordInput, setPasswordInput] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [passwordError, setPasswordError] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const [failedAttempts, setFailedAttempts] = useState(0);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const stored = sessionStorage.getItem('admin-auth');
            if (stored === 'true') setIsAuthenticated(true);
        }
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsVerifying(true);
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
                const newAttempts = failedAttempts + 1;
                console.log(`[AdminGate] Invalid password. Client-side attempts: ${newAttempts}/4`);
                setFailedAttempts(newAttempts);
                setPasswordError(true);

                if (newAttempts >= 4) {
                    console.log('[AdminGate] Client-side limit reached. Forcing security reload...');
                    window.location.reload();
                    return;
                }

                if (result.error) {
                    alert(`System Error: ${result.error}`);
                }
            }
        } catch (error) {
            console.error('[AdminGate] Verification crashed:', error);
            setPasswordError(true);
        } finally {
            setIsVerifying(false);
        }
    };

    if (isAuthenticated) return <>{children}</>;

    return (
        <div className="flex h-[70vh] w-full items-center justify-center">
            <Card className="w-full max-w-md mx-4">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4 p-3 rounded-full bg-primary/10 w-fit">
                        <Lock className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle>Admin Access</CardTitle>
                    <CardDescription>Enter the admin password to continue.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="relative">
                            <Input
                                type={showPassword ? 'text' : 'password'}
                                value={passwordInput}
                                onChange={(e) => { setPasswordInput(e.target.value); setPasswordError(false); }}
                                placeholder="Admin password"
                                className={passwordError ? 'border-destructive' : ''}
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
                            <p className="text-sm text-destructive">Incorrect password. Try again.</p>
                        )}
                        <Button type="submit" className="w-full" disabled={isVerifying}>
                            {isVerifying ? (
                                <span className="animate-spin mr-2">...</span>
                            ) : (
                                <Lock className="mr-2 h-4 w-4" />
                            )}
                            {isVerifying ? 'Verifying...' : 'Unlock'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
