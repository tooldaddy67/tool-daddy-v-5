'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Search, Globe, Building2, MapPin, Hash, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function MacLookup() {
    const [mac, setMac] = useState('00:00:5e:00:53:01');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const { toast } = useToast();

    const lookup = async () => {
        if (!mac) return;
        const cleanMac = mac.replace(/[^a-fA-F0-9]/g, '').slice(0, 12);
        if (cleanMac.length < 6) {
            toast({ title: 'Invalid MAC', description: 'MAC address must be at least 6 hex characters.', variant: 'destructive' });
            return;
        }

        setLoading(true);
        setResult(null);

        try {
            // Primary lookup
            let response = await fetch(`https://api.macvendors.com/${cleanMac}`);

            if (response.ok) {
                const vendor = await response.text();
                setResult({ vendor });
            } else {
                // Secondary fallback
                response = await fetch(`https://api.maclookup.app/v2/macs/${cleanMac}`);
                const data = await response.json();
                if (data.success && data.company) {
                    setResult({ vendor: data.company });
                } else {
                    throw new Error('Vendor not found in database');
                }
            }
        } catch (error: any) {
            toast({
                title: 'Lookup Failed',
                description: 'Could not find vendor. Make sure the MAC is valid.',
                variant: 'destructive'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto py-10 px-4 max-w-4xl">
            <div className="flex flex-col items-center mb-10 text-center">
                <div className="p-4 rounded-2xl bg-primary/10 mb-4">
                    <Search className="h-10 w-10 text-primary" />
                </div>
                <h1 className="text-4xl font-bold font-headline mb-2">MAC Address Lookup</h1>
                <p className="text-muted-foreground">Find the manufacturer/vendor of a device using its MAC address.</p>
            </div>

            <Card className="glass-panel mb-8">
                <CardContent className="pt-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1 space-y-2">
                            <Label htmlFor="mac">MAC Address</Label>
                            <Input
                                id="mac"
                                value={mac}
                                onChange={(e) => setMac(e.target.value)}
                                placeholder="00-B0-D0-63-C2-26"
                                className="font-mono"
                            />
                        </div>
                        <Button className="sm:mt-8 flex gap-2 min-w-[120px]" onClick={lookup} disabled={loading}>
                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                            Lookup
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {result && (
                <Card className="glass-panel border-primary/20 bg-primary/5">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Globe className="h-5 w-5 text-primary" />
                            Vendor Identity Found
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-start gap-4 p-4 rounded-xl bg-background/50 border border-border">
                            <Building2 className="h-10 w-10 text-primary mt-1" />
                            <div>
                                <h3 className="text-2xl font-bold text-foreground">{result.vendor}</h3>
                                <p className="text-muted-foreground font-mono mt-1 uppercase tracking-tight">{mac}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-center gap-3 p-3 rounded-lg bg-background/40">
                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">Global Manufacturer Database</span>
                            </div>
                            <div className="flex items-center gap-3 p-3 rounded-lg bg-background/40">
                                <Hash className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">OUI Registered</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {!result && !loading && (
                <div className="h-40 flex items-center justify-center text-muted-foreground italic border-2 border-dashed rounded-xl">
                    Enter a MAC address to search the OUI database
                </div>
            )}
        </div>
    );
}
