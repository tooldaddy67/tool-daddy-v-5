'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Signal, Server, Bot } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const services = [
    {
        name: 'Frontend Tools',
        status: 'Operational',
        icon: Server,
        description: 'All user-facing tools and utilities.',
    },
    {
        name: 'AI Services (Gemini)',
        status: 'Operational',
        icon: Bot,
        description: 'Backend AI processing for tools like the Text Humanizer.',
    },
];

export default function StatusClient() {
    const allOperational = services.every(s => s.status === 'Operational');

    return (
        <div className="w-full max-w-4xl mx-auto p-4 md:p-8">
            <Card className="bg-card/50 backdrop-blur-lg border-border/20">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Signal /> System Status
                    </CardTitle>
                    <CardDescription>
                        Live status of all Tool Daddy services.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div
                        className={cn(
                            'p-4 rounded-lg flex items-center gap-4',
                            allOperational ? 'bg-green-500/10 text-green-400' : 'bg-orange-500/10 text-orange-400'
                        )}
                    >
                        <Signal className="h-6 w-6" />
                        <p className="font-semibold">{allOperational ? 'All Systems Operational' : 'Some Systems Are Experiencing Issues'}</p>
                    </div>
                    <div className="space-y-4">
                        {services.map(service => (
                            <div key={service.name} className="flex items-start justify-between p-4 rounded-lg bg-muted/50">
                                <div className="flex items-start gap-4">
                                    <service.icon className="h-6 w-6 text-muted-foreground mt-1" />
                                    <div>
                                        <p className="font-semibold">{service.name}</p>
                                        <p className="text-sm text-muted-foreground">{service.description}</p>
                                    </div>
                                </div>
                                <Badge
                                    className={cn(
                                        service.status === 'Operational'
                                            ? 'bg-green-500/20 text-green-300 border-green-500/30'
                                            : 'bg-orange-500/20 text-orange-300 border-orange-500/30'
                                    )}
                                >
                                    {service.status}
                                </Badge>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
