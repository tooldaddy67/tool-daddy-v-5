'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShieldCheck, Copy, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

// We'll implement a simple decoder to avoid dependency if not needed, 
// but jwt-decode is robust. Let's try to use standard base64 decoding first to keep it lightweight.

export default function JwtDecoderClient() {
    const [token, setToken] = useState('');
    const [header, setHeader] = useState<any>(null);
    const [payload, setPayload] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const { toast } = useToast();

    const decodeToken = (input: string) => {
        setToken(input);
        setError(null);
        if (!input.trim()) {
            setHeader(null);
            setPayload(null);
            return;
        }

        try {
            const parts = input.split('.');
            if (parts.length !== 3) {
                throw new Error('Invalid JWT format. Expected 3 parts separated by dots.');
            }

            const decodePart = (part: string) => {
                const base64 = part.replace(/-/g, '+').replace(/_/g, '/');
                const json = decodeURIComponent(atob(base64).split('').map(function (c) {
                    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                }).join(''));
                return JSON.parse(json);
            };

            const headerObj = decodePart(parts[0]);
            const payloadObj = decodePart(parts[1]);

            setHeader(headerObj);
            setPayload(payloadObj);
        } catch (err) {
            setHeader(null);
            setPayload(null);
            setError((err as Error).message);
        }
    };

    return (
        <div className="container mx-auto py-10 px-4 max-w-7xl">
            <div className="flex flex-col items-center mb-10 text-center">
                <div className="p-4 rounded-2xl bg-primary/10 mb-4">
                    <ShieldCheck className="h-10 w-10 text-primary" />
                </div>
                <h1 className="text-4xl font-bold font-headline mb-2">JWT Decoder</h1>
                <p className="text-muted-foreground">Decode and inspect JSON Web Tokens.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <Card className="glass-panel border-primary/20">
                        <CardHeader>
                            <CardTitle className="text-lg">Encoded Token</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Textarea
                                placeholder="Paste your JWT here (eyJ...)"
                                className={cn(
                                    "min-h-[250px] font-mono text-sm resize-none bg-background/50 break-all",
                                    error && "border-destructive focus-visible:ring-destructive"
                                )}
                                value={token}
                                onChange={(e) => decodeToken(e.target.value)}
                            />
                            {error && (
                                <div className="mt-4 p-3 bg-destructive/10 text-destructive text-sm rounded-md border border-destructive/20 flex items-center gap-2">
                                    <AlertTriangle className="w-4 h-4" />
                                    {error}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                    <div className="text-sm text-muted-foreground bg-primary/5 p-4 rounded-lg border border-primary/10">
                        <p className="font-semibold mb-1">Security Note:</p>
                        <p>Tokens are decoded locally in your browser. No data is sent to any server. We do not verify the signature.</p>
                    </div>
                </div>

                <div className="space-y-6">
                    <Card className="glass-panel border-primary/20">
                        <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-sm font-medium text-muted-foreground">HEADER</CardTitle>
                                <span className="text-xs text-primary font-mono">ALGORITHM & TOKEN TYPE</span>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="bg-background/50 p-4 rounded-lg font-mono text-sm overflow-auto max-h-[200px]">
                                {header ? (
                                    <pre className="text-red-400">{JSON.stringify(header, null, 2)}</pre>
                                ) : (
                                    <span className="text-muted-foreground italic">No valid header...</span>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="glass-panel border-primary/20">
                        <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-sm font-medium text-muted-foreground">PAYLOAD</CardTitle>
                                <span className="text-xs text-purple-400 font-mono">DATA</span>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="bg-background/50 p-4 rounded-lg font-mono text-sm overflow-auto min-h-[300px]">
                                {payload ? (
                                    <pre className="text-purple-400">{JSON.stringify(payload, null, 2)}</pre>
                                ) : (
                                    <span className="text-muted-foreground italic">No valid payload...</span>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
