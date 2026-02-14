'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Search, AlertTriangle, CheckCircle } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

export default function RegexTesterClient() {
    const [regexStr, setRegexStr] = useState('[A-Z]\\w+');
    const [flags, setFlags] = useState('gm');
    const [testString, setTestString] = useState('Hello World this is a Test String for Regex.');

    // Flags
    const [flagGlobal, setFlagGlobal] = useState(true);
    const [flagCase, setFlagCase] = useState(false);
    const [flagMultiline, setFlagMultiline] = useState(true);

    const matches = useMemo(() => {
        if (!regexStr) return [];
        try {
            let f = '';
            if (flagGlobal) f += 'g';
            if (flagCase) f += 'i';
            if (flagMultiline) f += 'm';

            const regex = new RegExp(regexStr, f);
            const found = [];

            // Should verify if global flag is set to avoid infinite loop with exec if not handled, 
            // but map/matchAll is safer or match().

            if (!flagGlobal) {
                const match = testString.match(regex);
                if (match) {
                    found.push({
                        index: match.index,
                        match: match[0],
                        groups: match.slice(1)
                    });
                }
            } else {
                const results = [...testString.matchAll(regex)];
                results.forEach(m => {
                    found.push({
                        index: m.index,
                        match: m[0],
                        groups: m.slice(1)
                    });
                });
            }
            return found;
        } catch (e) {
            return { error: (e as Error).message };
        }
    }, [regexStr, testString, flagGlobal, flagCase, flagMultiline]);

    const hasError = !Array.isArray(matches) && matches.error;

    // Highlight text logic (simplified)
    // Real highlighting with overlapping matches is hard. 
    // We'll just show the list of matches for now to be safe and robust.

    return (
        <div className="container mx-auto py-10 px-4 max-w-6xl">
            <div className="flex flex-col items-center mb-10 text-center">
                <div className="p-4 rounded-2xl bg-primary/10 mb-4">
                    <Search className="h-10 w-10 text-primary" />
                </div>
                <h1 className="text-4xl font-bold font-headline mb-2">Regex Tester</h1>
                <p className="text-muted-foreground">Test Regular Expressions against your text.</p>
            </div>

            <Card className="glass-panel border-primary/20">
                <CardContent className="pt-6 space-y-6">
                    {/* Regex Input & Flags */}
                    <div className="flex flex-col md:flex-row gap-4 items-start">
                        <div className="flex-1 space-y-2 w-full">
                            <Label>Regular Expression</Label>
                            <div className="flex items-center gap-2">
                                <span className="text-muted-foreground font-mono text-xl">/</span>
                                <Input
                                    value={regexStr}
                                    onChange={(e) => setRegexStr(e.target.value)}
                                    className="font-mono text-lg"
                                    placeholder="Expression..."
                                />
                                <span className="text-muted-foreground font-mono text-xl">/</span>
                                <Input
                                    value={(flagGlobal ? 'g' : '') + (flagCase ? 'i' : '') + (flagMultiline ? 'm' : '')}
                                    readOnly
                                    className="w-20 font-mono text-lg bg-muted"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-6 p-4 bg-muted/30 rounded-lg">
                        <div className="flex items-center space-x-2">
                            <Switch id="global" checked={flagGlobal} onCheckedChange={setFlagGlobal} />
                            <Label htmlFor="global">Global (g)</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Switch id="case" checked={flagCase} onCheckedChange={setFlagCase} />
                            <Label htmlFor="case">Case Insensitive (i)</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Switch id="multiline" checked={flagMultiline} onCheckedChange={setFlagMultiline} />
                            <Label htmlFor="multiline">Multiline (m)</Label>
                        </div>
                    </div>

                    {hasError && (
                        <div className="p-3 bg-destructive/10 text-destructive rounded-md flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4" />
                            {(matches as any).error}
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label>Test String</Label>
                        <Textarea
                            value={testString}
                            onChange={(e) => setTestString(e.target.value)}
                            className="min-h-[150px] font-mono whitespace-pre-wrap"
                            placeholder="Enter text to match..."
                        />
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                            <CheckCircle className="h-5 w-5 text-green-500" />
                            Matches ({Array.isArray(matches) ? matches.length : 0})
                        </h3>

                        {Array.isArray(matches) && matches.length > 0 ? (
                            <div className="grid gap-2 max-h-[300px] overflow-auto">
                                {matches.map((m, i) => (
                                    <div key={i} className="p-3 rounded-md bg-primary/5 border border-primary/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                        <div className="font-mono text-primary break-all">
                                            <span className="text-xs text-muted-foreground mr-2">#{i + 1}</span>
                                            "{m.match}"
                                        </div>
                                        <div className="text-xs text-muted-foreground font-mono">
                                            Index: {m.index}
                                            {m.groups.length > 0 && ` • Groups: [${m.groups.map(g => `"${g}"`).join(', ')}]`}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-muted-foreground italic p-4 text-center border rounded-md border-dashed">
                                No matches found.
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
