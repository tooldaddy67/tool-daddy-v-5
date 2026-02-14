'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileJson, ChevronRight, ChevronDown, Copy, Check, Trash2, Network } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function JsonTreeViewerClient() {
    const [input, setInput] = useState('');
    const [parsedJson, setParsedJson] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const { toast } = useToast();

    const parseJson = () => {
        if (!input.trim()) {
            setParsedJson(null);
            return;
        }
        try {
            const parsed = JSON.parse(input);
            setParsedJson(parsed);
            setError(null);
        } catch (err) {
            setParsedJson(null);
            setError((err as Error).message);
        }
    };

    const clearInput = () => {
        setInput('');
        setParsedJson(null);
        setError(null);
    };

    return (
        <div className="container mx-auto py-10 px-4 max-w-7xl">
            <div className="flex flex-col items-center mb-10 text-center">
                <div className="p-4 rounded-2xl bg-primary/10 mb-4">
                    <Network className="h-10 w-10 text-primary" />
                </div>
                <h1 className="text-4xl font-bold font-headline mb-2">JSON Tree Viewer</h1>
                <p className="text-muted-foreground">Visualize your JSON data in an interactive, collapsible tree format.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Input Section */}
                <Card className="glass-panel border-primary/20 flex flex-col h-[600px]">
                    <CardHeader className="flex flex-row items-center justify-between pb-4">
                        <CardTitle className="text-lg font-medium">JSON Input</CardTitle>
                        <Button variant="ghost" size="sm" onClick={clearInput} disabled={!input}>
                            <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col min-h-0">
                        <div className="relative flex-1">
                            <Textarea
                                placeholder="Paste your JSON here..."
                                className={cn(
                                    "h-full font-mono text-sm resize-none bg-background/50",
                                    error && "border-destructive focus-visible:ring-destructive"
                                )}
                                value={input}
                                onChange={(e) => {
                                    setInput(e.target.value);
                                    if (!e.target.value.trim()) {
                                        setParsedJson(null);
                                        setError(null);
                                    }
                                }}
                                onBlur={parseJson}
                                spellCheck={false}
                            />
                            {error && (
                                <div className="absolute bottom-4 left-4 right-4 p-3 bg-destructive/10 text-destructive text-sm rounded-md border border-destructive/20 bg-background/90 backdrop-blur-sm">
                                    Error: {error}
                                </div>
                            )}
                        </div>
                        <div className="mt-2 text-xs text-muted-foreground">
                            Click outside or press Parse to view tree.
                        </div>
                        <Button className="mt-2 w-full" onClick={parseJson}>Visualize Tree</Button>
                    </CardContent>
                </Card>

                {/* Tree View Section */}
                <Card className="glass-panel border-primary/20 flex flex-col h-[600px]">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-lg font-medium">Tree View</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 min-h-0">
                        <ScrollArea className="h-full rounded-md border bg-background/50 p-4">
                            {parsedJson ? (
                                <JsonNode data={parsedJson} name="root" isLast={true} />
                            ) : (
                                <div className="flex items-center justify-center h-full text-muted-foreground">
                                    {error ? 'Fix JSON error to view tree' : 'Paste valid JSON to view tree'}
                                </div>
                            )}
                        </ScrollArea>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

const JsonNode = ({ data, name, isLast }: { data: any, name?: string, isLast?: boolean }) => {
    const [isOpen, setIsOpen] = useState(true);
    const { toast } = useToast();

    if (data === null) return <PrimitiveValue name={name} value="null" type="null" isLast={isLast} />;
    if (typeof data === 'boolean') return <PrimitiveValue name={name} value={data.toString()} type="boolean" isLast={isLast} />;
    if (typeof data === 'number') return <PrimitiveValue name={name} value={data.toString()} type="number" isLast={isLast} />;
    if (typeof data === 'string') return <PrimitiveValue name={name} value={`"${data}"`} type="string" isLast={isLast} />;

    const isArray = Array.isArray(data);
    const keys = Object.keys(data);
    const isEmpty = keys.length === 0;
    const preview = isArray ? `Array(${keys.length})` : `Object{${keys.length}}`;

    const copyPath = (e: React.MouseEvent) => {
        e.stopPropagation();
        // Simple path copying not implemented in this recursion, can be added with context.
        toast({ title: 'Path copying can be added here' });
    };

    return (
        <div className="font-mono text-sm ml-4">
            <div
                className="flex items-center gap-1 cursor-pointer hover:bg-primary/5 rounded px-1 py-0.5"
                onClick={() => setIsOpen(!isOpen)}
            >
                {isEmpty ? <div className="w-4" /> : (
                    isOpen ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />
                )}

                {name && <span className="text-purple-400">{name}</span>}
                {name && <span className="text-muted-foreground mr-1">:</span>}

                <span className="text-muted-foreground">{isArray ? '[' : '{'}</span>

                {!isOpen && !isEmpty && (
                    <span className="text-muted-foreground text-xs mx-1">...</span>
                )}

                {(!isOpen || isEmpty) && (
                    <span className="text-muted-foreground">
                        {isArray ? ']' : '}'}
                        {!isLast && ','}
                        {!isOpen && <span className="ml-2 text-xs text-muted-foreground/50 italic">// {preview}</span>}
                    </span>
                )}
            </div>

            {isOpen && !isEmpty && (
                <div>
                    {keys.map((key, index) => (
                        <JsonNode
                            key={key}
                            name={isArray ? undefined : key}
                            data={data[key]}
                            isLast={index === keys.length - 1}
                        />
                    ))}
                    <div className="ml-4 text-muted-foreground">
                        {isArray ? ']' : '}'}{!isLast && ','}
                    </div>
                </div>
            )}
        </div>
    );
};

const PrimitiveValue = ({ name, value, type, isLast }: { name?: string, value: string, type: string, isLast?: boolean }) => {
    let colorClass = 'text-foreground';
    if (type === 'string') colorClass = 'text-green-400';
    if (type === 'number') colorClass = 'text-blue-400';
    if (type === 'boolean') colorClass = 'text-orange-400';
    if (type === 'null') colorClass = 'text-gray-400';

    return (
        <div className="font-mono text-sm ml-8 flex items-start hover:bg-primary/5 rounded px-1 py-0.5">
            {name && <span className="text-purple-400 mr-1">{name}:</span>}
            <span className={cn(colorClass, "break-all")}>{value}</span>
            {!isLast && <span className="text-muted-foreground">,</span>}
        </div>
    );
};
