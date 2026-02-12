'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Hash, Copy, Check, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import CryptoJS from 'crypto-js';

export default function HashText() {
    const [input, setInput] = useState('');
    const [algorithm, setAlgorithm] = useState('SHA256');
    const [result, setResult] = useState('');
    const { toast } = useToast();
    const [copiedField, setCopiedField] = useState(false);

    const computeHash = () => {
        if (!input) {
            setResult('');
            return;
        }

        try {
            let hashed = '';
            switch (algorithm) {
                case 'MD5': hashed = CryptoJS.MD5(input).toString(); break;
                case 'SHA1': hashed = CryptoJS.SHA1(input).toString(); break;
                case 'SHA256': hashed = CryptoJS.SHA256(input).toString(); break;
                case 'SHA512': hashed = CryptoJS.SHA512(input).toString(); break;
                case 'SHA3': hashed = CryptoJS.SHA3(input).toString(); break;
                case 'RIPEMD160': hashed = CryptoJS.RIPEMD160(input).toString(); break;
                default: hashed = CryptoJS.SHA256(input).toString();
            }
            setResult(hashed);
        } catch (error) {
            toast({
                title: 'Hashing Error',
                description: 'Failed to compute hash.',
                variant: 'destructive',
            });
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
                <h1 className="text-4xl font-bold font-headline mb-2">Hash Text</h1>
                <p className="text-muted-foreground">Generate cryptographic hashes for any text using various algorithms.</p>
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
                                        <SelectItem value="SHA256">SHA-256 (Recommended)</SelectItem>
                                        <SelectItem value="SHA512">SHA-512</SelectItem>
                                        <SelectItem value="SHA1">SHA-1</SelectItem>
                                        <SelectItem value="SHA3">SHA-3</SelectItem>
                                        <SelectItem value="MD5">MD5</SelectItem>
                                        <SelectItem value="RIPEMD160">RIPEMD-160</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button className="sm:mt-8 h-10 px-8" onClick={computeHash}>
                                <RefreshCw className="mr-2 h-4 w-4" />
                                Refresh Hash
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
