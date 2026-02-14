'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileJson, Copy, Check, Trash2, Braces, Minimize2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

export default function JsonFormatterClient() {
    const [input, setInput] = useState('');
    const [error, setError] = useState<string | null>(null);
    const { toast } = useToast();
    const [isCopied, setIsCopied] = useState(false);

    const formatJson = () => {
        if (!input.trim()) return;
        try {
            const parsed = JSON.parse(input);
            setInput(JSON.stringify(parsed, null, 2));
            setError(null);
            toast({ title: 'JSON Formatted Successfully' });
        } catch (err) {
            setError((err as Error).message);
            toast({
                title: 'Invalid JSON',
                description: (err as Error).message,
                variant: 'destructive'
            });
        }
    };

    const minifyJson = () => {
        if (!input.trim()) return;
        try {
            const parsed = JSON.parse(input);
            setInput(JSON.stringify(parsed));
            setError(null);
            toast({ title: 'JSON Minified Successfully' });
        } catch (err) {
            setError((err as Error).message);
            toast({
                title: 'Invalid JSON',
                description: (err as Error).message,
                variant: 'destructive'
            });
        }
    };

    const clearInput = () => {
        setInput('');
        setError(null);
    };

    const copyToClipboard = () => {
        if (!input) return;
        navigator.clipboard.writeText(input);
        setIsCopied(true);
        toast({ title: 'Copied to clipboard' });
        setTimeout(() => setIsCopied(false), 2000);
    };

    return (
        <div className="container mx-auto py-10 px-4 max-w-7xl">
            <div className="flex flex-col items-center mb-10 text-center">
                <div className="p-4 rounded-2xl bg-primary/10 mb-4">
                    <FileJson className="h-10 w-10 text-primary" />
                </div>
                <h1 className="text-4xl font-bold font-headline mb-2">JSON Formatter & Validator</h1>
                <p className="text-muted-foreground">Format, validate, and beautify your JSON data.</p>
            </div>

            <Card className="glass-panel border-primary/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                    <CardTitle className="text-lg font-medium">JSON Input / Output</CardTitle>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={formatJson} disabled={!input}>
                            <Braces className="w-4 h-4 mr-2" />
                            Format
                        </Button>
                        <Button variant="outline" size="sm" onClick={minifyJson} disabled={!input}>
                            <Minimize2 className="w-4 h-4 mr-2" />
                            Minify
                        </Button>
                        <Button variant="outline" size="sm" onClick={copyToClipboard} disabled={!input}>
                            {isCopied ? <Check className="w-4 h-4 mr-2 text-green-500" /> : <Copy className="w-4 h-4 mr-2" />}
                            Copy
                        </Button>
                        <Button variant="ghost" size="sm" onClick={clearInput} disabled={!input}>
                            <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="relative">
                        <Textarea
                            placeholder="Paste your JSON here..."
                            className={cn(
                                "min-h-[500px] font-mono text-sm resize-y bg-background/50",
                                error && "border-destructive focus-visible:ring-destructive"
                            )}
                            value={input}
                            maxLength={1000000}
                            onChange={(e) => setInput(e.target.value)}
                            spellCheck={false}
                        />
                        {error && (
                            <div className="absolute bottom-4 left-4 right-4 p-3 bg-destructie/10 text-destructive text-sm rounded-md border border-destructive/20 bg-background/90 backdrop-blur-sm">
                                Error: {error}
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            <div className="mt-8 text-center text-sm text-muted-foreground">
                <p>All processing happens in your browser. Your data is never sent to our servers.</p>
            </div>
        </div>
    );
}
