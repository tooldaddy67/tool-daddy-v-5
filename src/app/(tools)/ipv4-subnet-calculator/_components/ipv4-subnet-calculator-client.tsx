'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Router, Copy, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function SubnetCalculatorClient() {
    const [ip, setIp] = useState('192.168.1.1');
    const [mask, setMask] = useState('24');
    const [result, setResult] = useState<any>(null);
    const { toast } = useToast();
    const [copiedField, setCopiedField] = useState<string | null>(null);

    const calculate = () => {
        try {
            const parts = ip.split('.').map(Number);
            if (parts.length !== 4 || parts.some(p => p < 0 || p > 255)) {
                throw new Error('Invalid IP address');
            }

            const cidr = parseInt(mask);
            if (isNaN(cidr) || cidr < 0 || cidr > 32) {
                throw new Error('Invalid Subnet Mask');
            }

            const maskBits = (0xFFFFFFFF << (32 - cidr)) >>> 0;
            const maskStr = [
                (maskBits >>> 24) & 0xFF,
                (maskBits >>> 16) & 0xFF,
                (maskBits >>> 8) & 0xFF,
                maskBits & 0xFF
            ].join('.');

            const ipNum = parts.reduce((acc, octet) => (acc << 8) + octet, 0) >>> 0;
            const networkNum = (ipNum & maskBits) >>> 0;
            const networkStr = [
                (networkNum >>> 24) & 0xFF,
                (networkNum >>> 16) & 0xFF,
                (networkNum >>> 8) & 0xFF,
                networkNum & 0xFF
            ].join('.');

            const broadcastNum = (networkNum | (~maskBits)) >>> 0;
            const broadcastStr = [
                (broadcastNum >>> 24) & 0xFF,
                (broadcastNum >>> 16) & 0xFF,
                (broadcastNum >>> 8) & 0xFF,
                broadcastNum & 0xFF
            ].join('.');

            const firstUsable = cidr === 32 ? networkStr : [
                (networkNum >>> 24) & 0xFF,
                (networkNum >>> 16) & 0xFF,
                (networkNum >>> 8) & 0xFF,
                (networkNum & 0xFF) + 1
            ].join('.');

            const lastUsable = cidr >= 31 ? broadcastStr : [
                (broadcastNum >>> 24) & 0xFF,
                (broadcastNum >>> 16) & 0xFF,
                (broadcastNum >>> 8) & 0xFF,
                (broadcastNum & 0xFF) - 1
            ].join('.');

            const totalHosts = Math.pow(2, 32 - cidr);
            const usableHosts = totalHosts > 2 ? totalHosts - 2 : (totalHosts === 1 ? 1 : 0);

            setResult({
                network: networkStr,
                broadcast: broadcastStr,
                mask: maskStr,
                first: firstUsable,
                last: lastUsable,
                hosts: usableHosts.toLocaleString(),
                total: totalHosts.toLocaleString(),
                cidr: `/${cidr}`
            });

        } catch (error: any) {
            toast({
                title: 'Calculation Error',
                description: error.message,
                variant: 'destructive'
            });
        }
    };

    const copyToClipboard = (text: string, field: string) => {
        navigator.clipboard.writeText(text);
        setCopiedField(field);
        toast({ title: 'Copied to clipboard' });
        setTimeout(() => setCopiedField(null), 2000);
    };

    return (
        <div className="container mx-auto py-10 px-4 max-w-4xl">
            <div className="flex flex-col items-center mb-10 text-center">
                <div className="p-4 rounded-2xl bg-primary/10 mb-4">
                    <Router className="h-10 w-10 text-primary" />
                </div>
                <h1 className="text-4xl font-bold font-headline mb-2">IPv4 Subnet Calculator</h1>
                <p className="text-muted-foreground">Calculate network parameters, broadcast addresses, and usable ranges.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <Card className="md:col-span-1 glass-panel">
                    <CardHeader>
                        <CardTitle className="text-lg">Input Parameters</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="ip">IP Address</Label>
                            <Input
                                id="ip"
                                value={ip}
                                onChange={(e) => setIp(e.target.value)}
                                placeholder="192.168.1.1"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="mask">Subnet Mask (CIDR)</Label>
                            <Input
                                id="mask"
                                type="number"
                                min="0"
                                max="32"
                                value={mask}
                                onChange={(e) => setMask(e.target.value)}
                                placeholder="24"
                            />
                        </div>
                        <Button className="w-full mt-4" onClick={calculate}>
                            Calculate
                        </Button>
                    </CardContent>
                </Card>

                <Card className="md:col-span-2 glass-panel">
                    <CardHeader>
                        <CardTitle className="text-lg">Results</CardTitle>
                        <CardDescription>Network details based on your input.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {!result ? (
                            <div className="h-40 flex items-center justify-center text-muted-foreground italic">
                                Click calculate to see results
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {[
                                    { label: 'Network Address', value: result.network, field: 'network' },
                                    { label: 'Broadcast Address', value: result.broadcast, field: 'broadcast' },
                                    { label: 'Subnet Mask', value: result.mask, field: 'mask' },
                                    { label: 'CIDR Notation', value: result.cidr, field: 'cidr' },
                                    { label: 'First Usable IP', value: result.first, field: 'first' },
                                    { label: 'Last Usable IP', value: result.last, field: 'last' },
                                    { label: 'Usable Hosts', value: result.hosts, field: 'hosts' },
                                    { label: 'Total IPs', value: result.total, field: 'total' },
                                ].map((item) => (
                                    <div key={item.label} className="p-3 rounded-lg bg-muted/50 border border-border/50 group relative">
                                        <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1">{item.label}</p>
                                        <p className="font-mono text-lg">{item.value}</p>
                                        <button
                                            onClick={() => copyToClipboard(item.value, item.field)}
                                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 bg-background rounded border border-border"
                                        >
                                            {copiedField === item.field ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
