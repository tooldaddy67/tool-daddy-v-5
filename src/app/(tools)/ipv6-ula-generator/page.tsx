'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Factory, RefreshCw, Copy, Check, Info, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function Ipv6UlaGenerator() {
    const [ula, setUla] = useState<string>('');
    const { toast } = useToast();
    const [isCopied, setIsCopied] = useState(false);

    const generate = () => {
        // ULAs are fd00::/8. The next 40 bits must be random.
        // Format: fdXX:XXXX:XXXX::/48
        const hex = '0123456789abcdef';
        let randomBits = '';
        for (let i = 0; i < 10; i++) {
            randomBits += hex[Math.floor(Math.random() * 16)];
        }

        // Group into blocks of 4
        const parts = randomBits.match(/.{4}/g) || [];
        // First block starts with fd followed by 2 random hex
        const prefix = 'fd' + randomBits.substring(0, 2);
        const secondBlock = randomBits.substring(2, 6);
        const thirdBlock = randomBits.substring(6, 10);

        setUla(`${prefix}:${secondBlock}:${thirdBlock}::/48`);
    };

    useState(() => {
        generate();
    });

    const copy = () => {
        navigator.clipboard.writeText(ula);
        setIsCopied(true);
        toast({ title: 'IPv6 ULA copied' });
        setTimeout(() => setIsCopied(false), 2000);
    };

    return (
        <div className="container mx-auto py-10 px-4 max-w-4xl">
            <div className="flex flex-col items-center mb-10 text-center">
                <div className="p-4 rounded-2xl bg-primary/10 mb-4">
                    <Factory className="h-10 w-10 text-primary" />
                </div>
                <h1 className="text-4xl font-bold font-headline mb-2">IPv6 ULA Generator</h1>
                <p className="text-muted-foreground">Generate RFC 4193 compliant Unique Local Addresses for your private networks.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card className="glass-panel h-full">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Info className="h-5 w-5 text-primary" />
                            About ULA
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="prose prose-sm prose-invert text-muted-foreground">
                        <p>
                            Unique Local Addresses (ULA) are the IPv6 equivalent of private IPv4 addresses (like 192.168.x.x).
                        </p>
                        <ul className="space-y-2 list-disc pl-4">
                            <li>Defined in **RFC 4193**.</li>
                            <li>Prefix is always **fd00::/8**.</li>
                            <li>The next 40 bits are random to prevent collisions during network merges.</li>
                            <li>Typically used as a **/48** prefix for internal infrastructure.</li>
                        </ul>
                        <div className="mt-6 p-4 rounded-lg bg-background/50 border border-border flex items-start gap-3">
                            <Shield className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                            <p className="text-xs leading-relaxed">
                                These addresses are only routable within your private network and should never be seen on the public internet.
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <div className="space-y-6">
                    <Card className="glass-panel border-primary/20 bg-primary/5 h-full flex flex-col justify-center">
                        <CardContent className="pt-6 text-center">
                            <p className="text-xs text-muted-foreground uppercase font-bold tracking-widest mb-4">Generated Prefix</p>
                            <div className="flex flex-col items-center gap-6">
                                <div className="px-6 py-8 rounded-2xl bg-background/80 border-2 border-primary/30 shadow-2xl w-full">
                                    <p className="font-mono text-xl sm:text-2xl text-primary font-bold tracking-tight text-center break-all">
                                        {ula}
                                    </p>
                                </div>
                                <Button size="lg" className="w-full h-14 text-lg font-bold glow-button" onClick={generate}>
                                    <RefreshCw className="mr-2 h-5 w-5" />
                                    Regenerate
                                </Button>
                                <Button variant="outline" size="lg" className="w-full h-12" onClick={copy}>
                                    {isCopied ? <Check className="mr-2 h-5 w-5 text-green-500" /> : <Copy className="mr-2 h-5 w-5" />}
                                    {isCopied ? 'Copied' : 'Copy Prefix'}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
