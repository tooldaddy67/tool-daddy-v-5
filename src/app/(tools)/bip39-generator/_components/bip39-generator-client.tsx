'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlignLeft, Copy, Check, RefreshCw, ShieldCheck, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import * as bip39 from 'bip39';

export default function Bip39GeneratorClient() {
    const [wordCount, setWordCount] = useState('12');
    const [mnemonic, setMnemonic] = useState('');
    const [words, setWords] = useState<string[]>([]);
    const { toast } = useToast();
    const [isCopied, setIsCopied] = useState(false);

    const generateMnemonic = () => {
        const entropyBits = wordCount === '12' ? 128 : 256;
        const newMnemonic = bip39.generateMnemonic(entropyBits);
        setMnemonic(newMnemonic);
        setWords(newMnemonic.split(' '));
    };

    useEffect(() => {
        generateMnemonic();
    }, []);

    const copyToClipboard = () => {
        if (!mnemonic) return;
        navigator.clipboard.writeText(mnemonic);
        setIsCopied(true);
        toast({ title: 'Mnemonic phrase copied' });
        setTimeout(() => setIsCopied(false), 2000);
    };

    return (
        <div className="container mx-auto py-10 px-4 max-w-4xl">
            <div className="flex flex-col items-center mb-10 text-center">
                <div className="p-4 rounded-2xl bg-primary/10 mb-4">
                    <AlignLeft className="h-10 w-10 text-primary" />
                </div>
                <h1 className="text-4xl font-bold font-headline mb-2">BIP39 Passphrase Generator</h1>
                <p className="text-muted-foreground">Generate cryptographically secure mnemonic seed phrases for crypto wallets and backups.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <Card className="md:col-span-1 glass-panel">
                    <CardHeader>
                        <CardTitle className="text-lg">Generation Settings</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Label>Number of Words</Label>
                            <Select value={wordCount} onValueChange={setWordCount}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="12">12 Words (128-bit)</SelectItem>
                                    <SelectItem value="24">24 Words (256-bit)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <Button className="w-full h-12 text-lg font-bold glow-button" onClick={generateMnemonic}>
                            <RefreshCw className="mr-2 h-5 w-5" />
                            New Phrase
                        </Button>

                        <div className="pt-4 border-t border-border">
                            <div className="flex items-start gap-2 p-3 rounded-lg bg-orange-500/10 text-orange-400 border border-orange-500/20">
                                <AlertTriangle className="h-4 w-4 shrink-0 mt-1" />
                                <p className="text-[10px] leading-relaxed">
                                    **SECURITY NOTICE:** Never share your seed phrase with anyone. Anyone who has these words has full control over your assets.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="md:col-span-2 glass-panel border-primary/20 bg-primary/5 flex flex-col">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <ShieldCheck className="h-5 w-5 text-primary" />
                                Secure Seed Phrase
                            </CardTitle>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={copyToClipboard}
                            disabled={!mnemonic}
                        >
                            {isCopied ? <Check className="h-4 w-4 mr-2 text-green-500" /> : <Copy className="h-4 w-4 mr-2" />}
                            {isCopied ? 'Copied' : 'Copy All'}
                        </Button>
                    </CardHeader>
                    <CardContent className="flex-1">
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {words.map((word, i) => (
                                <div key={i} className="flex items-center gap-2 p-3 rounded-lg bg-background/80 border border-border group hover:border-primary/50 transition-all">
                                    <span className="text-[10px] font-bold text-muted-foreground w-4">{i + 1}.</span>
                                    <span className="font-mono text-sm sm:text-lg font-bold text-foreground">{word}</span>
                                </div>
                            ))}
                        </div>

                        <div className="mt-8 p-4 rounded-xl bg-background/50 border border-border font-mono text-xs text-muted-foreground break-all text-center">
                            {mnemonic}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
