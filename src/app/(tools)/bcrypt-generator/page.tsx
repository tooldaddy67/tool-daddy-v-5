'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ShieldCheck, Copy, Check, RefreshCw, Eye, EyeOff, Search, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import bcrypt from 'bcryptjs';

export default function BcryptGenerator() {
    const [password, setPassword] = useState('');
    const [rounds, setRounds] = useState(10);
    const [hash, setHash] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    // For Verification
    const [verifyPassword, setVerifyPassword] = useState('');
    const [verifyHash, setVerifyHash] = useState('');
    const [verifyResult, setVerifyResult] = useState<boolean | null>(null);

    const { toast } = useToast();
    const [isCopied, setIsCopied] = useState(false);

    const [isHashing, setIsHashing] = useState(false);

    const generateHash = async () => {
        if (!password) return;

        let r = rounds;
        if (isNaN(r) || r < 4) r = 4;
        if (r > 14) {
            toast({
                title: 'High Cost Factor',
                description: 'Cost factor capped at 14 to prevent browser timeout.',
                variant: 'destructive',
            });
            r = 14;
            setRounds(14);
        }

        setIsHashing(true);
        // Slight delay to let UI show loading state
        await new Promise(resolve => setTimeout(resolve, 50));

        try {
            const salt = await bcrypt.genSalt(r);
            const hashed = await bcrypt.hash(password, salt);
            setHash(hashed);
            // Don't auto-fill verify hash to avoid confusion
        } catch (error) {
            toast({
                title: 'Hashing Error',
                description: 'Failed to generate Bcrypt hash.',
                variant: 'destructive',
            });
        } finally {
            setIsHashing(false);
        }
    };

    const verify = async () => {
        if (!verifyPassword || !verifyHash) return;
        try {
            const match = await bcrypt.compare(verifyPassword, verifyHash);
            setVerifyResult(match);
        } catch (error) {
            toast({
                title: 'Verification Error',
                description: 'Invalid hash format.',
                variant: 'destructive',
            });
            setVerifyResult(null);
        }
    };

    const copyToClipboard = () => {
        if (!hash) return;
        navigator.clipboard.writeText(hash);
        setIsCopied(true);
        toast({ title: 'Bcrypt hash copied' });
        setTimeout(() => setIsCopied(false), 2000);
    };

    return (
        <div className="container mx-auto py-10 px-4 max-w-4xl">
            <div className="flex flex-col items-center mb-10 text-center">
                <div className="p-4 rounded-2xl bg-primary/10 mb-4">
                    <ShieldCheck className="h-10 w-10 text-primary" />
                </div>
                <h1 className="text-4xl font-bold font-headline mb-2">Bcrypt Generator</h1>
                <p className="text-muted-foreground">Generate and verify secure hashes using the Bcrypt hashing algorithm.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Generation Section */}
                <Card className="glass-panel">
                    <CardHeader>
                        <CardTitle className="text-lg">Generate Hash</CardTitle>
                        <CardDescription>Hash a plain text string.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="password">Plain Text (Password)</Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter string to hash..."
                                />
                                <button
                                    className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="rounds">Cost Factor (Rounds): {rounds}</Label>
                            <Input
                                id="rounds"
                                type="number"
                                min="4"
                                max="15"
                                value={rounds}
                                onChange={(e) => setRounds(parseInt(e.target.value))}
                            />
                        </div>
                        <Button className="w-full mt-4 h-12" onClick={generateHash} disabled={!password || isHashing}>
                            {isHashing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                            {isHashing ? 'Hashing...' : 'Generate Bcrypt Hash'}
                        </Button>

                        {hash && (
                            <div className="mt-6 space-y-2">
                                <Label>Resulting Hash</Label>
                                <div className="p-3 rounded-lg bg-muted/50 border border-border font-mono text-xs break-all relative group">
                                    {hash}
                                    <button
                                        onClick={copyToClipboard}
                                        className="absolute right-2 top-2 p-1 bg-background rounded border opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        {isCopied ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                                    </button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Verification Section */}
                <Card className="glass-panel">
                    <CardHeader>
                        <CardTitle className="text-lg">Verify Hash</CardTitle>
                        <CardDescription>Compare a string against a Bcrypt hash.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="v-password">Plain Text</Label>
                            <Input
                                id="v-password"
                                value={verifyPassword}
                                onChange={(e) => setVerifyPassword(e.target.value)}
                                placeholder="Enter string to check..."
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="v-hash">Bcrypt Hash</Label>
                            <Input
                                id="v-hash"
                                value={verifyHash}
                                onChange={(e) => setVerifyHash(e.target.value)}
                                placeholder="$2a$10$..."
                                className="font-mono text-xs"
                            />
                        </div>
                        <Button variant="outline" className="w-full mt-4 h-12" onClick={verify} disabled={!verifyPassword || !verifyHash}>
                            <Search className="mr-2 h-4 w-4" />
                            Verify Match
                        </Button>

                        {verifyResult !== null && (
                            <div className={`mt-6 p-4 rounded-xl text-center font-bold text-lg border-2 ${verifyResult ? 'bg-green-500/10 border-green-500/50 text-green-500' : 'bg-red-500/10 border-red-500/50 text-red-500'}`}>
                                {verifyResult ? 'MATCH DETECTED ✅' : 'NO MATCH ❌'}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
