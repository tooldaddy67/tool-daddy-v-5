'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, CalendarClock, Info } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// Basic utility to describe cron (Simplified)
// A full parser is complex. This handles standard 5-field cron.
function describeCron(expression: string) {
    const parts = expression.trim().split(/\s+/);
    if (parts.length !== 5) return { description: 'Invalid Format (Requires 5 fields)', nextRuns: [] };

    const [minute, hour, dayOfMonth, month, dayOfWeek] = parts;

    let desc = `At `;

    // Time
    if (minute === '*' && hour === '*') desc += 'every minute';
    else if (minute !== '*' && hour === '*') desc += `minute ${minute} past every hour`;
    else if (minute === '*' && hour !== '*') desc += `every minute of hour ${hour}`;
    else desc += `${hour}:${minute.padStart(2, '0')}`;

    // Date
    if (dayOfMonth !== '*') desc += ` on day-of-month ${dayOfMonth}`;
    if (month !== '*') desc += ` in month ${month}`;
    if (dayOfWeek !== '*') desc += ` on day-of-week ${dayOfWeek}`;

    if (expression === '* * * * *') desc = 'Every minute';
    if (expression === '0 * * * *') desc = 'At minute 0 past every hour';
    if (expression === '0 0 * * *') desc = 'At 00:00 every day';

    // Next Runs Simulation (Very Basic - just for show without library)
    // Real implementation would need a library like 'cron-parser'
    const nextRuns = [
        "Calculation of next runs requires 'cron-parser' library.",
        "Please install it to see exact dates."
    ];

    return { description: desc, nextRuns };
}

export default function CronParserClient() {
    const [cron, setCron] = useState('* * * * *');
    const [result, setResult] = useState<{ description: string, nextRuns: string[] } | null>(null);

    useEffect(() => {
        setResult(describeCron(cron));
    }, [cron]);

    return (
        <div className="container mx-auto py-10 px-4 max-w-4xl">
            <div className="flex flex-col items-center mb-10 text-center">
                <div className="p-4 rounded-2xl bg-primary/10 mb-4">
                    <Clock className="h-10 w-10 text-primary" />
                </div>
                <h1 className="text-4xl font-bold font-headline mb-2">Cron Expression Parser</h1>
                <p className="text-muted-foreground">Parse cron expressions into human-readable descriptions.</p>
            </div>

            <Card className="glass-panel border-primary/20">
                <CardHeader>
                    <CardTitle className="text-lg">Cron Expression</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Label>Expression (Minute Hour Day Month Weekday)</Label>
                        <Input
                            value={cron}
                            onChange={(e) => setCron(e.target.value)}
                            placeholder="* * * * *"
                            className="font-mono text-lg tracking-wider"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground px-1 font-mono">
                            <span>MIN</span>
                            <span>HOUR</span>
                            <span>DOM</span>
                            <span>MON</span>
                            <span>DOW</span>
                        </div>
                    </div>

                    <div className="bg-primary/5 p-6 rounded-xl border border-primary/10 space-y-4">
                        <div className="space-y-1">
                            <Label className="text-muted-foreground uppercase text-xs tracking-wider">Human Readable</Label>
                            <p className="text-xl font-medium text-primary">
                                {result?.description || 'Invalid Cron Expression'}
                            </p>
                        </div>

                        <div className="space-y-1">
                            <Label className="text-muted-foreground uppercase text-xs tracking-wider flex items-center gap-2">
                                Next Runs <Info className="w-3 h-3" />
                            </Label>
                            <div className="text-sm font-mono text-muted-foreground space-y-1">
                                {result?.nextRuns.map((run, i) => (
                                    <div key={i}>{run}</div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {[
                            { label: 'Every Minute', val: '* * * * *' },
                            { label: 'Hourly', val: '0 * * * *' },
                            { label: 'Daily', val: '0 0 * * *' },
                            { label: 'Weekly', val: '0 0 * * 0' },
                        ].map(preset => (
                            <Button
                                key={preset.label}
                                variant="outline"
                                size="sm"
                                onClick={() => setCron(preset.val)}
                            >
                                {preset.label}
                            </Button>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
