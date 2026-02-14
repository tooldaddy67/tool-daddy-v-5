'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Plus, RefreshCw, Copy, Check, ShieldCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function MacGeneratorClient() {
    const [mac, setMac] = useState<string>('');
    const [format, setFormat] = useState('colon');
    const [caseType, setCaseType] = useState('upper');
    const { toast } = useToast();
    const [isCopied, setIsCopied] = useState(false);

    const generate = () => {
        const hex = '0123456789ABCDEF';
        let res = '';
        for (let i = 0; i < 6; i++) {
            let byte = hex[Math.floor(Math.random() * 16)] + hex[Math.floor(Math.random() * 16)];
            if (i === 0) {
                const firstByteValue = parseInt(byte, 16) & 0xFE | 0x02;
                byte = firstByteValue.toString(16).padStart(2, '0').toUpperCase();
            }
            res += byte;
        }

        if (caseType === 'lower') res = res.toLowerCase();

        let formatted = '';
        if (format === 'colon') {
            formatted = res.match(/.{2}/g)?.join(':') || res;
        } else if (format === 'dash') {
            formatted = res.match(/.{2}/g)?.join('-') || res;
        } else if (format === 'dot') {
            formatted = res.match(/.{4}/g)?.join('.') || res;
        } else {
            formatted = res;
        }

        setMac(formatted);
    };

    useState(() => {
        generate();
    });

    const copy = () => {
        navigator.clipboard.writeText(mac);
        setIsCopied(true);
        toast({ title: 'MAC Address copied' });
        setTimeout(() => setIsCopied(false), 2000);
    };

    return (
        <div className="container mx-auto py-10 px-4 max-w-4xl">
            <div className="flex flex-col items-center mb-10 text-center">
                <div className="p-4 rounded-2xl bg-primary/10 mb-4">
                    <Plus className="h-10 w-10 text-primary" />
                </div>
                <h1 className="text-4xl font-bold font-headline mb-2">MAC Address Generator</h1>
                <p className="text-muted-foreground">Generate random, valid MAC addresses with customizable formats and cases.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card className="glass-panel">
                    <CardHeader>
                        <CardTitle className="text-lg">Customization</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-3">
                            <Label>Separator Format</Label>
                            <RadioGroup value={format} onValueChange={setFormat} className="grid grid-cols-2 gap-2">
                                <div className="flex items-center space-x-2 border rounded-md p-2 hover:bg-muted/50 transition-colors">
                                    <RadioGroupItem value="colon" id="colon" />
                                    <Label htmlFor="colon">: (Colon)</Label>
                                </div>
                                <div className="flex items-center space-x-2 border rounded-md p-2 hover:bg-muted/50 transition-colors">
                                    <RadioGroupItem value="dash" id="dash" />
                                    <Label htmlFor="dash">- (Dash)</Label>
                                </div>
                                <div className="flex items-center space-x-2 border rounded-md p-2 hover:bg-muted/50 transition-colors">
                                    <RadioGroupItem value="dot" id="dot" />
                                    <Label htmlFor="dot">. (Dot)</Label>
                                </div>
                                <div className="flex items-center space-x-2 border rounded-md p-2 hover:bg-muted/50 transition-colors">
                                    <RadioGroupItem value="none" id="none" />
                                    <Label htmlFor="none">None</Label>
                                </div>
                            </RadioGroup>
                        </div>

                        <div className="space-y-3">
                            <Label>Letter Case</Label>
                            <RadioGroup value={caseType} onValueChange={setCaseType} className="grid grid-cols-2 gap-2">
                                <div className="flex items-center space-x-2 border rounded-md p-2 hover:bg-muted/50 transition-colors">
                                    <RadioGroupItem value="upper" id="upper" />
                                    <Label htmlFor="upper">UPPERCASE</Label>
                                </div>
                                <div className="flex items-center space-x-2 border rounded-md p-2 hover:bg-muted/50 transition-colors">
                                    <RadioGroupItem value="lower" id="lower" />
                                    <Label htmlFor="lower">lowercase</Label>
                                </div>
                            </RadioGroup>
                        </div>

                        <Button className="w-full h-12 text-lg font-bold glow-button" onClick={generate}>
                            <RefreshCw className="mr-2 h-5 w-5" />
                            Generate New
                        </Button>
                    </CardContent>
                </Card>

                <div className="space-y-6">
                    <Card className="glass-panel border-primary/20 bg-primary/5 h-full flex flex-col justify-center">
                        <CardContent className="pt-6 text-center">
                            <p className="text-xs text-muted-foreground uppercase font-bold tracking-widest mb-4">Generated Result</p>
                            <div className="flex flex-col items-center gap-6">
                                <div className="px-6 py-4 rounded-2xl bg-background/80 border-2 border-primary/30 shadow-2xl">
                                    <p className="font-mono text-3xl sm:text-4xl text-primary font-bold tracking-tighter shadow-primary/20 transition-all">
                                        {mac}
                                    </p>
                                </div>
                                <Button size="lg" className="w-full max-w-xs h-14 text-lg" onClick={copy}>
                                    {isCopied ? <Check className="mr-2 h-5 w-5" /> : <Copy className="mr-2 h-5 w-5" />}
                                    {isCopied ? 'Copied to Clipboard' : 'Copy MAC Address'}
                                </Button>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <ShieldCheck className="h-4 w-4 text-green-500" />
                                    Locally Administered Unicast Address
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
