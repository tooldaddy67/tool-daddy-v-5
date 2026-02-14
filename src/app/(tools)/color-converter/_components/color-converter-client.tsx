'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Palette, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

// Simple conversion logic (impl inline to avoid deps)
// HEX <-> RGB <-> HSL

function hexToRgb(hex: string) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

function rgbToHex(r: number, g: number, b: number) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

function rgbToHsl(r: number, g: number, b: number) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s, l = (max + min) / 2;

    if (max === min) {
        h = s = 0; // achromatic
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

export default function ColorConverterClient() {
    const [hex, setHex] = useState('#3b82f6');
    const [rgb, setRgb] = useState({ r: 59, g: 130, b: 246 });
    const [hsl, setHsl] = useState({ h: 217, s: 91, l: 60 });
    const { toast } = useToast();

    // Handlers
    const updateFromHex = (val: string) => {
        setHex(val);
        const rgbVal = hexToRgb(val);
        if (rgbVal) {
            setRgb(rgbVal);
            setHsl(rgbToHsl(rgbVal.r, rgbVal.g, rgbVal.b));
        }
    };

    // We can implement bi-directional updates, but let's keep it simple: 
    // Just HEX input driving others for now, or simple RGB inputs.
    // Let's allow RGB editing too.
    const updateFromRgb = (type: 'r' | 'g' | 'b', val: number) => {
        const newRgb = { ...rgb, [type]: val };
        setRgb(newRgb);
        setHex(rgbToHex(newRgb.r, newRgb.g, newRgb.b));
        setHsl(rgbToHsl(newRgb.r, newRgb.g, newRgb.b));
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast({ title: `Copied: ${text}` });
    };

    return (
        <div className="container mx-auto py-10 px-4 max-w-4xl">
            <div className="flex flex-col items-center mb-10 text-center">
                <div className="p-4 rounded-2xl bg-primary/10 mb-4">
                    <Palette className="h-10 w-10 text-primary" />
                </div>
                <h1 className="text-4xl font-bold font-headline mb-2">Color Converter</h1>
                <p className="text-muted-foreground">Convert between HEX, RGB, and HSL formats.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Visual Preview */}
                <Card className="glass-panel border-primary/20 flex flex-col items-center justify-center p-8 bg-black/10">
                    <div
                        className="w-48 h-48 rounded-2xl shadow-2xl border-4 border-white/20 transition-all duration-300"
                        style={{ backgroundColor: hex }}
                    />
                    <div className="mt-6 text-xl font-mono font-bold tracking-widest">{hex.toUpperCase()}</div>
                </Card>

                {/* Inputs */}
                <Card className="glass-panel border-primary/20">
                    <CardHeader>
                        <CardTitle>Color Values</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Label>HEX Code</Label>
                            <div className="flex gap-2">
                                <Input
                                    value={hex}
                                    onChange={(e) => updateFromHex(e.target.value)}
                                    className="font-mono"
                                />
                                <Button size="icon" variant="outline" onClick={() => copyToClipboard(hex)}>
                                    <Copy className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <Label>RGB</Label>
                            <div className="grid grid-cols-3 gap-2">
                                <div className="space-y-1">
                                    <Label className="text-xs text-muted-foreground">R</Label>
                                    <Input
                                        type="number"
                                        value={rgb.r}
                                        onChange={(e) => updateFromRgb('r', Number(e.target.value))}
                                        className="font-mono text-center"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs text-muted-foreground">G</Label>
                                    <Input
                                        type="number"
                                        value={rgb.g}
                                        onChange={(e) => updateFromRgb('g', Number(e.target.value))}
                                        className="font-mono text-center"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs text-muted-foreground">B</Label>
                                    <Input
                                        type="number"
                                        value={rgb.b}
                                        onChange={(e) => updateFromRgb('b', Number(e.target.value))}
                                        className="font-mono text-center"
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end">
                                <Button size="sm" variant="ghost" onClick={() => copyToClipboard(`rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`)}>
                                    <Copy className="h-3 w-3 mr-2" /> Copy RGB
                                </Button>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <Label>HSL</Label>
                            <div className="grid grid-cols-3 gap-2 text-center font-mono text-sm p-3 bg-muted rounded-md text-muted-foreground">
                                <div>H: {hsl.h}°</div>
                                <div>S: {hsl.s}%</div>
                                <div>L: {hsl.l}%</div>
                            </div>
                            <div className="flex justify-end">
                                <Button size="sm" variant="ghost" onClick={() => copyToClipboard(`hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`)}>
                                    <Copy className="h-3 w-3 mr-2" /> Copy HSL
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
