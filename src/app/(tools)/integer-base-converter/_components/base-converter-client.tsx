'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Binary, Copy, Check, Trash2, ArrowRightLeft, Info, Hash } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const BASES = [
    { name: 'Binary', value: '2' },
    { name: 'Octal', value: '8' },
    { name: 'Decimal', value: '10' },
    { name: 'Hexadecimal', value: '16' },
];

export default function BaseConverterClient() {
    const [inputValue, setInputValue] = useState('');
    const [inputBase, setInputBase] = useState('10');
    const [results, setResults] = useState<{ base: string, name: string, value: string }[]>([]);
    const { toast } = useToast();
    const [copiedBase, setCopiedBase] = useState<string | null>(null);

    useEffect(() => {
        if (!inputValue) {
            setResults([]);
            return;
        }

        try {
            // Parse the input value based on current base
            const decimalValue = BigInt(`0b${inputValue === '0' ? '0' : ''}`) || BigInt(0); // Fallback
            // BigInt handles large numbers better, but parsing from string base needs intermediate decimal

            // Correct parsing:
            let decimal: bigint;
            if (inputBase === '10') {
                decimal = BigInt(inputValue);
            } else if (inputBase === '16') {
                decimal = BigInt(`0x${inputValue}`);
            } else if (inputBase === '8') {
                decimal = BigInt(`0o${inputValue}`);
            } else {
                decimal = BigInt(`0b${inputValue}`);
            }

            const currentResults = BASES.map(b => ({
                base: b.value,
                name: b.name,
                value: decimal.toString(parseInt(b.value)).toUpperCase()
            }));

            // Add some interesting bases if not present
            if (!BASES.find(b => b.value === '36')) {
                currentResults.push({ base: '36', name: 'Base 36', value: decimal.toString(36).toUpperCase() });
            }

            setResults(currentResults);
        } catch (err) {
            setResults([{ base: 'error', name: 'Error', value: 'Invalid input for selected base' }]);
        }
    }, [inputValue, inputBase]);

    const copyToClipboard = (val: string, base: string) => {
        if (base === 'error') return;
        navigator.clipboard.writeText(val);
        setCopiedBase(base);
        toast({ title: 'Copied to clipboard' });
        setTimeout(() => setCopiedBase(null), 2000);
    };

    const validateInput = (val: string) => {
        // Simple regex-based validation per base
        const regexes: { [key: string]: RegExp } = {
            '2': /^[01]*$/,
            '8': /^[0-7]*$/,
            '10': /^[0-9]*$/,
            '16': /^[0-9A-Fa-f]*$/
        };
        return regexes[inputBase].test(val);
    };

    const handleInput = (val: string) => {
        if (validateInput(val)) {
            setInputValue(val);
        }
    };

    return (
        <div className="container mx-auto py-10 px-4 max-w-4xl">
            <div className="flex flex-col items-center mb-10 text-center">
                <div className="p-4 rounded-2xl bg-primary/10 mb-4">
                    <Hash className="h-10 w-10 text-primary" />
                </div>
                <h1 className="text-4xl font-bold font-headline mb-2">Integer Base Converter</h1>
                <p className="text-muted-foreground">Quickly switch between Decimal, Binary, Hex, and Octal numeral systems.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
                <Card className="md:col-span-5 glass-panel border-primary/20">
                    <CardHeader>
                        <CardTitle className="text-lg">Input Settings</CardTitle>
                        <CardDescription>Select base and enter value</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Label>Source Base</Label>
                            <Select value={inputBase} onValueChange={(v) => { setInputBase(v); setInputValue(''); }}>
                                <SelectTrigger className="h-12">
                                    <SelectValue placeholder="Select base" />
                                </SelectTrigger>
                                <SelectContent>
                                    {BASES.map(b => (
                                        <SelectItem key={b.value} value={b.value}>{b.name} (Base {b.value})</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Enter Value</Label>
                            <Input
                                placeholder={`Enter ${BASES.find(b => b.value === inputBase)?.name} value...`}
                                className="h-14 font-mono text-xl font-bold uppercase transition-all focus-visible:ring-primary/40"
                                value={inputValue}
                                onChange={(e) => handleInput(e.target.value)}
                            />
                        </div>
                        <Button variant="ghost" className="w-full h-10 gap-2 border border-dashed border-border" onClick={() => setInputValue('')} disabled={!inputValue}>
                            <Trash2 className="h-4 w-4" /> Clear Input
                        </Button>
                    </CardContent>
                </Card>

                <div className="md:col-span-7 space-y-4">
                    <h3 className="text-sm font-bold uppercase tracking-widest opacity-50 pl-2">Conversion Results</h3>
                    <div className="grid grid-cols-1 gap-4">
                        {results.length > 0 ? (
                            results.map((res) => (
                                <Card key={res.base} className={`glass-panel border-primary/10 transition-all ${res.base === 'error' ? 'bg-destructive/5 border-destructive/20' : 'bg-primary/5 hover:bg-primary/10'}`}>
                                    <CardContent className="p-4 flex items-center justify-between">
                                        <div className="flex flex-col gap-1 min-w-0">
                                            <span className="text-[10px] uppercase font-black opacity-40">{res.name}</span>
                                            <span className={`font-mono text-lg font-black truncate ${res.base === 'error' ? 'text-destructive text-sm' : 'text-foreground'}`}>
                                                {res.value}
                                            </span>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="shrink-0 rounded-full h-10 w-10"
                                            onClick={() => copyToClipboard(res.value, res.base)}
                                            disabled={res.base === 'error'}
                                        >
                                            {copiedBase === res.base ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                                        </Button>
                                    </CardContent>
                                </Card>
                            ))
                        ) : (
                            <div className="h-[300px] flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-border opacity-20">
                                <Binary className="h-16 w-16 mb-4" />
                                <p className="text-sm font-bold">Waiting for input...</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="mt-12 p-8 rounded-3xl bg-muted/20 border border-border">
                <div className="flex items-center gap-3 mb-4">
                    <Info className="h-5 w-5 text-primary" />
                    <h3 className="font-bold">Understanding Numeral Systems</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 text-sm text-muted-foreground leading-relaxed">
                    <p>
                        **Binary (Base 2)** is the foundation of digital computing. It uses only 0 and 1 to represent data, mirroring the on/off states of transistors.
                    </p>
                    <p>
                        **Hexadecimal (Base 16)** is widely used in software engineering to represent binary data compactly. One hex digit represents exactly 4 bits (a nibble).
                    </p>
                </div>
            </div>
        </div>
    );
}
