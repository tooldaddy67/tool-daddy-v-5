'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Gauge, Eye, EyeOff, ShieldCheck, ShieldAlert, Clock, CheckCircle2, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import zxcvbn from 'zxcvbn';

export default function PasswordAnalyserClient() {
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [result, setResult] = useState<any>(null);
    const { toast } = useToast();

    const analyse = () => {
        if (!password) {
            setResult(null);
            return;
        }
        const analysis = zxcvbn(password);
        setResult(analysis);
    };

    useEffect(() => {
        analyse();
    }, [password]);

    const getScoreColor = (score: number) => {
        switch (score) {
            case 0: return 'bg-red-500';
            case 1: return 'bg-orange-500';
            case 2: return 'bg-yellow-500';
            case 3: return 'bg-blue-500';
            case 4: return 'bg-green-500';
            default: return 'bg-muted';
        }
    };

    const getScoreLabel = (score: number) => {
        switch (score) {
            case 0: return 'Very Weak';
            case 1: return 'Weak';
            case 2: return 'Fair';
            case 3: return 'Strong';
            case 4: return 'Very Secure';
            default: return 'Short';
        }
    };

    return (
        <div className="container mx-auto py-10 px-4 max-w-4xl">
            <div className="flex flex-col items-center mb-10 text-center">
                <div className="p-4 rounded-2xl bg-primary/10 mb-4">
                    <Gauge className="h-10 w-10 text-primary" />
                </div>
                <h1 className="text-4xl font-bold font-headline mb-2">Password Strength Analyser</h1>
                <p className="text-muted-foreground">Estimate the crack time and security of your passwords using enterprise-grade entropy analysis.</p>
            </div>

            <Card className="glass-panel mb-8 overflow-hidden">
                <CardContent className="pt-6">
                    <div className="space-y-4">
                        <Label htmlFor="password">Test Your Password</Label>
                        <div className="relative">
                            <Input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter a password to analyze..."
                                className="h-14 text-lg pr-12 font-mono"
                            />
                            <button
                                className="absolute right-3 top-4 text-muted-foreground hover:text-foreground"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <EyeOff className="h-6 w-6" /> : <Eye className="h-6 w-6" />}
                            </button>
                        </div>

                        {result && (
                            <div className="space-y-2 pt-2">
                                <div className="flex justify-between items-end mb-1">
                                    <span className="text-sm font-bold uppercase tracking-wider">{getScoreLabel(result.score)}</span>
                                    <span className="text-xs text-muted-foreground">Entropy: {result.guesses_log10.toFixed(2)} bits</span>
                                </div>
                                <div className="h-2 w-full bg-muted rounded-full overflow-hidden flex">
                                    <div
                                        className={`h-full transition-all duration-500 ${getScoreColor(result.score)}`}
                                        style={{ width: `${(result.score + 1) * 20}%` }}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </CardContent>
                <div className="bg-primary/5 border-t border-primary/10 p-3 px-6 text-[10px] text-muted-foreground flex items-center gap-2">
                    <ShieldCheck className="h-3 w-3 text-primary" />
                    Analysed locally using the zxcvbn library. Your password is never sent to any server.
                </div>
            </Card>

            {result && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="glass-panel">
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Clock className="h-5 w-5 text-primary" />
                                Time to Crack
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                {[
                                    { label: 'Online Throttled', value: result.crack_times_display.online_throttled_100_per_hour },
                                    { label: 'Online (Unthrottled)', value: result.crack_times_display.online_no_throttling_10_per_second },
                                    { label: 'Offline (Fast Hash)', value: result.crack_times_display.offline_fast_hashing_1e10_per_second },
                                    { label: 'Offline (Slow Hash)', value: result.crack_times_display.offline_slow_hashing_1e4_per_second },
                                ].map((item) => (
                                    <div key={item.label} className="p-3 rounded-lg bg-muted/40 border border-border/50">
                                        <p className="text-[10px] text-muted-foreground uppercase font-bold mb-1">{item.label}</p>
                                        <p className="font-bold text-sm">{item.value}</p>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="glass-panel border-primary/20 bg-primary/5">
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Info className="h-5 w-5 text-primary" />
                                Improvement Suggestions
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {result.feedback.warning && (
                                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-500 flex items-start gap-3">
                                    <ShieldAlert className="h-5 w-5 shrink-0" />
                                    <p className="text-sm font-medium">{result.feedback.warning}</p>
                                </div>
                            )}

                            <div className="space-y-2">
                                {result.feedback.suggestions.length > 0 ? (
                                    result.feedback.suggestions.map((s: string, i: number) => (
                                        <div key={i} className="flex items-start gap-3 text-sm text-foreground">
                                            <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                                            <p>{s}</p>
                                        </div>
                                    ))
                                ) : (
                                    <div className="flex items-center gap-3 text-sm text-green-500 font-bold">
                                        <CheckCircle2 className="h-5 w-5" />
                                        Great password! No improvements needed.
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
