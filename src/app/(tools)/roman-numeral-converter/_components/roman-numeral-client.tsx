'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Hash, Copy, Check, RefreshCw, ArrowRightLeft, Info, History } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function RomanNumeralClient() {
    const [arabic, setArabic] = useState<string>('');
    const [roman, setRoman] = useState<string>('');
    const [mode, setMode] = useState<'arabic-to-roman' | 'roman-to-arabic'>('arabic-to-roman');
    const { toast } = useToast();
    const [isCopied, setIsCopied] = useState(false);

    const intToRoman = (num: number): string => {
        if (num < 1 || num > 3999) return 'Error: Range 1-3999';
        const map: [number, string][] = [
            [1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'],
            [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'],
            [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']
        ];
        let result = '';
        for (const [val, char] of map) {
            while (num >= val) {
                result += char;
                num -= val;
            }
        }
        return result;
    };

    const romanToInt = (s: string): string => {
        const map: { [key: string]: number } = {
            'I': 1, 'V': 5, 'X': 10, 'L': 50, 'C': 100, 'D': 500, 'M': 1000
        };
        const rom = s.toUpperCase().trim();
        if (!/^[IVXLCDM]+$/.test(rom)) return 'Error: Invalid Characters';

        // Basic validation for repeating characters (overly simple but helps)
        if (/IIII|VV|XXXX|LL|CCCC|DD|MMMM/.test(rom)) return 'Error: Invalid Roman Format';

        let total = 0;
        for (let i = 0; i < rom.length; i++) {
            const current = map[rom[i]];
            const next = map[rom[i + 1]];
            if (next > current) {
                total += (next - current);
                i++;
            } else {
                total += current;
            }
        }

        if (intToRoman(total) !== rom) return 'Error: Invalid Sequence';

        return total.toString();
    };

    useEffect(() => {
        if (mode === 'arabic-to-roman') {
            if (!arabic) {
                setRoman('');
                return;
            }
            const val = parseInt(arabic);
            if (isNaN(val)) {
                setRoman('Error: Not a number');
            } else {
                setRoman(intToRoman(val));
            }
        } else {
            if (!roman) {
                setArabic('');
                return;
            }
            setArabic(romanToInt(roman));
        }
    }, [arabic, roman, mode]);

    const toggleMode = () => {
        setMode(prev => prev === 'arabic-to-roman' ? 'roman-to-arabic' : 'arabic-to-roman');
        // Clear both on mode switch to avoid confusion
        setArabic('');
        setRoman('');
    };

    const copyToClipboard = () => {
        const val = mode === 'arabic-to-roman' ? roman : arabic;
        if (!val || val.startsWith('Error')) return;
        navigator.clipboard.writeText(val);
        setIsCopied(true);
        toast({ title: 'Result copied to clipboard' });
        setTimeout(() => setIsCopied(false), 2000);
    };

    return (
        <div className="container mx-auto py-10 px-4 max-w-4xl">
            <div className="flex flex-col items-center mb-10 text-center">
                <div className="p-4 rounded-2xl bg-primary/10 mb-4">
                    <History className="h-10 w-10 text-primary" />
                </div>
                <h1 className="text-4xl font-bold font-headline mb-2">Roman Numeral Converter</h1>
                <p className="text-muted-foreground">Convert numbers between Arabic (1-3999) and Roman numeral systems.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                <Card className="glass-panel border-primary/20">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center justify-between">
                            <span>Input</span>
                            <Button variant="ghost" size="icon" onClick={toggleMode} className="rounded-full">
                                <ArrowRightLeft className="h-4 w-4" />
                            </Button>
                        </CardTitle>
                        <CardDescription>
                            {mode === 'arabic-to-roman' ? 'Enter a number (1-3999)' : 'Enter Roman numerals (e.g., XIV)'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="input-val">{mode === 'arabic-to-roman' ? 'Arabic Integer' : 'Roman Numeral'}</Label>
                            <Input
                                id="input-val"
                                placeholder={mode === 'arabic-to-roman' ? "e.g., 2024" : "e.g., MMXXIV"}
                                className="h-14 text-xl font-bold font-mono"
                                value={mode === 'arabic-to-roman' ? arabic : roman}
                                onChange={(e) => mode === 'arabic-to-roman' ? setArabic(e.target.value) : setRoman(e.target.value)}
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card className="glass-panel bg-primary/5 border-primary/30">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center justify-between">
                            <span>Result</span>
                            <Button variant="ghost" size="icon" onClick={copyToClipboard} disabled={mode === 'arabic-to-roman' ? !roman || roman.startsWith('Error') : !arabic || arabic.startsWith('Error')}>
                                {isCopied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                            </Button>
                        </CardTitle>
                        <CardDescription>Converted value</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center justify-center pt-2">
                        <div className={`w-full p-8 rounded-2xl bg-background/80 border-2 border-primary/20 text-center transition-all ${((mode === 'arabic-to-roman' ? roman : arabic).startsWith('Error')) ? 'border-destructive/30' : ''}`}>
                            <p className={`font-mono text-3xl font-black tracking-widest ${((mode === 'arabic-to-roman' ? roman : arabic).startsWith('Error')) ? 'text-destructive text-sm uppercase' : 'text-primary'}`}>
                                {mode === 'arabic-to-roman' ? (roman || '---') : (arabic || '---')}
                            </p>
                        </div>
                        {mode === 'arabic-to-roman' && arabic && !roman.startsWith('Error') && (
                            <p className="mt-4 text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">
                                {arabic} = {roman}
                            </p>
                        )}
                    </CardContent>
                </Card>
            </div>

            <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card className="glass-panel border-border shadow-none">
                    <CardHeader>
                        <CardTitle className="text-sm flex items-center gap-2">
                            <Info className="h-4 w-4 text-primary" />
                            Conversion Rules
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="prose prose-sm prose-invert text-muted-foreground">
                        <ul className="text-xs space-y-1">
                            <li>Letters are additive: **VI = 6** (5+1).</li>
                            <li>Subtract when smaller is before larger: **IV = 4** (5-1).</li>
                            <li>Only powers of 10 (I, X, C) can be subtracted.</li>
                            <li>Cannot subtract from a digit more than 10x larger.</li>
                            <li>Maximum 3 consecutive identical symbols (e.g., use **IV** not **IIII**).</li>
                        </ul>
                    </CardContent>
                </Card>

                <div className="grid grid-cols-2 gap-4">
                    {[
                        { l: 'I', v: 1 }, { l: 'V', v: 5 },
                        { l: 'X', v: 10 }, { l: 'L', v: 50 },
                        { l: 'C', v: 100 }, { l: 'D', v: 500 },
                        { l: 'M', v: 1000 }
                    ].map(item => (
                        <div key={item.l} className="p-3 rounded-xl bg-muted/40 border border-border/50 flex justify-between items-center group hover:border-primary/30 transition-colors">
                            <span className="font-black text-primary font-mono">{item.l}</span>
                            <span className="text-xs font-bold opacity-40">{item.v}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
