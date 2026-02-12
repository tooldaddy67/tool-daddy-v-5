'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ChevronsUpDown, Copy, Check, List, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function RangeExpander() {
    const [input, setInput] = useState('192.168.1.0/28');
    const [results, setResults] = useState<string[]>([]);
    const { toast } = useToast();
    const [isCopied, setIsCopied] = useState(false);

    const expand = () => {
        try {
            let start, end;

            if (input.includes('/')) {
                // CIDR
                const [ip, mask] = input.split('/');
                const cidr = parseInt(mask);
                if (cidr < 0 || cidr > 32) throw new Error('Invalid CIDR');

                const parts = ip.split('.').map(Number);
                const ipNum = parts.reduce((acc, octet) => (acc << 8) + octet, 0) >>> 0;
                const maskBits = (0xFFFFFFFF << (32 - cidr)) >>> 0;

                start = (ipNum & maskBits) >>> 0;
                end = (start | (~maskBits)) >>> 0;

                if (end - start > 1024) throw new Error('Range too large (max 1024 IPs)');

            } else if (input.includes('-')) {
                // Dash range
                const [s, e] = input.split('-').map(i => i.trim());
                const sParts = s.split('.').map(Number);
                const eParts = e.split('.').map(Number);

                start = sParts.reduce((acc, octet) => (acc << 8) + octet, 0) >>> 0;
                end = eParts.reduce((acc, octet) => (acc << 8) + octet, 0) >>> 0;

                if (start > end) throw new Error('Start IP must be less than end IP');
                if (end - start > 1024) throw new Error('Range too large (max 1024 IPs)');
            } else {
                throw new Error('Invalid format (use CIDR or start-end)');
            }

            const list: string[] = [];
            for (let i = start; i <= end; i++) {
                list.push([
                    (i >>> 24) & 0xFF,
                    (i >>> 16) & 0xFF,
                    (i >>> 8) & 0xFF,
                    i & 0xFF
                ].join('.'));
            }

            setResults(list);

        } catch (error: any) {
            toast({
                title: 'Expansion Error',
                description: error.message,
                variant: 'destructive'
            });
        }
    };

    const copyAll = () => {
        navigator.clipboard.writeText(results.join('\n'));
        setIsCopied(true);
        toast({ title: 'All IPs copied to clipboard' });
        setTimeout(() => setIsCopied(null), 2000);
    };

    return (
        <div className="container mx-auto py-10 px-4 max-w-4xl">
            <div className="flex flex-col items-center mb-10 text-center">
                <div className="p-4 rounded-2xl bg-primary/10 mb-4">
                    <ChevronsUpDown className="h-10 w-10 text-primary" />
                </div>
                <h1 className="text-4xl font-bold font-headline mb-2">IPv4 Range Expander</h1>
                <p className="text-muted-foreground">Expand CIDR notation (e.g. /24) or IP ranges (e.g. 192.168.1.1-192.168.1.10) into a full list.</p>
            </div>

            <Card className="glass-panel mb-8">
                <CardContent className="pt-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1 space-y-2">
                            <Label htmlFor="range">Range or CIDR</Label>
                            <Input
                                id="range"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="192.168.1.0/24 or 10.0.0.1 - 10.0.0.50"
                            />
                        </div>
                        <Button className="sm:mt-8 flex gap-2" onClick={expand}>
                            <List className="h-4 w-4" />
                            Expand Range
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {results.length > 0 && (
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-bold font-headline">Results ({results.length})</h2>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={copyAll}>
                                {isCopied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                                Copy All
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => setResults([])} className="text-destructive">
                                <Trash2 className="h-4 w-4 mr-2" />
                                Clear
                            </Button>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {results.map((ip, i) => (
                            <div key={i} className="p-2 rounded bg-muted/40 border border-border/50 text-center font-mono text-sm">
                                {ip}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {results.length === 0 && (
                <div className="h-40 flex items-center justify-center text-muted-foreground italic border-2 border-dashed rounded-xl">
                    Enter a range to expand
                </div>
            )}
        </div>
    );
}
