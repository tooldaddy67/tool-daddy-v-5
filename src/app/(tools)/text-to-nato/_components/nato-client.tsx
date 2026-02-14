'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Languages, Copy, Check, Trash2, Volume2, Info, MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const NATO_MAP: { [key: string]: string } = {
    'A': 'Alpha', 'B': 'Bravo', 'C': 'Charlie', 'D': 'Delta', 'E': 'Echo',
    'F': 'Foxtrot', 'G': 'Golf', 'H': 'Hotel', 'I': 'India', 'J': 'Juliett',
    'K': 'Kilo', 'L': 'Lima', 'M': 'Mike', 'N': 'November', 'O': 'Oscar',
    'P': 'Papa', 'Q': 'Quebec', 'R': 'Romeo', 'S': 'Sierra', 'T': 'Tango',
    'U': 'Uniform', 'V': 'Victor', 'W': 'Whiskey', 'X': 'X-ray', 'Y': 'Yankee', 'Z': 'Zulu',
    '0': 'Zero', '1': 'One', '2': 'Two', '3': 'Three', '4': 'Four',
    '5': 'Five', '6': 'Six', '7': 'Seven', '8': 'Eight', '9': 'Nine',
    ' ': '(space)', '.': 'Stop', ',': 'Decimal', '-': 'Dash', '/': 'Slash'
};

export default function NatoClient() {
    const [input, setInput] = useState('');
    const [output, setOutput] = useState<string[]>([]);
    const { toast } = useToast();
    const [isCopied, setIsCopied] = useState(false);

    useEffect(() => {
        if (!input) {
            setOutput([]);
            return;
        }

        const words = input.toUpperCase().split('');
        const phonetics = words.map(char => NATO_MAP[char] || char);
        setOutput(phonetics);
    }, [input]);

    const copyToClipboard = () => {
        if (output.length === 0) return;
        navigator.clipboard.writeText(output.join(' '));
        setIsCopied(true);
        toast({ title: 'NATO Alphabet copied' });
        setTimeout(() => setIsCopied(false), 2000);
    };

    const clear = () => {
        setInput('');
        setOutput([]);
    };

    return (
        <div className="container mx-auto py-10 px-4 max-w-4xl">
            <div className="flex flex-col items-center mb-10 text-center">
                <div className="p-4 rounded-2xl bg-primary/10 mb-4">
                    <MessageSquare className="h-10 w-10 text-primary" />
                </div>
                <h1 className="text-4xl font-bold font-headline mb-2">Text to NATO Phonetic</h1>
                <p className="text-muted-foreground">Convert text into the standard ICAO/NATO radiotelephony spelling alphabet.</p>
            </div>

            <div className="grid grid-cols-1 gap-8">
                <Card className="glass-panel border-primary/20">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <Label htmlFor="input-text" className="text-sm font-bold uppercase tracking-widest opacity-50">Input Text</Label>
                        <Button variant="ghost" size="sm" onClick={clear} disabled={!input}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <Textarea
                            id="input-text"
                            placeholder="Type a word, name, or phrase..."
                            className="min-h-[150px] text-lg font-bold bg-background/50 focus-visible:ring-primary/30"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                        />
                    </CardContent>
                </Card>

                <Card className="glass-panel bg-primary/5 border-primary/30">
                    <CardHeader className="flex flex-row items-center justify-between pb-4">
                        <CardTitle className="text-lg">NATO Phonetic Alphabet</CardTitle>
                        <Button variant="outline" size="sm" onClick={copyToClipboard} disabled={output.length === 0}>
                            {isCopied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                            Copy Result
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-2 min-h-[100px] p-6 rounded-2xl bg-background/80 border border-primary/10">
                            {output.length > 0 ? (
                                output.map((word, i) => (
                                    <div key={i} className={`px-3 py-1.5 rounded-lg text-sm font-black transition-all ${word.length > 1 && word !== '(space)' ? 'bg-primary/10 text-primary border border-primary/20' : 'bg-muted text-muted-foreground opacity-50'}`}>
                                        {word}
                                    </div>
                                ))
                            ) : (
                                <p className="text-muted-foreground italic text-sm opacity-30">Phonetic results will appear here...</p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="mt-12 p-8 rounded-3xl bg-muted/20 border border-border">
                <div className="flex items-center gap-3 mb-4">
                    <Info className="h-5 w-5 text-primary" />
                    <h3 className="font-bold">What is the NATO Phonetic Alphabet?</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                    The **International Radiotelephony Spelling Alphabet**, commonly known as the NATO phonetic alphabet,
                    is the most widely used spelling alphabet. It assigns 26 code words to the letters of the English alphabet
                    and is designed to ensure that letters and numbers are clearly understood by those who exchange voice
                    messages by radio or telephone, regardless of language barriers or the quality of the communication channel.
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8">
                    {['Alpha', 'Bravo', 'Charlie', 'Delta'].map(w => (
                        <div key={w} className="flex items-center gap-2 text-[10px] uppercase font-black opacity-30">
                            <span className="text-primary">{w[0]}</span>
                            <span>{w.slice(1)}</span>
                        </div>
                    ))}
                    <div className="col-span-full text-[10px] text-center opacity-20">...and 22 more</div>
                </div>
            </div>
        </div>
    );
}
