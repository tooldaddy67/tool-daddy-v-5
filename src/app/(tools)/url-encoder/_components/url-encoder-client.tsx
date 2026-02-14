'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link as LinkIcon, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';

export default function UrlEncoderClient() {
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const { toast } = useToast();

    const encode = () => {
        try {
            setOutput(encodeURIComponent(input));
        } catch (e) {
            toast({ title: 'Error encoding', variant: 'destructive' });
        }
    };

    const decode = () => {
        try {
            setOutput(decodeURIComponent(input));
        } catch (e) {
            toast({ title: 'Error decoding', description: 'Invalid URL sequence', variant: 'destructive' });
        }
    };

    const copyToClipboard = () => {
        if (!output) return;
        navigator.clipboard.writeText(output);
        toast({ title: 'Copied to clipboard' });
    };

    return (
        <div className="container mx-auto py-10 px-4 max-w-4xl">
            <div className="flex flex-col items-center mb-10 text-center">
                <div className="p-4 rounded-2xl bg-primary/10 mb-4">
                    <LinkIcon className="h-10 w-10 text-primary" />
                </div>
                <h1 className="text-4xl font-bold font-headline mb-2">URL Encoder / Decoder</h1>
                <p className="text-muted-foreground">Encode and decode URLs to handle special characters.</p>
            </div>

            <Card className="glass-panel border-primary/20">
                <CardContent className="space-y-6 pt-6">
                    <Textarea
                        placeholder="Enter text or URL here..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        className="min-h-[150px] bg-background/50"
                    />

                    <div className="flex gap-4">
                        <Button className="flex-1" onClick={encode}>Encode</Button>
                        <Button className="flex-1" variant="secondary" onClick={decode}>Decode</Button>
                    </div>

                    <div className="relative">
                        <Textarea
                            readOnly
                            value={output}
                            placeholder="Result will appear here..."
                            className="min-h-[150px] bg-muted/20"
                        />
                        <Button
                            variant="ghost"
                            size="sm"
                            className="absolute top-2 right-2"
                            onClick={copyToClipboard}
                            disabled={!output}
                        >
                            <Copy className="h-4 w-4" />
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
