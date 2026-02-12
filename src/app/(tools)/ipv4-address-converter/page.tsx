'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Binary, Copy, Check, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function AddressConverter() {
    const [input, setInput] = useState('192.168.1.1');
    const [result, setResult] = useState<any>(null);
    const { toast } = useToast();
    const [copiedField, setCopiedField] = useState<string | null>(null);

    const convert = () => {
        try {
            let decimal = 0;

            // Check if it's a dotted decimal
            if (input.includes('.')) {
                const parts = input.split('.').map(Number);
                if (parts.length !== 4 || parts.some(p => p < 0 || p > 255)) {
                    throw new Error('Invalid IP format');
                }
                decimal = parts.reduce((acc, octet) => (acc << 8) + octet, 0) >>> 0;
            } else if (input.startsWith('0x')) {
                // Hex
                decimal = parseInt(input, 16) >>> 0;
            } else if (/^[01]+$/.test(input) && input.length >= 8) {
                // Binary
                decimal = parseInt(input, 2) >>> 0;
            } else {
                // Assume decimal
                decimal = parseInt(input) >>> 0;
            }

            if (isNaN(decimal)) throw new Error('Invalid input');

            const dotted = [
                (decimal >>> 24) & 0xFF,
                (decimal >>> 16) & 0xFF,
                (decimal >>> 8) & 0xFF,
                decimal & 0xFF
            ].join('.');

            const binary = (decimal >>> 0).toString(2).padStart(32, '0');
            const binarySpaced = binary.match(/.{8}/g)?.join(' ') || binary;

            const hex = '0x' + decimal.toString(16).toUpperCase().padStart(8, '0');

            const integer = decimal.toString();

            setResult({
                dotted,
                binary: binarySpaced,
                hex,
                integer
            });

        } catch (error: any) {
            toast({
                title: 'Conversion Error',
                description: error.message,
                variant: 'destructive'
            });
        }
    };

    const copyToClipboard = (text: string, field: string) => {
        navigator.clipboard.writeText(text.replace(/\s/g, ''));
        setCopiedField(field);
        toast({ title: 'Copied to clipboard' });
        setTimeout(() => setCopiedField(null), 2000);
    };

    return (
        <div className="container mx-auto py-10 px-4 max-w-4xl">
            <div className="flex flex-col items-center mb-10 text-center">
                <div className="p-4 rounded-2xl bg-primary/10 mb-4">
                    <Binary className="h-10 w-10 text-primary" />
                </div>
                <h1 className="text-4xl font-bold font-headline mb-2">IPv4 Address Converter</h1>
                <p className="text-muted-foreground">Convert between Dotted Decimal, Binary, Hexadecimal, and Integer formats.</p>
            </div>

            <Card className="glass-panel mb-8">
                <CardContent className="pt-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1 space-y-2">
                            <Label htmlFor="input">IP Address (Any format)</Label>
                            <Input
                                id="input"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="192.168.1.1 or 0xC0A80101"
                                className="font-mono"
                            />
                        </div>
                        <Button className="sm:mt-8 flex gap-2" onClick={convert}>
                            <RefreshCw className="h-4 w-4" />
                            Convert
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 gap-6">
                {!result ? (
                    <div className="h-40 flex items-center justify-center text-muted-foreground italic border-2 border-dashed rounded-xl">
                        Enter an address to see conversions
                    </div>
                ) : (
                    <div className="space-y-4">
                        {[
                            { label: 'Dotted Decimal', value: result.dotted, field: 'dotted' },
                            { label: 'Binary', value: result.binary, field: 'binary' },
                            { label: 'Hexadecimal', value: result.hex, field: 'hex' },
                            { label: 'Decimal Integer', value: result.integer, field: 'integer' },
                        ].map((item) => (
                            <div key={item.label} className="p-4 rounded-xl bg-muted/30 border border-border group relative flex justify-between items-center transition-all hover:bg-muted/50">
                                <div>
                                    <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1">{item.label}</p>
                                    <p className="font-mono text-xl break-all">{item.value}</p>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => copyToClipboard(item.value, item.field)}
                                    className="ml-4 shrink-0 transition-all"
                                >
                                    {copiedField === item.field ? <Check className="h-4 w-4 text-green-500 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                                    {copiedField === item.field ? 'Copied' : 'Copy'}
                                </Button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
