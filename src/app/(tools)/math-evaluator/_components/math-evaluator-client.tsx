'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Calculator, Copy, Check, RefreshCw, Delete, History, ChevronRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { evaluate } from 'mathjs';

export default function MathEvaluatorClient() {
    const [expression, setExpression] = useState('');
    const [result, setResult] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [history, setHistory] = useState<{ expr: string, res: string }[]>([]);
    const { toast } = useToast();
    const [isCopied, setIsCopied] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        try {
            if (expression.trim()) {
                const res = evaluate(expression);
                setResult(res.toString());
                setError(null);
            } else {
                setResult(null);
                setError(null);
            }
        } catch (err) {
            setResult(null);
            setError('Invalid expression');
        }
    }, [expression]);

    const handleClear = () => {
        setExpression('');
        setResult(null);
        setError(null);
    };

    const handleSaveToHistory = () => {
        if (result && !error) {
            setHistory(prev => [{ expr: expression, res: result }, ...prev].slice(0, 5));
            toast({ title: 'Result saved to history' });
        }
    };

    const copyResult = () => {
        if (!result) return;
        navigator.clipboard.writeText(result);
        setIsCopied(true);
        toast({ title: 'Result copied' });
        setTimeout(() => setIsCopied(false), 2000);
    };

    const appendToExpression = (val: string) => {
        setExpression(prev => prev + val);
        inputRef.current?.focus();
    };

    return (
        <div className="container mx-auto py-10 px-4 max-w-4xl">
            <div className="flex flex-col items-center mb-10 text-center">
                <div className="p-4 rounded-2xl bg-primary/10 mb-4">
                    <Calculator className="h-10 w-10 text-primary" />
                </div>
                <h1 className="text-4xl font-bold font-headline mb-2">Math Evaluator</h1>
                <p className="text-muted-foreground">Perform complex calculations, unit conversions, and algebraic evaluations instantly.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                <div className="md:col-span-8 space-y-6">
                    <Card className="glass-panel overflow-hidden border-primary/20 bg-primary/5">
                        <CardHeader className="pb-4">
                            <Label htmlFor="math-input" className="text-sm font-bold uppercase tracking-widest opacity-50">Enter Expression</Label>
                            <Input
                                ref={inputRef}
                                id="math-input"
                                value={expression}
                                onChange={(e) => setExpression(e.target.value)}
                                placeholder="e.g. 2 + 2, sin(45 deg) * 10, 500 kg to lbs"
                                className="h-16 text-2xl font-mono bg-transparent border-none focus-visible:ring-0 px-0 shadow-none placeholder:opacity-20"
                                autoFocus
                            />
                        </CardHeader>
                        <CardContent className="pt-0 border-t border-primary/10 bg-primary/5">
                            <div className="flex items-center justify-between pt-4">
                                <div className="flex-1">
                                    {error ? (
                                        <p className="text-destructive text-sm font-medium animate-pulse">{error}</p>
                                    ) : result ? (
                                        <p className="text-4xl font-black text-primary truncate">
                                            = {result}
                                        </p>
                                    ) : (
                                        <p className="text-muted-foreground/30 text-lg italic">Waiting for input...</p>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    {result && !error && (
                                        <Button variant="ghost" size="icon" onClick={copyResult} className="hover:bg-primary/10">
                                            {isCopied ? <Check className="h-5 w-5 text-green-500" /> : <Copy className="h-5 w-5" />}
                                        </Button>
                                    )}
                                    <Button variant="ghost" size="icon" onClick={handleClear} className="hover:bg-red-500/10 text-muted-foreground hover:text-red-500">
                                        <RefreshCw className="h-5 w-5" />
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="grid grid-cols-4 gap-3">
                        {['7', '8', '9', '/', '4', '5', '6', '*', '1', '2', '3', '-', '0', '.', '(', ')', '^', 'sqrt', 'sin', 'cos'].map((btn) => (
                            <Button
                                key={btn}
                                variant="outline"
                                className="h-14 text-lg font-bold hover:bg-primary hover:text-primary-foreground transition-all active:scale-95"
                                onClick={() => appendToExpression(btn + (btn.length > 1 && btn !== 'sqrt' ? '(' : ''))}
                            >
                                {btn}
                            </Button>
                        ))}
                    </div>
                </div>

                <Card className="md:col-span-4 glass-panel flex flex-col">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <History className="h-5 w-5 text-primary" />
                            Recent
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 space-y-4">
                        {history.length > 0 ? (
                            history.map((item, i) => (
                                <div
                                    key={i}
                                    className="p-3 rounded-xl bg-muted/50 border border-border cursor-pointer hover:border-primary/50 transition-colors group"
                                    onClick={() => setExpression(item.expr)}
                                >
                                    <p className="text-xs text-muted-foreground font-mono truncate">{item.expr}</p>
                                    <p className="text-lg font-bold text-foreground flex items-center justify-between">
                                        {item.res}
                                        <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </p>
                                </div>
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center py-10 opacity-30">
                                <Delete className="h-10 w-10 mb-2" />
                                <p className="text-sm">No history yet</p>
                            </div>
                        )}
                        {result && !error && (
                            <Button variant="outline" className="w-full mt-4" onClick={handleSaveToHistory}>
                                Save current result
                            </Button>
                        )}
                    </CardContent>
                </Card>
            </div>

            <div className="mt-12 p-8 rounded-3xl bg-muted/20 border border-border">
                <h3 className="text-xl font-bold mb-4">Supported Operations</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm">
                    <div>
                        <h4 className="font-bold text-primary mb-2">Arithmetic</h4>
                        <p className="text-muted-foreground">Addition (+), Subtraction (-), Multiplication (*), Division (/), Modulo (mod), Power (^)</p>
                    </div>
                    <div>
                        <h4 className="font-bold text-primary mb-2">Functions</h4>
                        <p className="text-muted-foreground">sqrt(x), log(x), sin(x), cos(x), tan(x), abs(x), round(x, precision)</p>
                    </div>
                    <div>
                        <h4 className="font-bold text-primary mb-2">Conversions</h4>
                        <p className="text-muted-foreground">"12 inch to cm", "500 usd to eur" (static rates), "50 kg to lbs"</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
