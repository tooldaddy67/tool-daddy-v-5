'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileKey, Copy, Check, RefreshCw, Download, Loader2, ShieldCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function RsaKeyGeneratorClient() {
    const [bitLength, setBitLength] = useState('2048');
    const [publicKey, setPublicKey] = useState('');
    const [privateKey, setPrivateKey] = useState('');
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();
    const [copiedField, setCopiedField] = useState<string | null>(null);

    const arrayBufferToBase64 = (buffer: ArrayBuffer) => {
        const binary = String.fromCharCode(...new Uint8Array(buffer));
        return window.btoa(binary).match(/.{1,64}/g)?.join('\n') || '';
    };

    const generateKeys = async () => {
        setLoading(true);
        try {
            const keys = await window.crypto.subtle.generateKey(
                {
                    name: "RSASSA-PKCS1-v1_5",
                    modulusLength: parseInt(bitLength),
                    publicExponent: new Uint8Array([1, 0, 1]),
                    hash: "SHA-256",
                },
                true,
                ["sign", "verify"]
            );

            const exportedPublic = await window.crypto.subtle.exportKey("spki", keys.publicKey);
            const exportedPrivate = await window.crypto.subtle.exportKey("pkcs8", keys.privateKey);

            setPublicKey(`-----BEGIN PUBLIC KEY-----\n${arrayBufferToBase64(exportedPublic)}\n-----END PUBLIC KEY-----`);
            setPrivateKey(`-----BEGIN PRIVATE KEY-----\n${arrayBufferToBase64(exportedPrivate)}\n-----END PRIVATE KEY-----`);

            toast({ title: 'RSA Key Pair Generated' });
        } catch (error) {
            toast({
                title: 'Generation Failed',
                description: 'Failed to generate RSA keys.',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = (text: string, field: string) => {
        navigator.clipboard.writeText(text);
        setCopiedField(field);
        toast({ title: 'Key copied to clipboard' });
        setTimeout(() => setCopiedField(null), 2000);
    };

    const downloadKey = (content: string, filename: string) => {
        const element = document.createElement("a");
        const file = new Blob([content], { type: 'text/plain' });
        element.href = URL.createObjectURL(file);
        element.download = filename;
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    };

    return (
        <div className="container mx-auto py-10 px-4 max-w-5xl">
            <div className="flex flex-col items-center mb-10 text-center">
                <div className="p-4 rounded-2xl bg-primary/10 mb-4">
                    <FileKey className="h-10 w-10 text-primary" />
                </div>
                <h1 className="text-4xl font-bold font-headline mb-2">RSA Key Pair Generator</h1>
                <p className="text-muted-foreground">Generate cryptographically secure public and private RSA key pairs in PEM format.</p>
            </div>

            <Card className="glass-panel mb-8 border-primary/20 bg-primary/5">
                <CardContent className="pt-6">
                    <div className="flex flex-col sm:flex-row gap-6 items-end">
                        <div className="flex-1 space-y-2">
                            <Label>Key Length (Bits)</Label>
                            <Select value={bitLength} onValueChange={setBitLength}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select length" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="1024">1024 Bits (Legacy)</SelectItem>
                                    <SelectItem value="2048">2048 Bits (Standard)</SelectItem>
                                    <SelectItem value="3072">3072 Bits (Secure)</SelectItem>
                                    <SelectItem value="4096">4096 Bits (Ultra Secure)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <Button className="h-12 px-10 text-lg font-bold glow-button" onClick={generateKeys} disabled={loading}>
                            {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <RefreshCw className="mr-2 h-5 w-5" />}
                            {loading ? 'Generating...' : 'Generate Key Pair'}
                        </Button>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-4 flex items-center gap-2">
                        <ShieldCheck className="h-3 w-3 text-primary" />
                        All keys are generated locally in your browser. They are NEVER sent to our servers.
                    </p>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="glass-panel">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Public Key</CardTitle>
                        <div className="flex gap-1">
                            <Button variant="ghost" size="icon" onClick={() => copyToClipboard(publicKey, 'public')} disabled={!publicKey}>
                                {copiedField === 'public' ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => downloadKey(publicKey, 'public_key.pem')} disabled={!publicKey}>
                                <Download className="h-4 w-4" />
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="p-4 rounded-xl bg-muted/30 border border-border font-mono text-[10px] leading-relaxed break-all h-80 overflow-y-auto whitespace-pre">
                            {publicKey || 'Public key will appear here...'}
                        </div>
                    </CardContent>
                </Card>

                <Card className="glass-panel">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Private Key (Keep Secure!)</CardTitle>
                        <div className="flex gap-1">
                            <Button variant="ghost" size="icon" onClick={() => copyToClipboard(privateKey, 'private')} disabled={!privateKey}>
                                {copiedField === 'private' ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => downloadKey(privateKey, 'private_key.pem')} disabled={!privateKey}>
                                <Download className="h-4 w-4" />
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="p-4 rounded-xl bg-muted/30 border border-border font-mono text-[10px] leading-relaxed break-all h-80 overflow-y-auto whitespace-pre">
                            {privateKey || 'Private key will appear here...'}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
