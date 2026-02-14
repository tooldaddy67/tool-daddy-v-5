'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Hash, Copy, Check, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function HashText() {
    const [input, setInput] = useState('');
    const [algorithm, setAlgorithm] = useState('SHA-256');
    const [result, setResult] = useState('');
    const { toast } = useToast();
    const [copiedField, setCopiedField] = useState(false);
    const [loading, setLoading] = useState(false);

    const computeHash = async () => {
        if (!input) {
            setResult('');
            return;
        }

        setLoading(true);
        try {
            const encoder = new TextEncoder();
            const data = encoder.encode(input);

            // Web Crypto API supports: SHA-1, SHA-256, SHA-384, SHA-512
            // For others like MD5, we might need a fallback or remove them if strict Web Crypto is required.
            // However, browsers generally only support SHAs in SubtleCrypto.
            // If the user wants MD5, we must keep a library or custom impl. 
            // The prompt asked for "Hash Generator (SHA-1/256/384/512 via Web Crypto API)". 
            // It did not explicitly ask for MD5, but the old tool had it. 
            // I will keep only the requested Web Crypto supported ones for this "native" tool 
            // to ensure strict compliance with "via Web Crypto API".

            const hashBuffer = await window.crypto.subtle.digest(algorithm, data);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');

            setResult(hashHex);
        } catch (error) {
            console.error(error);
            toast({
                title: 'Hashing Error',
                description: 'Failed to compute hash. Note: MD5/RIPEMD are not supported by Web Crypto API.',
                variant: 'destructive',
            });
            setResult('Error: Algorithm likely not supported by your browser\'s native Web Crypto API.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        computeHash();
    }, [input, algorithm]);

    const copyToClipboard = () => {
        if (!result) return;
        navigator.clipboard.writeText(result);
        setCopiedField(true);
        toast({ title: 'Hash copied to clipboard' });
        setTimeout(() => setCopiedField(false), 2000);
    };

    return (
        <div className="container mx-auto py-10 px-4 max-w-4xl">
            <div className="flex flex-col items-center mb-10 text-center">
                <div className="p-4 rounded-2xl bg-primary/10 mb-4">
                    <Hash className="h-10 w-10 text-primary" />
                </div>
                <h1 className="text-4xl font-bold font-headline mb-2">Hash Generator (Web Crypto)</h1>
                <p className="text-muted-foreground">Generate cryptographic hashes using your browser's native Web Crypto API.</p>
            </div>

            <div className="grid grid-cols-1 gap-8">
                <Card className="glass-panel">
                    <CardHeader>
                        <CardTitle className="text-lg">Input Text</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="input">Your Text</Label>
                            <Textarea
                                id="input"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Enter text to hash..."
                                className="min-h-[150px] font-mono"
                            />
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="flex-1 space-y-2">
                                <Label>Algorithm</Label>
                                <Select value={algorithm} onValueChange={setAlgorithm}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select algorithm" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="SHA-256">SHA-256 (Recommended)</SelectItem>
                                        <SelectItem value="SHA-512">SHA-512</SelectItem>
                                        <SelectItem value="SHA-384">SHA-384</SelectItem>
                                        <SelectItem value="SHA-1">SHA-1 (Legacy)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button className="sm:mt-8 h-10 px-8" onClick={computeHash} disabled={loading}>
                                <RefreshCw className={cn("mr-2 h-4 w-4", loading && "animate-spin")} />
                                {loading ? 'Hashing...' : 'Refresh Hash'}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {result && (
                    <Card className="glass-panel border-primary/20 bg-primary/5">
                        <CardHeader>
                            <CardTitle className="text-sm uppercase tracking-widest text-muted-foreground">Generated {algorithm} Hash</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="relative group">
                                <div className="p-6 rounded-xl bg-background/80 border border-primary/20 font-mono text-lg break-all">
                                    {result}
                                </div>
                                <Button
                                    className="w-full mt-4 h-12"
                                    onClick={copyToClipboard}
                                >
                                    {copiedField ? <Check className="mr-2 h-4 w-4 text-green-500" /> : <Copy className="mr-2 h-4 w-4" />}
                                    {copiedField ? 'Copied' : 'Copy Hash'}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
