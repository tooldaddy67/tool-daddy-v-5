'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Percent, ArrowRight, RefreshCw, Info } from 'lucide-react';

export default function PercentageCalculator() {
    // Mode 1: What is P% of X?
    const [p1, setP1] = useState('10');
    const [x1, setX1] = useState('100');
    const [res1, setRes1] = useState('10');

    // Mode 2: X is what % of Y?
    const [x2, setX2] = useState('20');
    const [y2, setY2] = useState('200');
    const [res2, setRes2] = useState('10');

    // Mode 3: Percentage increase/decrease from X to Y
    const [x3, setX3] = useState('100');
    const [y3, setY3] = useState('150');
    const [res3, setRes3] = useState('50');

    useEffect(() => {
        const val = (parseFloat(p1) / 100) * parseFloat(x1);
        setRes1(isNaN(val) ? '0' : val.toFixed(2));
    }, [p1, x1]);

    useEffect(() => {
        const val = (parseFloat(x2) / parseFloat(y2)) * 100;
        setRes2(isNaN(val) ? '0' : val.toFixed(2));
    }, [x2, y2]);

    useEffect(() => {
        const val = ((parseFloat(y3) - parseFloat(x3)) / Math.abs(parseFloat(x3))) * 100;
        setRes3(isNaN(val) ? '0' : val.toFixed(2));
    }, [x3, y3]);

    return (
        <div className="container mx-auto py-10 px-4 max-w-4xl">
            <div className="flex flex-col items-center mb-10 text-center">
                <div className="p-4 rounded-2xl bg-primary/10 mb-4">
                    <Percent className="h-10 w-10 text-primary" />
                </div>
                <h1 className="text-4xl font-bold font-headline mb-2">Percentage Calculator</h1>
                <p className="text-muted-foreground">Quickly calculate proportions, discounts, and growth rates with ease.</p>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {/* Mode 1 */}
                <Card className="glass-panel overflow-hidden transition-all hover:bg-white/5">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <span className="p-1 px-2 rounded bg-primary text-primary-foreground text-xs">BASIC</span>
                            What is percentage of value?
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col sm:flex-row items-center gap-4 py-8">
                        <div className="flex items-center gap-4 w-full">
                            <div className="space-y-1 flex-1">
                                <Label className="text-[10px] uppercase opacity-50 font-bold tracking-widest pl-1">Percentage (%)</Label>
                                <Input type="number" value={p1} onChange={(e) => setP1(e.target.value)} className="h-12 text-lg text-center font-bold" />
                            </div>
                            <span className="mt-6 text-muted-foreground">of</span>
                            <div className="space-y-1 flex-1">
                                <Label className="text-[10px] uppercase opacity-50 font-bold tracking-widest pl-1">Total Value</Label>
                                <Input type="number" value={x1} onChange={(e) => setX1(e.target.value)} className="h-12 text-lg text-center font-bold" />
                            </div>
                        </div>
                        <ArrowRight className="hidden sm:block mt-6 text-muted-foreground opacity-30" />
                        <div className="w-full sm:w-[150px] p-4 py-3 rounded-xl bg-primary/10 border border-primary/20 mt-6 sm:mt-0 flex flex-col items-center">
                            <Label className="text-[10px] uppercase opacity-50 font-bold tracking-widest mb-1">Result</Label>
                            <span className="text-2xl font-black text-primary">{res1}</span>
                        </div>
                    </CardContent>
                </Card>

                {/* Mode 2 */}
                <Card className="glass-panel overflow-hidden transition-all hover:bg-white/5">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <span className="p-1 px-2 rounded bg-blue-500 text-white text-xs">SHARE</span>
                            What percentage is X of Y?
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col sm:flex-row items-center gap-4 py-8">
                        <div className="flex items-center gap-4 w-full">
                            <div className="space-y-1 flex-1">
                                <Label className="text-[10px] uppercase opacity-50 font-bold tracking-widest pl-1">Part (X)</Label>
                                <Input type="number" value={x2} onChange={(e) => setX2(e.target.value)} className="h-12 text-lg text-center font-bold" />
                            </div>
                            <span className="mt-6 text-muted-foreground">is what % of</span>
                            <div className="space-y-1 flex-1">
                                <Label className="text-[10px] uppercase opacity-50 font-bold tracking-widest pl-1">Whole (Y)</Label>
                                <Input type="number" value={y2} onChange={(e) => setY2(e.target.value)} className="h-12 text-lg text-center font-bold" />
                            </div>
                        </div>
                        <ArrowRight className="hidden sm:block mt-6 text-muted-foreground opacity-30" />
                        <div className="w-full sm:w-[150px] p-4 py-3 rounded-xl bg-blue-500/10 border border-blue-500/20 mt-6 sm:mt-0 flex flex-col items-center">
                            <Label className="text-[10px] uppercase opacity-50 font-bold tracking-widest mb-1">Percentage</Label>
                            <span className="text-2xl font-black text-blue-500">{res2}%</span>
                        </div>
                    </CardContent>
                </Card>

                {/* Mode 3 */}
                <Card className="glass-panel overflow-hidden transition-all hover:bg-white/5">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <span className="p-1 px-2 rounded bg-green-500 text-white text-xs">GROWTH</span>
                            Percentage increase / decrease
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col sm:flex-row items-center gap-4 py-8">
                        <div className="flex items-center gap-4 w-full">
                            <div className="space-y-1 flex-1">
                                <Label className="text-[10px] uppercase opacity-50 font-bold tracking-widest pl-1">From value</Label>
                                <Input type="number" value={x3} onChange={(e) => setX3(e.target.value)} className="h-12 text-lg text-center font-bold" />
                            </div>
                            <span className="mt-6 text-muted-foreground text-center animate-pulse">→</span>
                            <div className="space-y-1 flex-1">
                                <Label className="text-[10px] uppercase opacity-50 font-bold tracking-widest pl-1">To value</Label>
                                <Input type="number" value={y3} onChange={(e) => setY3(e.target.value)} className="h-12 text-lg text-center font-bold" />
                            </div>
                        </div>
                        <ArrowRight className="hidden sm:block mt-6 text-muted-foreground opacity-30" />
                        <div className={`w-full sm:w-[150px] p-4 py-3 rounded-xl border mt-6 sm:mt-0 flex flex-col items-center transition-colors ${parseFloat(res3) >= 0 ? 'bg-green-500/10 border-green-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
                            <Label className="text-[10px] uppercase opacity-50 font-bold tracking-widest mb-1">{parseFloat(res3) >= 0 ? 'Increase' : 'Decrease'}</Label>
                            <span className={`text-2xl font-black ${parseFloat(res3) >= 0 ? 'text-green-500' : 'text-red-500'}`}>{res3}%</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="mt-12 p-8 rounded-3xl bg-muted/20 border border-border flex items-start gap-4">
                <Info className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                <div className="space-y-2">
                    <h3 className="font-bold">Did you know?</h3>
                    <p className="text-sm text-muted-foreground">
                        Percentages are reversible! **8% of 25** is exactly the same as **25% of 8** (both are 2). This mental trick makes calculating tips or discounts much faster.
                    </p>
                </div>
            </div>
        </div>
    );
}
