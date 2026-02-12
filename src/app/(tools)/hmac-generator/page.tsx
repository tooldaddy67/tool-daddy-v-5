'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Equal, Copy, Check, RefreshCw, KeyRound, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import CryptoJS from 'crypto-js';

export default function HmacGenerator() {
    const [message, setMessage] = useState('');
    const [secret, setSecret] = useState('');
    const [showSecret, setShowSecret] = useState(false);
    const [algorithm, setAlgorithm] = useState('SHA256');
    const [result, setResult] = useState('');
    const { toast } = useToast();
    const [isCopied, setIsCopied] = useState(false);

    const computeHmac = () => {
        if (!message || !secret) {
            setResult('');
            return;
        }

        try {
            let hmac;
            switch (algorithm) {
                case 'MD5': hmac = CryptoJS.HmacMD5(message, secret).toString(); break;
                case 'SHA1': hmac = CryptoJS.HmacSHA1(message, secret).toString(); break;
                case 'SHA256': hmac = CryptoJS.HmacSHA256(message, secret).toString(); break;
                case 'SHA512': hmac = CryptoJS.HmacSHA512(message, secret).toString(); break;
                default: hmac = CryptoJS.HmacSHA256(message, secret).toString();
            }
            setResult(hmac);
        } catch (error) {
            toast({
                title: 'HMAC Error',
                description: 'Failed to compute HMAC.',
                variant: 'destructive',
            });
        }
    };

    useEffect(() => {
        computeHmac();
    }, [message, secret, algorithm]);

    const copyToClipboard = () => {
        if (!result) return;
        navigator.clipboard.writeText(result);
        setIsCopied(true);
        toast({ title: 'HMAC copied to clipboard' });
        setTimeout(() => setIsCopied(false), 2000);
    };

    return (
        <div className="container mx-auto py-10 px-4 max-w-4xl">
            <div className="flex flex-col items-center mb-10 text-center">
                <div className="p-4 rounded-2xl bg-primary/10 mb-4">
                    <Equal className="h-10 w-10 text-primary" />
                </div>
                <h1 className="text-4xl font-bold font-headline mb-2">HMAC Generator</h1>
                <p className="text-muted-foreground">Compute Hash-based Message Authentication Codes with a secret key.</p>
            </div>

            <div className="grid grid-cols-1 gap-8">
                <Card className="glass-panel">
                    <CardHeader>
                        <CardTitle className="text-lg">Parameters</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="message">Data / Message</Label>
                            <Textarea
                                id="message"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Enter the data to sign..."
                                className="min-h-[120px] font-mono"
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="secret" className="flex items-center gap-2">
                                    <KeyRound className="h-4 w-4" />
                                    Secret Key
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="secret"
                                        type={showSecret ? 'text' : 'password'}
                                        value={secret}
                                        onChange={(e) => setSecret(e.target.value)}
                                        placeholder="Enter your secret key..."
                                        className="pr-10"
                                    />
                                    <button
                                        className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                                        onClick={() => setShowSecret(!showSecret)}
                                    >
                                        {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Algorithm</Label>
                                <Select value={algorithm} onValueChange={setAlgorithm}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select algorithm" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="SHA256">HMAC-SHA256</SelectItem>
                                        <SelectItem value="SHA512">HMAC-SHA512</SelectItem>
                                        <SelectItem value="SHA1">HMAC-SHA1</SelectItem>
                                        <SelectItem value="MD5">HMAC-MD5</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <Button className="w-full h-12 text-lg font-bold glow-button mt-4" onClick={computeHmac}>
                            <RefreshCw className="mr-2 h-5 w-5" />
                            Compute HMAC
                        </Button>
                    </CardContent>
                </Card>

                {result && (
                    <Card className="glass-panel border-primary/20 bg-primary/5">
                        <CardHeader>
                            <CardTitle className="text-sm uppercase tracking-widest text-muted-foreground">Generated HMAC Signature</CardTitle>
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
                                    {isCopied ? <Check className="mr-2 h-4 w-4 text-green-500" /> : <Copy className="mr-2 h-4 w-4" />}
                                    {isCopied ? 'Copied' : 'Copy Signature'}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
