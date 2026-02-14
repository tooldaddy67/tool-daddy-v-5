'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock, Copy, FileText, ArrowLeftRight, UploadCloud } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

export default function Base64EncoderClient() {
    const [mode, setMode] = useState<'encode' | 'decode'>('encode');
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const { toast } = useToast();

    const processText = () => {
        if (!input) return;
        try {
            if (mode === 'encode') {
                setOutput(btoa(input));
            } else {
                setOutput(atob(input));
            }
        } catch (err) {
            toast({
                title: 'Error',
                description: 'Invalid input for ' + mode,
                variant: 'destructive'
            });
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
                    <Lock className="h-10 w-10 text-primary" />
                </div>
                <h1 className="text-4xl font-bold font-headline mb-2">Base64 Encoder / Decoder</h1>
                <p className="text-muted-foreground">Convert text and files to Base64 and back.</p>
            </div>

            <Card className="glass-panel border-primary/20">
                <CardHeader>
                    <Tabs defaultValue="text" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="text">Text String</TabsTrigger>
                            <TabsTrigger value="file" disabled>File (Coming Soon)</TabsTrigger>
                        </TabsList>
                    </Tabs>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex justify-center gap-4 mb-4">
                        <Button
                            variant={mode === 'encode' ? "default" : "outline"}
                            onClick={() => { setMode('encode'); setInput(''); setOutput(''); }}
                        >
                            Encode
                        </Button>
                        <Button
                            variant={mode === 'decode' ? "default" : "outline"}
                            onClick={() => { setMode('decode'); setInput(''); setOutput(''); }}
                        >
                            Decode
                        </Button>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Input {mode === 'encode' ? 'Text' : 'Base64'}</label>
                        <Textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder={mode === 'encode' ? "Type text to encode..." : "Paste Base64 to decode..."}
                            className="min-h-[150px] bg-background/50"
                        />
                    </div>

                    <Button className="w-full" onClick={processText}>
                        {mode === 'encode' ? 'Encode to Base64' : 'Decode from Base64'}
                    </Button>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-medium">Output</label>
                            <Button variant="ghost" size="sm" onClick={copyToClipboard} disabled={!output}>
                                <Copy className="w-4 h-4 mr-2" /> Copy
                            </Button>
                        </div>
                        <Textarea
                            readOnly
                            value={output}
                            className="min-h-[150px] bg-muted/20"
                        />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
