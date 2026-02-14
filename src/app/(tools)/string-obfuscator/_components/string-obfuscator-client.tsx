'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ShieldAlert, Copy, Check, Trash2, RefreshCw, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type ObfuscationMode = 'rot13' | 'leet' | 'reverse' | 'base64' | 'scramble';

const LEET_MAP: Record<string, string> = {
    'a': '4', 'e': '3', 'g': '6', 'i': '1', 'o': '0', 's': '5', 't': '7'
};

export default function StringObfuscatorClient() {
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [mode, setMode] = useState<ObfuscationMode>('rot13');
    const { toast } = useToast();
    const [isCopied, setIsCopied] = useState(false);

    const obfuscate = (text: string, m: ObfuscationMode): string => {
        if (!text) return '';

        switch (m) {
            case 'rot13':
                return text.replace(/[a-zA-Z]/g, (c) => {
                    const base = c <= 'Z' ? 65 : 197; // Wait, actually standard A=65, a=97
                    const b = c <= 'Z' ? 65 : 97;
                    return String.fromCharCode(((c.charCodeAt(0) - b + 13) % 26) + b);
                });
            case 'leet':
                return text.toLowerCase().split('').map(c => LEET_MAP[c] || c).join('');
            case 'reverse':
                return text.split('').reverse().join('');
            case 'base64':
                try {
                    return btoa(unescape(encodeURIComponent(text)));
                } catch (e) {
                    return 'Error: Could not encode to Base64';
                }
            case 'scramble':
                // Randomly shuffle characters within words
                return text.split(' ').map(word => {
                    if (word.length <= 3) return word;
                    const arr = word.split('');
                    for (let i = arr.length - 1; i > 0; i--) {
                        const j = Math.floor(Math.random() * (i + 1));
                        [arr[i], arr[arr.length - 1 - i]] = [arr[arr.length - 1 - i], arr[i]]; // Wait, simple swap
                        const tempIdx = Math.floor(Math.random() * arr.length);
                        [arr[i], arr[tempIdx]] = [arr[tempIdx], arr[i]];
                    }
                    return arr.join('');
                }).join(' ');
            default:
                return text;
        }
    };

    useEffect(() => {
        setOutput(obfuscate(input, mode));
    }, [input, mode]);

    const copyToClipboard = () => {
        if (!output) return;
        navigator.clipboard.writeText(output);
        setIsCopied(true);
        toast({ title: 'Obfuscated text copied' });
        setTimeout(() => setIsCopied(false), 2000);
    };

    return (
        <div className="container mx-auto py-10 px-4 max-w-4xl">
            <div className="flex flex-col items-center mb-10 text-center">
                <div className="p-4 rounded-2xl bg-primary/10 mb-4">
                    <ShieldAlert className="h-10 w-10 text-primary" />
                </div>
                <h1 className="text-4xl font-bold font-headline mb-2">String Obfuscator</h1>
                <p className="text-muted-foreground">Scramble, encode, or transform your text using various methods.</p>
            </div>

            <div className="grid grid-cols-1 gap-8">
                <Card className="glass-panel border-primary/20">
                    <CardHeader className="flex flex-row items-baseline justify-between pb-6">
                        <div className="space-y-1">
                            <CardTitle className="text-lg">Input & Settings</CardTitle>
                            <CardDescription>Enter text and choose your method</CardDescription>
                        </div>
                        <div className="flex items-center gap-4">
                            <Select value={mode} onValueChange={(v) => setMode(v as ObfuscationMode)}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Select mode" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="rot13">ROT13</SelectItem>
                                    <SelectItem value="leet">Leet Speak</SelectItem>
                                    <SelectItem value="reverse">Reverse Text</SelectItem>
                                    <SelectItem value="base64">Base64</SelectItem>
                                    <SelectItem value="scramble">Random Scramble</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button variant="ghost" size="icon" onClick={() => setInput('')} disabled={!input}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <Textarea
                            placeholder="Type or paste your text here..."
                            className="min-h-[150px] text-lg bg-background/50"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                        />
                    </CardContent>
                </Card>

                <Card className="glass-panel bg-primary/5 border-primary/30">
                    <CardHeader className="flex flex-row items-center justify-between pb-4">
                        <CardTitle className="text-lg">Obfuscated Output</CardTitle>
                        <Button variant="outline" size="sm" onClick={copyToClipboard} disabled={!output}>
                            {isCopied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                            Copy Result
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <div className="p-6 rounded-2xl bg-background/80 border border-primary/10 min-h-[120px] relative group">
                            <p className="font-mono text-lg break-all whitespace-pre-wrap">
                                {output || <span className="text-muted-foreground italic opacity-30">Transformed text will appear here...</span>}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6">
                {[
                    { title: 'Leet Speak', desc: 'Replaces letters with numbers (4 for A, 3 for E).' },
                    { title: 'ROT13', desc: 'Shifts letters by 13 places in the alphabet.' },
                    { title: 'Base64', desc: 'Converts text into a binary-to-text encoding.' }
                ].map((item, i) => (
                    <div key={i} className="p-5 rounded-2xl bg-muted/20 border border-border">
                        <h4 className="font-bold text-sm mb-2">{item.title}</h4>
                        <p className="text-xs text-muted-foreground line-clamp-2">{item.desc}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
