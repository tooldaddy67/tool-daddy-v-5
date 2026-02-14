'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Binary, Copy, Check, Trash2, Hash, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function NumeronymClient() {
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const { toast } = useToast();
    const [isCopied, setIsCopied] = useState(false);

    const generateNumeronym = (text: string): string => {
        if (!text) return '';

        return text.split(/\s+/).map(word => {
            // Remove punctuation for length check but keep it in result? 
            // Standard numeronyms are usually for single words.
            const clean = word.replace(/[^a-zA-Z]/g, '');
            if (clean.length < 3) return word;

            const firstChar = clean[0];
            const lastChar = clean[clean.length - 1];
            const middleLength = clean.length - 2;

            return `${firstChar}${middleLength}${lastChar}${word.replace(clean, '')}`;
        }).join(' ');
    };

    useEffect(() => {
        setOutput(generateNumeronym(input));
    }, [input]);

    const copyToClipboard = () => {
        if (!output) return;
        navigator.clipboard.writeText(output);
        setIsCopied(true);
        toast({ title: 'Numeronym copied' });
        setTimeout(() => setIsCopied(false), 2000);
    };

    return (
        <div className="container mx-auto py-10 px-4 max-w-4xl">
            <div className="flex flex-col items-center mb-10 text-center">
                <div className="p-4 rounded-2xl bg-primary/10 mb-4">
                    <Hash className="h-10 w-10 text-primary" />
                </div>
                <h1 className="text-4xl font-bold font-headline mb-2">Numeronym Generator</h1>
                <p className="text-muted-foreground">Shorten words by replacing middle letters with their count.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                <Card className="glass-panel border-primary/20">
                    <CardHeader>
                        <CardTitle className="text-lg">Input Word</CardTitle>
                        <CardDescription>Enter words like &quot;Internationalization&quot;</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="num-input">Word or Phrase</Label>
                            <Input
                                id="num-input"
                                placeholder="e.g. Accessibility"
                                className="h-14 text-xl font-bold"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                            />
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => setInput('')} disabled={!input} className="w-full border border-dashed border-border">
                            <Trash2 className="h-4 w-4 mr-2" /> Clear
                        </Button>
                    </CardContent>
                </Card>

                <Card className="glass-panel bg-primary/5 border-primary/30 h-full">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center justify-between">
                            <span>Result</span>
                            <Button variant="ghost" size="icon" onClick={copyToClipboard} disabled={!output}>
                                {isCopied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                            </Button>
                        </CardTitle>
                        <CardDescription>Generated Numeronym(s)</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center justify-center pt-6">
                        <div className="w-full p-8 rounded-2xl bg-background/80 border-2 border-primary/20 text-center min-h-[120px] flex items-center justify-center">
                            <p className="font-mono text-4xl font-black text-primary tracking-wider">
                                {output || '---'}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="mt-12 p-8 rounded-3xl bg-muted/20 border border-border">
                <div className="flex items-center gap-3 mb-4">
                    <Info className="h-5 w-5 text-primary" />
                    <h3 className="font-bold">What is a Numeronym?</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                    A **numeronym** is a number-based word. Generally, a numeronym is a word where a number is used to form an abbreviation.
                    For example, &quot;i18n&quot; is a numeronym for &quot;internationalization&quot; (the letter &quot;i&quot; followed by 18 letters, then &quot;n&quot;).
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8">
                    {[
                        { w: 'Accessibility', n: 'a11y' },
                        { w: 'Localization', n: 'l10n' },
                        { w: 'Kubernetes', n: 'k8s' },
                        { w: 'Personalization', n: 'p15n' }
                    ].map(item => (
                        <div key={item.n} className="p-4 rounded-xl bg-background border border-border text-center">
                            <p className="text-[10px] text-muted-foreground font-bold uppercase truncate">{item.w}</p>
                            <p className="font-black text-primary">{item.n}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
