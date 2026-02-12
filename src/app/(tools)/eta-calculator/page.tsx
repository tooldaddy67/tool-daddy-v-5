'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Clock, Navigation, Zap, RefreshCw, Car, Plane, PersonStanding } from 'lucide-react';

export default function EtaCalculator() {
    const [distance, setDistance] = useState('100');
    const [speed, setSpeed] = useState('50');
    const [resHours, setResHours] = useState(0);
    const [resMinutes, setResMinutes] = useState(0);
    const [unit, setUnit] = useState('km');

    useEffect(() => {
        const d = parseFloat(distance);
        const s = parseFloat(speed);
        if (s > 0) {
            const totalHours = d / s;
            setResHours(Math.floor(totalHours));
            setResMinutes(Math.round((totalHours % 1) * 60));
        } else {
            setResHours(0);
            setResMinutes(0);
        }
    }, [distance, speed]);

    const presets = [
        { label: 'Walking', speed: 5, icon: PersonStanding, color: 'text-orange-500' },
        { label: 'City Driving', speed: 40, icon: Car, color: 'text-blue-500' },
        { label: 'Highway', speed: 100, icon: Zap, color: 'text-yellow-500' },
        { label: 'Flight', speed: 800, icon: Plane, color: 'text-indigo-500' },
    ];

    return (
        <div className="container mx-auto py-10 px-4 max-w-4xl">
            <div className="flex flex-col items-center mb-10 text-center">
                <div className="p-4 rounded-2xl bg-primary/10 mb-4">
                    <Clock className="h-10 w-10 text-primary" />
                </div>
                <h1 className="text-4xl font-bold font-headline mb-2">ETA Calculator</h1>
                <p className="text-muted-foreground">Estimate your travel time and arrival based on distance and average speed.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card className="glass-panel">
                    <CardHeader>
                        <CardTitle className="text-lg">Trip Details</CardTitle>
                        <CardDescription>Enter your journey distance and speed.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="distance">Distance ({unit === 'km' ? 'Kilometers' : 'Miles'})</Label>
                            <Input
                                id="distance"
                                type="number"
                                value={distance}
                                onChange={(e) => setDistance(e.target.value)}
                                className="h-12 text-lg"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="speed">Average Speed ({unit === 'km' ? 'km/h' : 'mph'})</Label>
                            <Input
                                id="speed"
                                type="number"
                                value={speed}
                                onChange={(e) => setSpeed(e.target.value)}
                                className="h-12 text-lg"
                            />
                        </div>

                        <div className="pt-4 space-y-3">
                            <Label className="text-xs uppercase opacity-50 font-bold">Speed Presets</Label>
                            <div className="grid grid-cols-2 gap-3">
                                {presets.map((p) => (
                                    <Button
                                        key={p.label}
                                        variant="outline"
                                        className="h-12 justify-start gap-3 hover:border-primary transition-all"
                                        onClick={() => setSpeed(p.speed.toString())}
                                    >
                                        <p.icon className={`h-4 w-4 ${p.color}`} />
                                        <div className="text-left leading-none">
                                            <p className="text-xs font-bold">{p.label}</p>
                                            <p className="text-[10px] opacity-50">{p.speed} {unit === 'km' ? 'km/h' : 'mph'}</p>
                                        </div>
                                    </Button>
                                ))}
                            </div>
                        </div>

                        <Button
                            variant="ghost"
                            className="w-full h-12 gap-2"
                            onClick={() => setUnit(unit === 'km' ? 'mi' : 'km')}
                        >
                            <RefreshCw className="h-4 w-4" />
                            Switch to {unit === 'km' ? 'Miles/MPH' : 'Kilometers/KMH'}
                        </Button>
                    </CardContent>
                </Card>

                <Card className="glass-panel border-primary/20 bg-primary/5 flex flex-col items-center justify-center p-8 text-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-5">
                        <Navigation className="h-32 w-32 rotate-45" />
                    </div>

                    <CardHeader className="pb-8">
                        <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Estimated Travel Time</CardTitle>
                    </CardHeader>

                    <CardContent className="space-y-2">
                        <div className="flex items-baseline gap-2">
                            <span className="text-7xl font-black text-primary animate-in fade-in slide-in-from-bottom-2 duration-500">
                                {resHours}
                            </span>
                            <span className="text-2xl font-bold text-muted-foreground uppercase">hr</span>

                            <span className="text-7xl font-black text-primary ml-4 animate-in fade-in slide-in-from-bottom-2 duration-700 delay-100">
                                {resMinutes}
                            </span>
                            <span className="text-2xl font-bold text-muted-foreground uppercase">min</span>
                        </div>

                        <p className="text-muted-foreground pt-4 flex items-center justify-center gap-2">
                            <Zap className="h-4 w-4 text-yellow-500" />
                            Total time: {(resHours + resMinutes / 60).toFixed(2)} hours
                        </p>
                    </CardContent>

                    <div className="w-full max-w-xs h-1 bg-border rounded-full mt-10 overflow-hidden">
                        <div
                            className="h-full bg-primary transition-all duration-1000"
                            style={{ width: `${Math.min(100, Math.max(5, (parseFloat(speed) / 200) * 100))}%` }}
                        />
                    </div>
                </Card>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-12 text-center">
                <div className="p-6 rounded-2xl border border-border bg-muted/20">
                    <p className="text-3xl font-bold mb-1">{(parseFloat(distance) * 1000).toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold">Meters</p>
                </div>
                <div className="p-6 rounded-2xl border border-border bg-muted/20">
                    <p className="text-3xl font-bold mb-1">{(parseFloat(distance) * 0.621371).toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold">Equivalent Miles</p>
                </div>
                <div className="p-6 rounded-2xl border border-border bg-muted/20">
                    <p className="text-3xl font-bold mb-1">{(parseFloat(distance) * 3280.84).toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold">Feet</p>
                </div>
            </div>
        </div>
    );
}
