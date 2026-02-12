'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Shuffle, Copy, Check, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Slider } from '@/components/ui/slider';

export default function TokenGeneratorClient() {
    const [length, setLength] = useState(32);
    const [options, setOptions] = useState({
        uppercase: true,
        lowercase: true,
        numbers: true,
        symbols: true,
    });
    const [token, setToken] = useState('');
    const { toast } = useToast();
    const [isCopied, setIsCopied] = useState(false);

    const generateToken = () => {
        let charset = '';
        if (options.uppercase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        if (options.lowercase) charset += 'abcdefghijklmnopqrstuvwxyz';
        if (options.numbers) charset += '0123456789';
        if (options.symbols) charset += '!@#$%^&*()_+~`|}{[]:;?><,./-=';

        if (!charset) {
            toast({
                title: 'Selection Error',
                description: 'Please select at least one character set.',
                variant: 'destructive',
            });
            return;
        }

        let result = '';
        const array = new Uint32Array(length);
        window.crypto.getRandomValues(array);

        for (let i = 0; i < length; i++) {
            result += charset[array[i] % charset.length];
        }

        setToken(result);
    };

    useEffect(() => {
        generateToken();
    }, []);

    const copyToClipboard = () => {
        if (!token) return;
        navigator.clipboard.writeText(token);
        setIsCopied(true);
        toast({ title: 'Token copied to clipboard' });
        setTimeout(() => setIsCopied(false), 2000);
    };

    return (
        <div className="container mx-auto py-10 px-4 max-w-4xl">
            <div className="flex flex-col items-center mb-10 text-center">
                <div className="p-4 rounded-2xl bg-primary/10 mb-4">
                    <Shuffle className="h-10 w-10 text-primary" />
                </div>
                <h1 className="text-4xl font-bold font-headline mb-2">Token Generator</h1>
                <p className="text-muted-foreground">Generate secure, random strings for API keys, passwords, or secrets.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card className="glass-panel">
                    <CardHeader>
                        <CardTitle className="text-lg">Configuration</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-4">
                            <div className="flex justify-between">
                                <Label>Token Length: {length}</Label>
                            </div>
                            <Slider
                                value={[length]}
                                min={4}
                                max={128}
                                step={1}
                                onValueChange={(val) => setLength(val[0])}
                            />
                        </div>

                        <div className="grid grid-cols-1 gap-4 mt-6">
                            {[
                                { id: 'uppercase', label: 'Uppercase (A-Z)' },
                                { id: 'lowercase', label: 'Lowercase (a-z)' },
                                { id: 'numbers', label: 'Numbers (0-9)' },
                                { id: 'symbols', label: 'Symbols (!@#$)' },
                            ].map((opt) => (
                                <div key={opt.id} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={opt.id}
                                        checked={options[opt.id as keyof typeof options]}
                                        onCheckedChange={(checked) => setOptions(prev => ({ ...prev, [opt.id]: !!checked }))}
                                    />
                                    <Label htmlFor={opt.id} className="cursor-pointer">{opt.label}</Label>
                                </div>
                            ))}
                        </div>

                        <Button className="w-full mt-6 h-12 text-lg font-bold glow-button" onClick={generateToken}>
                            <RefreshCw className="mr-2 h-5 w-5" />
                            Generate Token
                        </Button>
                    </CardContent>
                </Card>

                <Card className="glass-panel border-primary/20 bg-primary/5 flex flex-col justify-center">
                    <CardContent className="pt-6">
                        <p className="text-xs text-muted-foreground uppercase font-bold tracking-widest mb-4">Your Secure Token</p>
                        <div className="relative group">
                            <div className="p-6 rounded-xl bg-background/80 border-2 border-primary/20 font-mono text-lg break-all min-h-[100px] flex items-center justify-center text-center">
                                {token}
                            </div>
                            <Button
                                className="w-full mt-6 h-14 text-lg"
                                onClick={copyToClipboard}
                                disabled={!token}
                            >
                                {isCopied ? <Check className="mr-2 h-5 w-5 text-green-500" /> : <Copy className="mr-2 h-5 w-5" />}
                                {isCopied ? 'Copied!' : 'Copy to Clipboard'}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
