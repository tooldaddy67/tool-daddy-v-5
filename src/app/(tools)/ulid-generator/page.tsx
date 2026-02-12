'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ListOrdered, Copy, Check, RefreshCw, Trash2, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ulid } from 'ulid';
import { Input } from '@/components/ui/input';

export default function UlidGenerator() {
    const [ulids, setUlids] = useState<string[]>([]);
    const [count, setCount] = useState(5);
    const { toast } = useToast();
    const [isCopied, setIsCopied] = useState(false);

    const generate = () => {
        const newUlids = Array.from({ length: Math.min(count, 100) }, () => ulid());
        setUlids(newUlids);
    };

    useEffect(() => {
        generate();
    }, []);

    const copyAll = () => {
        if (ulids.length === 0) return;
        navigator.clipboard.writeText(ulids.join('\n'));
        setIsCopied(true);
        toast({ title: 'All ULIDs copied' });
        setTimeout(() => setIsCopied(false), 2000);
    };

    return (
        <div className="container mx-auto py-10 px-4 max-w-4xl">
            <div className="flex flex-col items-center mb-10 text-center">
                <div className="p-4 rounded-2xl bg-primary/10 mb-4">
                    <ListOrdered className="h-10 w-10 text-primary" />
                </div>
                <h1 className="text-4xl font-bold font-headline mb-2">ULID Generator</h1>
                <p className="text-muted-foreground">Generate Universally Unique Lexicographically Sortable Identifiers.</p>
            </div>

            <Card className="glass-panel mb-8">
                <CardContent className="pt-6 text-sm text-muted-foreground">
                    <div className="flex items-start gap-3 bg-muted/50 p-4 rounded-lg mb-6">
                        <Clock className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                        <p>Unlike UUIDs, ULIDs are sortable by generation time, making them excellent for database primary keys and ordered logs.</p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4 items-end">
                        <div className="flex-1 space-y-2">
                            <Label htmlFor="count">Quantity to Generate (Max 100)</Label>
                            <Input
                                id="count"
                                type="number"
                                min="1"
                                max="100"
                                value={count}
                                onChange={(e) => setCount(parseInt(e.target.value) || 1)}
                            />
                        </div>
                        <Button className="h-12 px-8 flex gap-2" onClick={generate}>
                            <RefreshCw className="h-4 w-4" />
                            Generate New
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {ulids.length > 0 && (
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-bold font-headline flex items-center gap-2">
                            Generated Results
                        </h2>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={copyAll}>
                                {isCopied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                                Copy All
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => setUlids([])} className="text-destructive">
                                <Trash2 className="h-4 w-4 mr-2" />
                                Clear
                            </Button>
                        </div>
                    </div>

                    <div className="space-y-3">
                        {ulids.map((id, i) => (
                            <div key={i} className="p-4 rounded-xl bg-muted/30 border border-border group relative flex items-center gap-4 hover:border-primary/30 transition-all">
                                <span className="text-xs font-bold text-muted-foreground min-w-[24px]">{i + 1}.</span>
                                <code className="font-mono text-sm sm:text-lg text-primary flex-1">{id}</code>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={() => {
                                        navigator.clipboard.writeText(id);
                                        toast({ title: 'ULID copied' });
                                    }}
                                >
                                    <Copy className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
