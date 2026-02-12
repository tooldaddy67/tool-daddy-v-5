'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Zap, Play, RefreshCw, Trophy, Info, AlertTriangle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function BenchmarkBuilder() {
    const [codeA, setCodeA] = useState('// Snippet A\nconst arr = Array(1000).fill(0);\nfor(let i=0; i<arr.length; i++) {\n  arr[i] = i * 2;\n}');
    const [codeB, setCodeB] = useState('// Snippet B\nconst arr = Array(1000).fill(0);\narr.map((v, i) => i * 2);');
    const [iterations, setIterations] = useState('1000');
    const [results, setResults] = useState<{ a: number, b: number } | null>(null);
    const [running, setRunning] = useState(false);
    const { toast } = useToast();

    const runBenchmark = async () => {
        setRunning(true);
        setResults(null);

        // Use a slight delay to allow UI to update to "running" state
        await new Promise(resolve => setTimeout(resolve, 100));

        try {
            const iter = parseInt(iterations);

            // Warm up
            new Function(codeA)();
            new Function(codeB)();

            // Run A
            const startA = performance.now();
            for (let i = 0; i < iter; i++) {
                new Function(codeA)();
            }
            const endA = performance.now();
            const timeA = endA - startA;

            // Run B
            const startB = performance.now();
            for (let i = 0; i < iter; i++) {
                new Function(codeB)();
            }
            const endB = performance.now();
            const timeB = endB - startB;

            setResults({ a: timeA, b: timeB });
            toast({ title: 'Benchmark completed!' });
        } catch (err) {
            console.error(err);
            toast({
                title: 'Execution Error',
                description: 'One of your code snippets has a syntax error or runtime exception.',
                variant: 'destructive'
            });
        } finally {
            setRunning(false);
        }
    };

    const getWinner = () => {
        if (!results) return null;
        return results.a < results.b ? 'A' : 'B';
    };

    const getPercentage = () => {
        if (!results) return 0;
        const slow = Math.max(results.a, results.b);
        const fast = Math.min(results.a, results.b);
        return ((slow - fast) / fast * 100).toFixed(1);
    };

    return (
        <div className="container mx-auto py-10 px-4 max-w-5xl">
            <div className="flex flex-col items-center mb-10 text-center">
                <div className="p-4 rounded-2xl bg-primary/10 mb-4">
                    <Zap className="h-10 w-10 text-primary" />
                </div>
                <h1 className="text-4xl font-bold font-headline mb-2">Benchmark Builder</h1>
                <p className="text-muted-foreground">Compare the execution speed of two JavaScript code snippets side-by-side.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div className="space-y-4">
                    <Label className="text-sm font-bold uppercase tracking-widest pl-1">Snippet A</Label>
                    <div className="relative group">
                        <div className="absolute top-3 right-3 text-[10px] font-bold text-muted-foreground opacity-20 transition-opacity group-hover:opacity-100">JS</div>
                        <Textarea
                            value={codeA}
                            onChange={(e) => setCodeA(e.target.value)}
                            className="h-[300px] font-mono text-sm bg-muted/20 border-border border-2 focus-visible:border-primary transition-all p-6"
                        />
                    </div>
                </div>
                <div className="space-y-4">
                    <Label className="text-sm font-bold uppercase tracking-widest pl-1">Snippet B</Label>
                    <div className="relative group">
                        <div className="absolute top-3 right-3 text-[10px] font-bold text-muted-foreground opacity-20 transition-opacity group-hover:opacity-100">JS</div>
                        <Textarea
                            value={codeB}
                            onChange={(e) => setCodeB(e.target.value)}
                            className="h-[300px] font-mono text-sm bg-muted/20 border-border border-2 focus-visible:border-primary transition-all p-6"
                        />
                    </div>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-12">
                <div className="flex items-center gap-4">
                    <Label htmlFor="iterations" className="whitespace-nowrap font-bold">Iterations:</Label>
                    <Input
                        id="iterations"
                        type="number"
                        value={iterations}
                        onChange={(e) => setIterations(e.target.value)}
                        className="w-32 h-12 text-center"
                    />
                </div>
                <Button
                    className="h-14 px-12 text-lg font-bold glow-button"
                    onClick={runBenchmark}
                    disabled={running}
                >
                    {running ? <Loader2 className="mr-2 h-6 w-6 animate-spin" /> : <Play className="mr-2 h-6 w-6" />}
                    {running ? 'Benchmarking...' : 'Start Battle'}
                </Button>
            </div>

            {results && (
                <Card className="glass-panel overflow-hidden border-primary/20 bg-primary/5 mb-12 animate-in fade-in zoom-in duration-500">
                    <CardHeader className="text-center pb-8">
                        <CardTitle className="text-3xl font-black flex items-center justify-center gap-4">
                            <Trophy className={`h-10 w-10 ${getWinner() === 'A' ? 'text-yellow-500' : 'text-primary'}`} />
                            Snippet {getWinner()} is faster!
                            <Trophy className={`h-10 w-10 ${getWinner() === 'B' ? 'text-yellow-500' : 'text-primary'}`} />
                        </CardTitle>
                        <CardDescription className="text-lg">
                            Snippet {getWinner()} performed <span className="text-primary font-bold">{getPercentage()}%</span> better than the alternative.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 gap-8 divide-x divide-border">
                        <div className="text-center">
                            <h4 className="text-sm font-bold uppercase tracking-widest opacity-50 mb-2">Snippet A</h4>
                            <p className="text-4xl font-black text-foreground">{results.a.toFixed(3)} <span className="text-xs uppercase opacity-30">ms</span></p>
                        </div>
                        <div className="text-center">
                            <h4 className="text-sm font-bold uppercase tracking-widest opacity-50 mb-2">Snippet B</h4>
                            <p className="text-4xl font-black text-foreground">{results.b.toFixed(3)} <span className="text-xs uppercase opacity-30">ms</span></p>
                        </div>
                    </CardContent>
                </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 rounded-2xl bg-muted/20 border border-border flex gap-4">
                    <Info className="h-6 w-6 text-primary flex-shrink-0" />
                    <p className="text-sm text-muted-foreground">
                        **Performance.now()** provides sub-millisecond precision, making it ideal for micro-benchmarks like this.
                    </p>
                </div>
                <div className="p-6 rounded-2xl bg-red-500/5 border border-red-500/20 flex gap-4">
                    <AlertTriangle className="h-6 w-6 text-red-500 flex-shrink-0" />
                    <p className="text-sm text-muted-foreground">
                        Remember that JIT optimization can vary. Run the test several times for consistency.
                    </p>
                </div>
            </div>
        </div>
    );
}
