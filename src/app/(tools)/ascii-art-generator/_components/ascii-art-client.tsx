'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Terminal, Copy, Check, Trash2, Type, Box } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Simple hand-rolled ASCII fonts for the demonstration
const ASCII_FONTS: Record<string, Record<string, string[]>> = {
    'Block': {
        'A': ['  ███  ', ' ██ ██ ', '██   ██', '███████', '██   ██'],
        'B': ['██████ ', '██   ██', '██████ ', '██   ██', '██████ '],
        'C': [' █████ ', '██     ', '██     ', '██     ', ' █████ '],
        'D': ['██████ ', '██   ██', '██   ██', '██   ██', '██████ '],
        'E': ['███████', '██     ', '█████  ', '██     ', '███████'],
        'F': ['███████', '██     ', '█████  ', '██     ', '██     '],
        'G': [' █████ ', '██     ', '██  ███', '██   ██', ' █████ '],
        'H': ['██   ██', '██   ██', '███████', '██   ██', '██   ██'],
        'I': ['███████', '  ██   ', '  ██   ', '  ██   ', '███████'],
        'J': [' ██████', '     ██', '     ██', '██   ██', ' █████ '],
        'K': ['██  ██ ', '██ ██  ', '████   ', '██ ██  ', '██  ██ '],
        'L': ['██     ', '██     ', '██     ', '██     ', '███████'],
        'M': ['██   ██', '███ ███', '██ █ ██', '██   ██', '██   ██'],
        'N': ['██   ██', '████  ██', '██ ██ ██', '██  ████', '██   ██'],
        'O': [' █████ ', '██   ██', '██   ██', '██   ██', ' █████ '],
        'P': ['██████ ', '██   ██', '██████ ', '██     ', '██     '],
        'Q': [' █████ ', '██   ██', '██   ██', '██  ██ ', ' ████ ██'],
        'R': ['██████ ', '██   ██', '██████ ', '██   ██', '██   ██'],
        'S': [' █████ ', '██     ', ' █████ ', '     ██', ' █████ '],
        'T': ['███████', '  ██   ', '  ██   ', '  ██   ', '  ██   '],
        'U': ['██   ██', '██   ██', '██   ██', '██   ██', ' █████ '],
        'V': ['██   ██', '██   ██', ' ██ ██ ', ' ██ ██ ', '  ███  '],
        'W': ['██   ██', '██   ██', '██ █ ██', '███ ███', '██   ██'],
        'X': ['██   ██', ' ██ ██ ', '  ███  ', ' ██ ██ ', '██   ██'],
        'Y': ['██   ██', ' ██ ██ ', '  ███  ', '  ██   ', '  ██   '],
        'Z': ['███████', '   ██  ', '  ██   ', ' ██    ', '███████'],
        ' ': ['       ', '       ', '       ', '       ', '       '],
    }
};

export default function AsciiArtClient() {
    const [input, setInput] = useState('DA D D Y');
    const [font, setFont] = useState('Block');
    const [output, setOutput] = useState('');
    const { toast } = useToast();
    const [isCopied, setIsCopied] = useState(false);

    const generateArt = (text: string, fontName: string) => {
        if (!text) return '';
        const selectedFont = ASCII_FONTS[fontName] || ASCII_FONTS['Block'];
        const lines = ['', '', '', '', ''];

        text.toUpperCase().split('').forEach(char => {
            const artLines = selectedFont[char] || selectedFont[' '];
            artLines.forEach((line, i) => {
                lines[i] += line + '  ';
            });
        });

        return lines.join('\n');
    };

    useEffect(() => {
        setOutput(generateArt(input, font));
    }, [input, font]);

    const copyToClipboard = () => {
        if (!output) return;
        navigator.clipboard.writeText(output);
        setIsCopied(true);
        toast({ title: 'ASCII Art copied' });
        setTimeout(() => setIsCopied(false), 2000);
    };

    return (
        <div className="container mx-auto py-10 px-4 max-w-4xl">
            <div className="flex flex-col items-center mb-10 text-center">
                <div className="p-4 rounded-2xl bg-primary/10 mb-4">
                    <Terminal className="h-10 w-10 text-primary" />
                </div>
                <h1 className="text-4xl font-bold font-headline mb-2">ASCII Art Generator</h1>
                <p className="text-muted-foreground">Turn your text into stylized ASCII banners for your terminal or code.</p>
            </div>

            <div className="grid grid-cols-1 gap-8">
                <Card className="glass-panel border-primary/20">
                    <CardHeader className="flex flex-row items-baseline justify-between pb-6">
                        <div className="space-y-1">
                            <CardTitle className="text-lg">Design Settings</CardTitle>
                            <CardDescription>Enter text and choose font</CardDescription>
                        </div>
                        <div className="flex items-center gap-4">
                            <Select value={font} onValueChange={setFont}>
                                <SelectTrigger className="w-[140px]">
                                    <SelectValue placeholder="Select font" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Block">Block</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <Label>Your Text</Label>
                            <Input
                                placeholder="TYPE SOMETHING..."
                                className="h-14 text-xl font-bold uppercase tracking-widest"
                                value={input}
                                maxLength={10}
                                onChange={(e) => setInput(e.target.value)}
                            />
                            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter italic">
                                Note: Limited to 10 characters for display width.
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="glass-panel bg-[#09090b] border-primary/30 overflow-hidden group">
                    <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-white/5">
                        <div className="flex items-center gap-2">
                            <div className="flex gap-1.5 mr-2">
                                <div className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
                                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50" />
                                <div className="w-2.5 h-2.5 rounded-full bg-green-500/50" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Terminal Preview</span>
                        </div>
                        <Button variant="ghost" size="sm" onClick={copyToClipboard} className="text-white hover:bg-white/10" disabled={!output}>
                            {isCopied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                            Copy ASCII
                        </Button>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="p-8 overflow-x-auto scrollbar-hide">
                            <pre className="font-mono text-xs text-primary leading-tight whitespace-pre inline-block">
                                {output || 'Type something to see art...'}
                            </pre>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
