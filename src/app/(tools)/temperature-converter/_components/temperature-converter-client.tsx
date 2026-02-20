'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Thermometer, ArrowRightLeft, RefreshCw, Sun, Snowflake, Droplets } from 'lucide-react';

export default function TemperatureConverterClient() {
    const [celsius, setCelsius] = useState('20');
    const [fahrenheit, setFahrenheit] = useState('68');
    const [kelvin, setKelvin] = useState('293.15');

    const updateFromCelsius = (val: string) => {
        setCelsius(val);
        const c = parseFloat(val);
        if (!isNaN(c)) {
            setFahrenheit(((c * 9 / 5) + 32).toFixed(2));
            setKelvin((c + 273.15).toFixed(2));
        } else {
            setFahrenheit('');
            setKelvin('');
        }
    };

    const updateFromFahrenheit = (val: string) => {
        setFahrenheit(val);
        const f = parseFloat(val);
        if (!isNaN(f)) {
            const c = (f - 32) * 5 / 9;
            setCelsius(c.toFixed(2));
            setKelvin((c + 273.15).toFixed(2));
        } else {
            setCelsius('');
            setKelvin('');
        }
    };

    const updateFromKelvin = (val: string) => {
        setKelvin(val);
        const k = parseFloat(val);
        if (!isNaN(k)) {
            const c = k - 273.15;
            setCelsius(c.toFixed(2));
            setFahrenheit(((c * 9 / 5) + 32).toFixed(2));
        } else {
            setCelsius('');
            setFahrenheit('');
        }
    };

    const getTempColor = () => {
        const c = parseFloat(celsius);
        if (c <= 0) return 'text-blue-500';
        if (c >= 30) return 'text-red-500';
        return 'text-primary';
    };

    const getTempIcon = () => {
        const c = parseFloat(celsius);
        if (c <= 0) return <Snowflake className="h-10 w-10 text-blue-500" />;
        if (c >= 30) return <Sun className="h-10 w-10 text-orange-500" />;
        return <Droplets className="h-10 w-10 text-primary" />;
    };

    return (
        <div className="container mx-auto py-10 px-4 max-w-4xl">
            <div className="flex flex-col items-center mb-10 text-center">
                <div className="p-4 rounded-2xl bg-primary/10 mb-4 transition-all hover:scale-110">
                    {getTempIcon()}
                </div>
                <h1 className="text-4xl font-bold font-headline mb-2">Temperature Converter</h1>
                <p className="text-muted-foreground">Instantly convert temperatures between Celsius, Fahrenheit, and Kelvin scales.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: 'Celsius (°C)', value: celsius, update: updateFromCelsius, sub: 'Frozen at 0°, Boils at 100°' },
                    { label: 'Fahrenheit (°F)', value: fahrenheit, update: updateFromFahrenheit, sub: 'Frozen at 32°, Boils at 212°' },
                    { label: 'Kelvin (K)', value: kelvin, update: updateFromKelvin, sub: 'Absolute zero at 0 K' }
                ].map((unit, i) => (
                    <Card key={i} className="glass-panel overflow-hidden border-primary/10 transition-all hover:border-primary/30">
                        <CardHeader className="pb-2">
                            <Label className="text-sm font-bold uppercase tracking-widest opacity-50">{unit.label}</Label>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Input
                                type="number"
                                min="-1000000"
                                max="1000000"
                                value={unit.value}
                                onChange={(e) => unit.update(e.target.value)}
                                className="h-16 text-3xl font-black text-center shadow-none border-none bg-primary/5 focus-visible:ring-1 focus-visible:ring-primary/20"
                            />
                            <p className="text-[10px] text-center text-muted-foreground uppercase font-bold tracking-tighter opacity-70">
                                {unit.sub}
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Card className="mt-12 glass-panel border-primary/20 bg-primary/5">
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Thermometer className="h-5 w-5 text-primary" />
                        Quick Reference Table
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {[
                            { label: 'Absolute Zero', c: '-273.15', f: '-459.67' },
                            { label: 'Freezing Point', c: '0', f: '32' },
                            { label: 'Body Temp', c: '37', f: '98.6' },
                            { label: 'Boiling Point', c: '100', f: '212' },
                        ].map((ref, i) => (
                            <div key={i} className="p-3 rounded-xl bg-muted/40 border border-border text-center">
                                <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">{ref.label}</p>
                                <p className="text-lg font-black">{ref.c}°C / {ref.f}°F</p>
                            </div>
                        ))}
                    </div>
                    <div className="mt-8 flex justify-center">
                        <Button variant="outline" size="sm" onClick={() => updateFromCelsius('20')} className="rounded-full">
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Reset to Room Temp (20°C)
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
