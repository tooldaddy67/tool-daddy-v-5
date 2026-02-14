'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Type, Copy, Check, Trash2, ArrowBigUp, ArrowBigDown, LetterText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function CaseConverterClient() {
    const [text, setText] = useState('');
    const { toast } = useToast();
    const [isCopied, setIsCopied] = useState(false);

    const convert = (type: string) => {
        if (!text.trim()) return;

        let result = text;
        switch (type) {
            case 'upper':
                result = text.toUpperCase();
                break;
            case 'lower':
                result = text.toLowerCase();
                break;
            case 'camel':
                result = text.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase());
                break;
            case 'pascal':
                result = text.toLowerCase().replace(/(?:^|[^a-zA-Z0-9]+)(.)/g, (m, chr) => chr.toUpperCase());
                break;
            case 'snake':
                result = text.match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)
                    ?.map(x => x.toLowerCase())
                    .join('_') || text;
                break;
            case 'kebab':
                result = text.match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)
                    ?.map(x => x.toLowerCase())
                    .join('-') || text;
                break;
            case 'title':
                result = text.toLowerCase().split(' ').map(s => s.charAt(0).toUpperCase() + s.substring(1)).join(' ');
                break;
            case 'sentence':
                result = text.toLowerCase().replace(/(^\s*\w|[\.\!\?]\s*\w)/g, c => c.toUpperCase());
                break;
            case 'constant':
                result = text.match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)
                    ?.map(x => x.toUpperCase())
                    .join('_') || text;
                break;
        }
        setText(result);
        toast({ title: `Converted to ${type.charAt(0).toUpperCase() + type.slice(1)}` });
    };

    const copyToClipboard = () => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        setIsCopied(true);
        toast({ title: 'Text copied to clipboard' });
        setTimeout(() => setIsCopied(false), 2000);
    };

    return (
        <div className="container mx-auto py-10 px-4 max-w-5xl">
            <div className="flex flex-col items-center mb-10 text-center">
                <div className="p-4 rounded-2xl bg-primary/10 mb-4">
                    <LetterText className="h-10 w-10 text-primary" />
                </div>
                <h1 className="text-4xl font-bold font-headline mb-2">Case Converter</h1>
                <p className="text-muted-foreground">Transform your text into multiple naming conventions and formats instantly.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                <Card className="md:col-span-8 glass-panel border-primary/20">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <Label htmlFor="text-input" className="text-sm font-bold uppercase tracking-widest opacity-50">
                            Your Text
                        </Label>
                        <div className="flex gap-2">
                            <Button variant="ghost" size="sm" onClick={copyToClipboard} disabled={!text}>
                                {isCopied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => setText('')} disabled={!text}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Textarea
                            id="text-input"
                            placeholder="Type or paste your text here..."
                            className="min-h-[400px] font-mono text-lg bg-background/50 resize-y focus-visible:ring-primary/30"
                            value={text}
                            maxLength={100000} // 100KB limit
                            onChange={(e) => setText(e.target.value)}
                        />
                    </CardContent>
                </Card>

                <div className="md:col-span-4 space-y-4">
                    <h3 className="text-sm font-bold uppercase tracking-widest opacity-50 pl-2">Transformations</h3>
                    <div className="grid grid-cols-2 md:grid-cols-1 gap-2">
                        <Button variant="outline" className="justify-start h-12 gap-3" onClick={() => convert('upper')}>
                            <ArrowBigUp className="h-4 w-4" /> UPPERCASE
                        </Button>
                        <Button variant="outline" className="justify-start h-12 gap-3" onClick={() => convert('lower')}>
                            <ArrowBigDown className="h-4 w-4" /> lowercase
                        </Button>
                        <Button variant="outline" className="justify-start h-12 gap-3" onClick={() => convert('camel')}>
                            <code className="text-[10px] bg-primary/10 p-1 rounded">cC</code> camelCase
                        </Button>
                        <Button variant="outline" className="justify-start h-12 gap-3" onClick={() => convert('pascal')}>
                            <code className="text-[10px] bg-primary/10 p-1 rounded">PC</code> PascalCase
                        </Button>
                        <Button variant="outline" className="justify-start h-12 gap-3" onClick={() => convert('snake')}>
                            <code className="text-[10px] bg-primary/10 p-1 rounded">s_c</code> snake_case
                        </Button>
                        <Button variant="outline" className="justify-start h-12 gap-3" onClick={() => convert('kebab')}>
                            <code className="text-[10px] bg-primary/10 p-1 rounded">k-c</code> kebab-case
                        </Button>
                        <Button variant="outline" className="justify-start h-12 gap-3" onClick={() => convert('constant')}>
                            <code className="text-[10px] bg-primary/10 p-1 rounded">C_S</code> CONSTANT_CASE
                        </Button>
                        <Button variant="outline" className="justify-start h-12 gap-3" onClick={() => convert('title')}>
                            <Type className="h-4 w-4" /> Title Case
                        </Button>
                        <Button variant="outline" className="justify-start h-12 gap-3" onClick={() => convert('sentence')}>
                            <Type className="h-4 w-4" /> Sentence case
                        </Button>
                    </div>

                    <Card className="glass-panel bg-primary/5 border-primary/20 mt-6">
                        <CardContent className="pt-6">
                            <h4 className="text-xs font-bold uppercase mb-2">Stats</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-3 rounded-lg bg-background/50 border border-border">
                                    <p className="text-[10px] opacity-50 uppercase font-black">Characters</p>
                                    <p className="text-xl font-black">{text.length}</p>
                                </div>
                                <div className="p-3 rounded-lg bg-background/50 border border-border">
                                    <p className="text-[10px] opacity-50 uppercase font-black">Words</p>
                                    <p className="text-xl font-black">{text.trim() ? text.trim().split(/\s+/).length : 0}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
