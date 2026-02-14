'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Lock, Unlock, Copy, Check, Trash2, ArrowRightLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function Base64StringClient() {
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [mode, setMode] = useState<'encode' | 'decode'>('encode');
    const { toast } = useToast();
    const [isCopied, setIsCopied] = useState(false);

    useEffect(() => {
        if (!input.trim()) {
            setOutput('');
            return;
        }

        try {
            if (mode === 'encode') {
                // Use btoa with UTF-8 support via text encoder
                const bytes = new TextEncoder().encode(input);
                const base64 = btoa(String.fromCharCode(...bytes));
                setOutput(base64);
            } else {
                // Use atob with UTF-8 support via text decoder
                const binary = atob(input);
                const bytes = new Uint8Array(binary.length);
                for (let i = 0; i < binary.length; i++) {
                    bytes[i] = binary.charCodeAt(i);
                }
                const decoded = new TextDecoder().decode(bytes);
                setOutput(decoded);
            }
        } catch (err) {
            setOutput('Error: Invalid input for ' + mode + 'ing');
        }
    }, [input, mode]);

    const toggleMode = () => {
        setMode(prev => prev === 'encode' ? 'decode' : 'encode');
        setInput(output); // Swap inputs
    };

    const copyToClipboard = () => {
        if (!output) return;
        navigator.clipboard.writeText(output);
        setIsCopied(true);
        toast({ title: 'Result copied to clipboard' });
        setTimeout(() => setIsCopied(false), 2000);
    };

    const clearInput = () => {
        setInput('');
        setOutput('');
    };

    return (
        <div className="container mx-auto py-10 px-4 max-w-5xl">
            <div className="flex flex-col items-center mb-10 text-center">
                <div className="p-4 rounded-2xl bg-primary/10 mb-4">
                    {mode === 'encode' ? <Lock className="h-10 w-10 text-primary" /> : <Unlock className="h-10 w-10 text-primary" />}
                </div>
                <h1 className="text-4xl font-bold font-headline mb-2">Base64 String {mode === 'encode' ? 'Encoder' : 'Decoder'}</h1>
                <p className="text-muted-foreground">Convert text strings to Base64 and vice-versa with full UTF-8 support.</p>
            </div>

            <div className="flex flex-col md:flex-row gap-6 items-stretch">
                <Card className="flex-1 glass-panel border-primary/20">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <Label htmlFor="input-text" className="text-sm font-bold uppercase tracking-widest opacity-50">
                            {mode === 'encode' ? 'Plain Text' : 'Base64 Input'}
                        </Label>
                        <Button variant="ghost" size="sm" onClick={clearInput} disabled={!input}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <Textarea
                            id="input-text"
                            placeholder={mode === 'encode' ? "Enter text here..." : "Enter Base64 here..."}
                            className="min-h-[300px] font-mono text-sm bg-background/50 resize-y"
                            value={input}
                            maxLength={100000} // Security Hardening: 100KB limit
                            onChange={(e) => setInput(e.target.value)}
                        />
                    </CardContent>
                </Card>

                <div className="flex md:flex-col items-center justify-center gap-4 py-4">
                    <Button
                        variant="outline"
                        size="icon"
                        className="rounded-full w-12 h-12 shadow-lg hover:scale-110 transition-transform active:rotate-180 duration-500"
                        onClick={toggleMode}
                    >
                        <ArrowRightLeft className="h-6 w-6 rotate-90 md:rotate-0" />
                    </Button>
                </div>

                <Card className="flex-1 glass-panel bg-primary/5 border-primary/30">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <Label className="text-sm font-bold uppercase tracking-widest opacity-50">
                            Result
                        </Label>
                        <Button variant="ghost" size="sm" onClick={copyToClipboard} disabled={!output || output.startsWith('Error')}>
                            {isCopied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <div className="min-h-[300px] p-3 rounded-md bg-background/50 border border-border font-mono text-sm break-all whitespace-pre-wrap">
                            {output || <span className="opacity-20 italic">Waiting for input...</span>}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="mt-10 p-6 rounded-2xl bg-muted/30 border border-border">
                <h3 className="font-bold mb-2">About Base64 {mode === 'encode' ? 'Encoding' : 'Decoding'}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                    Base64 is a binary-to-text encoding scheme that represents binary data in an ASCII string format.
                    It is commonly used when there is a need to encode binary data that needs to be stored and transferred
                    over media that are designed to deal with textual data. Our tool supports full **UTF-8 characters**,
                    ensuring that emojis and international characters are handled correctly.
                </p>
            </div>
        </div>
    );
}
