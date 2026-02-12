'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Calendar, Copy, Check, RefreshCw, Clock, Globe, ArrowRightLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format, formatISO, fromUnixTime, getUnixTime, parseISO } from 'date-fns';

export default function DateTimeConverter() {
    const [input, setInput] = useState(getUnixTime(new Date()).toString());
    const [result, setResult] = useState<any>(null);
    const { toast } = useToast();
    const [copiedField, setCopiedField] = useState<string | null>(null);

    const convert = () => {
        try {
            let date: Date;

            // Try Unix Timestamp (seconds or ms)
            if (/^\d+$/.test(input)) {
                let num = parseInt(input);
                // Guess if ms or seconds
                if (num > 100000000000) { // Likely MS
                    date = new Date(num);
                } else {
                    date = fromUnixTime(num);
                }
            } else {
                // Try ISO or string format
                date = new Date(input);
            }

            if (isNaN(date.getTime())) throw new Error('Invalid Date format');

            setResult({
                unix: getUnixTime(date).toString(),
                unixMs: date.getTime().toString(),
                iso: formatISO(date),
                utc: date.toUTCString(),
                local: format(date, 'PPPPpppp'),
                relative: new Intl.RelativeTimeFormat('en', { numeric: 'auto' }).format(
                    Math.floor((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
                    'day'
                )
            });

        } catch (error: any) {
            toast({
                title: 'Conversion Error',
                description: 'Please enter a valid Unix timestamp or ISO date string.',
                variant: 'destructive',
            });
        }
    };

    useEffect(() => {
        convert();
        const interval = setInterval(() => {
            // Keep "Relative" time somewhat fresh if they don't change input
            // But actually we only want to auto-refresh if they click a button
        }, 60000);
        return () => clearInterval(interval);
    }, []);

    const copyToClipboard = (text: string, field: string) => {
        navigator.clipboard.writeText(text);
        setCopiedField(field);
        toast({ title: 'Copied to clipboard' });
        setTimeout(() => setCopiedField(null), 2000);
    };

    const setToNow = () => {
        setInput(getUnixTime(new Date()).toString());
        convert();
    };

    return (
        <div className="container mx-auto py-10 px-4 max-w-4xl">
            <div className="flex flex-col items-center mb-10 text-center">
                <div className="p-4 rounded-2xl bg-primary/10 mb-4">
                    <Calendar className="h-10 w-10 text-primary" />
                </div>
                <h1 className="text-4xl font-bold font-headline mb-2">Date-Time Converter</h1>
                <p className="text-muted-foreground">Convert between Unix timestamps, ISO 8601, and human-readable date formats.</p>
            </div>

            <Card className="glass-panel mb-8 border-primary/20 bg-primary/5">
                <CardContent className="pt-6">
                    <div className="flex flex-col sm:flex-row gap-4 items-end">
                        <div className="flex-1 space-y-2">
                            <Label htmlFor="date-input">Unix Timestamp or Date String</Label>
                            <Input
                                id="date-input"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="1707740000 or 2024-02-12T10:00:00Z"
                                className="h-12 font-mono text-lg"
                            />
                        </div>
                        <div className="flex gap-2 w-full sm:w-auto">
                            <Button className="h-12 flex-1 sm:px-6 flex gap-2" onClick={convert}>
                                <ArrowRightLeft className="h-4 w-4" />
                                Convert
                            </Button>
                            <Button variant="outline" className="h-12 flex-1 sm:px-6 flex gap-2" onClick={setToNow}>
                                <Clock className="h-4 w-4" />
                                Now
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {result && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[
                        { label: 'Unix Timestamp (Seconds)', value: result.unix, field: 'unix', icon: Clock },
                        { label: 'Unix Timestamp (Milliseconds)', value: result.unixMs, field: 'unixMs', icon: Clock },
                        { label: 'ISO 8601', value: result.iso, field: 'iso', icon: Globe },
                        { label: 'UTC Format', value: result.utc, field: 'utc', icon: Globe },
                        { label: 'Local Time', value: result.local, field: 'local', icon: Calendar },
                        { label: 'Relative Time', value: result.relative, field: 'relative', icon: RefreshCw },
                    ].map((item) => (
                        <div key={item.label} className="p-5 rounded-2xl bg-muted/30 border border-border group relative transition-all hover:bg-muted/50 hover:border-primary/30">
                            <div className="flex items-center gap-2 mb-2">
                                <item.icon className="h-3 w-3 text-primary" />
                                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">{item.label}</span>
                            </div>
                            <p className="font-mono text-base break-all font-semibold">{item.value}</p>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => copyToClipboard(item.value, item.field)}
                            >
                                {copiedField === item.field ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                            </Button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
