'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeftRight, Copy, FileJson, FileType } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import yaml from 'js-yaml';
import { cn } from '@/lib/utils';

export default function YamlJsonConverterClient() {
    const [jsonInput, setJsonInput] = useState('');
    const [yamlInput, setYamlInput] = useState('');
    const [error, setError] = useState<string | null>(null);
    const { toast } = useToast();

    const handleJsonChange = (value: string) => {
        setJsonInput(value);
        setError(null);
        if (!value.trim()) {
            setYamlInput('');
            return;
        }
        try {
            const parsed = JSON.parse(value);
            const dumped = yaml.dump(parsed);
            setYamlInput(dumped);
        } catch (err) {
            // Don't update YAML on partial JSON error, just ignore or show mild warning
            // setError((err as Error).message);
        }
    };

    const handleYamlChange = (value: string) => {
        setYamlInput(value);
        setError(null);
        if (!value.trim()) {
            setJsonInput('');
            return;
        }
        try {
            const parsed = yaml.load(value);
            setJsonInput(JSON.stringify(parsed, null, 2));
        } catch (err) {
            // Don't update JSON on partial YAML error
            // setError((err as Error).message);
        }
    };

    const convertJsonToYaml = () => {
        try {
            const parsed = JSON.parse(jsonInput);
            const dumped = yaml.dump(parsed);
            setYamlInput(dumped);
            setError(null);
            toast({ title: 'Converted JSON to YAML' });
        } catch (err) {
            setError('Invalid JSON: ' + (err as Error).message);
            toast({ title: 'Conversion Failed', description: (err as Error).message, variant: 'destructive' });
        }
    };

    const convertYamlToJson = () => {
        try {
            const parsed = yaml.load(yamlInput);
            setJsonInput(JSON.stringify(parsed, null, 2));
            setError(null);
            toast({ title: 'Converted YAML to JSON' });
        } catch (err) {
            setError('Invalid YAML: ' + (err as Error).message);
            toast({ title: 'Conversion Failed', description: (err as Error).message, variant: 'destructive' });
        }
    };

    const copyToClipboard = (text: string, type: string) => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        toast({ title: `${type} copied to clipboard` });
    };

    return (
        <div className="container mx-auto py-10 px-4 max-w-7xl">
            <div className="flex flex-col items-center mb-10 text-center">
                <div className="p-4 rounded-2xl bg-primary/10 mb-4">
                    <ArrowLeftRight className="h-10 w-10 text-primary" />
                </div>
                <h1 className="text-4xl font-bold font-headline mb-2">YAML ↔ JSON Converter</h1>
                <p className="text-muted-foreground">Convert between YAML and JSON formats instantly.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* JSON Section */}
                <Card className="glass-panel border-primary/20 flex flex-col h-[600px]">
                    <CardHeader className="flex flex-row items-center justify-between pb-4">
                        <div className="flex items-center gap-2">
                            <FileJson className="w-5 h-5 text-primary" />
                            <CardTitle className="text-lg font-medium">JSON</CardTitle>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => copyToClipboard(jsonInput, 'JSON')}>
                            <Copy className="w-4 h-4" />
                        </Button>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col min-h-0">
                        <Textarea
                            placeholder='{"key": "value"}'
                            className="flex-1 font-mono text-sm resize-none bg-background/50"
                            value={jsonInput}
                            onChange={(e) => handleJsonChange(e.target.value)}
                            spellCheck={false}
                        />
                        <Button className="mt-4 w-full" onClick={convertJsonToYaml} variant="secondary">
                            Convert to YAML <ArrowLeftRight className="ml-2 w-4 h-4" />
                        </Button>
                    </CardContent>
                </Card>

                {/* YAML Section */}
                <Card className="glass-panel border-primary/20 flex flex-col h-[600px]">
                    <CardHeader className="flex flex-row items-center justify-between pb-4">
                        <div className="flex items-center gap-2">
                            <FileType className="w-5 h-5 text-primary" />
                            <CardTitle className="text-lg font-medium">YAML</CardTitle>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => copyToClipboard(yamlInput, 'YAML')}>
                            <Copy className="w-4 h-4" />
                        </Button>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col min-h-0">
                        <Textarea
                            placeholder="key: value"
                            className="flex-1 font-mono text-sm resize-none bg-background/50"
                            value={yamlInput}
                            onChange={(e) => handleYamlChange(e.target.value)}
                            spellCheck={false}
                        />
                        <Button className="mt-4 w-full" onClick={convertYamlToJson} variant="secondary">
                            Convert to JSON <ArrowLeftRight className="ml-2 w-4 h-4" />
                        </Button>
                    </CardContent>
                </Card>
            </div>
            {error && (
                <div className="mt-6 p-4 bg-destructive/10 text-destructive text-center rounded-lg border border-destructive/20">
                    {error}
                </div>
            )}
        </div>
    );
}
