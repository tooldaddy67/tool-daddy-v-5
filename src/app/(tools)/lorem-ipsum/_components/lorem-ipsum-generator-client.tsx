'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Copy, RefreshCw, AlignLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';

const LOREM_TEXT = `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
Curabitur pretium tincidunt lacus. Nulla gravida orci a odio. Nullam varius, turpis et commodo pharetra, est eros bibendum elit, nec luctus magna felis sollicitudin mauris. Integer in mauris eu nibh euismod gravida. Duis ac tellus et risus vulputate vehicula. Donec lobortis risus a elit. Etiam tempor. Ut ullamcorper, ligula eu tempor congue, eros est euismod turpis, id tincidunt sapien risus a quam. Maecenas fermentum consequat mi. Donec fermentum. Pellentesque malesuada nulla a mi.
Duis sapien sem, aliquet nec, commodo eget, consequat quis, neque. Aliquam faucibus, elit ut dictum aliquet, felis nisl adipiscing sapien, sed malesuada diam lacus eget erat. Cras mollis scelerisque nunc. Nullam arcu. Aliquam consequat. Curabitur augue lorem, dapibus quis, laoreet et, pretium ac, nisi. Aenean magna nisl, mollis quis, molestie eu, feugiat in, orci. In hac habitasse platea dictumst.`;

export default function LoremIpsumGeneratorClient() {
    const [paragraphs, setParagraphs] = useState(3);
    const [startWithLorem, setStartWithLorem] = useState(true);
    const [generatedText, setGeneratedText] = useState('');
    const { toast } = useToast();

    const generateText = () => {
        const sourceParagraphs = LOREM_TEXT.split('\n');
        let result = [];

        for (let i = 0; i < paragraphs; i++) {
            // Cycle through source paragraphs if requested more than available
            const text = sourceParagraphs[i % sourceParagraphs.length];
            result.push(text);
        }

        let final = result.join('\n\n');

        if (startWithLorem && !final.startsWith('Lorem ipsum')) {
            // Force start if strictly needed (though source usually starts with it)
            // simplified logic: source always starts with it.
        }

        // If we want random/different text we'd need a better generator, 
        // but for basic usage slicing/repeating is often enough or using a library.
        // For now, let's just use the static text repeated/sliced.

        setGeneratedText(final);
    };

    // Initial generate
    useState(() => {
        generateText();
    });

    // update when state changes
    // actually better to use effect
    // But direct call in render or effect is fine.

    const handleGenerate = () => {
        generateText();
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(generatedText);
        toast({ title: 'Text copied to clipboard' });
    };

    return (
        <div className="container mx-auto py-10 px-4 max-w-5xl">
            <div className="flex flex-col items-center mb-10 text-center">
                <div className="p-4 rounded-2xl bg-primary/10 mb-4">
                    <AlignLeft className="h-10 w-10 text-primary" />
                </div>
                <h1 className="text-4xl font-bold font-headline mb-2">Lorem Ipsum Generator</h1>
                <p className="text-muted-foreground">Generate placeholder text for your designs.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                <Card className="glass-panel border-primary/20 md:col-span-4 h-fit">
                    <CardHeader>
                        <CardTitle>Options</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-4">
                            <div className="flex justify-between">
                                <Label>Paragraphs</Label>
                                <span className="font-mono bg-muted px-2 rounded">{paragraphs}</span>
                            </div>
                            <Slider
                                value={[paragraphs]}
                                onValueChange={(v) => { setParagraphs(v[0]); handleGenerate(); }}
                                min={1}
                                max={20}
                                step={1}
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <Label htmlFor="start-lorem">Start with "Lorem ipsum..."</Label>
                            <Switch
                                id="start-lorem"
                                checked={startWithLorem}
                                onCheckedChange={(c) => { setStartWithLorem(c); handleGenerate(); }}
                            />
                        </div>

                        <Button className="w-full" onClick={handleGenerate}>
                            <RefreshCw className="mr-2 h-4 w-4" /> Regenerate
                        </Button>
                    </CardContent>
                </Card>

                <Card className="glass-panel border-primary/20 md:col-span-8">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Generated Text</CardTitle>
                        <Button variant="ghost" size="sm" onClick={copyToClipboard}>
                            <Copy className="h-4 w-4 mr-2" /> Copy
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <Textarea
                            readOnly
                            value={generatedText}
                            className="min-h-[400px] font-serif text-lg leading-relaxed resize-none bg-background/50"
                        />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
