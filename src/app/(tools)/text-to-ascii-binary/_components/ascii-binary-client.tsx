'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Binary, Copy, Check, Trash2, Hash, Code } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function AsciiBinaryClient() {
    const [text, setText] = useState('');
    const [results, setResults] = useState({
        binary: '',
        decimal: '',
        hex: ''
    });
    const { toast } = useToast();
    const [copiedKey, setCopiedKey] = useState<string | null>(null);

    useEffect(() => {
        if (!text.trim()) {
            setResults({ binary: '', decimal: '', hex: '' });
            return;
        }

        const chars = Array.from(text);

        const binary = chars.map(c => c.charCodeAt(0).toString(2).padStart(8, '0')).join(' ');
        const decimal = chars.map(c => c.charCodeAt(0).toString(10)).join(' ');
        const hex = chars.map(c => c.charCodeAt(0).toString(16).toUpperCase().padStart(2, '0')).join(' ');

        setResults({ binary, decimal, hex });
    }, [text]);

    const copyToClipboard = (val: string, key: string) => {
        if (!val) return;
        navigator.clipboard.writeText(val);
        setCopiedKey(key);
        toast({ title: `${key.charAt(0).toUpperCase() + key.slice(1)} copied to clipboard` });
        setTimeout(() => setCopiedKey(null), 2000);
    };

    return (
        <div className="container mx-auto py-10 px-4 max-w-5xl">
            <div className="flex flex-col items-center mb-10 text-center">
                <div className="p-4 rounded-2xl bg-primary/10 mb-4">
                    <Binary className="h-10 w-10 text-primary" />
                </div>
                <h1 className="text-4xl font-bold font-headline mb-2">Text to ASCII & Binary</h1>
                <p className="text-muted-foreground">Instantly convert plain text into its Binary, Decimal, and Hexadecimal ASCII representations.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="glass-panel border-primary/20 bg-background/50">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <Label htmlFor="text-input" className="text-sm font-bold uppercase tracking-widest opacity-50">Input Text</Label>
                        <Button variant="ghost" size="sm" onClick={() => setText('')} disabled={!text}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <Textarea
                            id="text-input"
                            placeholder="Type something to convert..."
                            className="min-h-[400px] font-mono text-lg resize-y bg-transparent"
                            value={text}
                            maxLength={50000} // Security Hardening: 50KB limit for high-complexity string ops
                            onChange={(e) => setText(e.target.value)}
                        />
                    </CardContent>
                </Card>

                <div className="space-y-6">
                    {/* Binary Output */}
                    <Card className="glass-panel border-primary/20 bg-primary/5">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <div className="flex items-center gap-2">
                                <Binary className="h-4 w-4 text-primary" />
                                <Label className="text-sm font-bold uppercase tracking-widest opacity-50">Binary</Label>
                            </div>
                            <Button variant="ghost" size="sm" onClick={() => copyToClipboard(results.binary, 'binary')} disabled={!results.binary}>
                                {copiedKey === 'binary' ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <div className="p-4 rounded-xl bg-background/50 border border-border font-mono text-sm break-all max-h-[120px] overflow-y-auto leading-relaxed">
                                {results.binary || <span className="opacity-20 italic text-xs">01000001 01000010 01000011...</span>}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Decimal Output */}
                    <Card className="glass-panel border-primary/20 bg-primary/5">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <div className="flex items-center gap-2">
                                <Hash className="h-4 w-4 text-primary" />
                                <Label className="text-sm font-bold uppercase tracking-widest opacity-50">Decimal ASCII</Label>
                            </div>
                            <Button variant="ghost" size="sm" onClick={() => copyToClipboard(results.decimal, 'decimal')} disabled={!results.decimal}>
                                {copiedKey === 'decimal' ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <div className="p-4 rounded-xl bg-background/50 border border-border font-mono text-sm break-all max-h-[120px] overflow-y-auto">
                                {results.decimal || <span className="opacity-20 italic text-xs">65 66 67...</span>}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Hex Output */}
                    <Card className="glass-panel border-primary/20 bg-primary/5">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <div className="flex items-center gap-2">
                                <Code className="h-4 w-4 text-primary" />
                                <Label className="text-sm font-bold uppercase tracking-widest opacity-50">Hexadecimal</Label>
                            </div>
                            <Button variant="ghost" size="sm" onClick={() => copyToClipboard(results.hex, 'hex')} disabled={!results.hex}>
                                {copiedKey === 'hex' ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <div className="p-4 rounded-xl bg-background/50 border border-border font-mono text-sm break-all max-h-[120px] overflow-y-auto">
                                {results.hex || <span className="opacity-20 italic text-xs">41 42 43...</span>}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <div className="mt-12 p-8 rounded-3xl bg-muted/20 border border-border grid grid-cols-1 md:grid-cols-3 gap-8">
                <div>
                    <h4 className="font-bold text-primary mb-2">Binary</h4>
                    <p className="text-xs text-muted-foreground">The most basic form of computer data, consisting of only 0s and 1s representing patterns of bits.</p>
                </div>
                <div>
                    <h4 className="font-bold text-primary mb-2">Decimal</h4>
                    <p className="text-xs text-muted-foreground">Base-10 representation of ASCII characters. For example, 'A' is 65.</p>
                </div>
                <div>
                    <h4 className="font-bold text-primary mb-2">Hexadecimal</h4>
                    <p className="text-xs text-muted-foreground">Base-16 representation widely used in programming and debugging to represent binary data compactly.</p>
                </div>
            </div>
        </div>
    );
}
