'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Lock, Unlock, Copy, Check, Eye, EyeOff, ShieldCheck, ShieldAlert } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import CryptoJS from 'crypto-js';

export default function EncryptDecryptTextClient() {
    const [key, setKey] = useState('');
    const [showKey, setShowKey] = useState(false);
    const [plainText, setPlainText] = useState('');
    const [cipherText, setCipherText] = useState('');
    const [inputCipher, setInputCipher] = useState('');
    const [outputPlain, setOutputPlain] = useState('');
    const { toast } = useToast();
    const [isCopied, setIsCopied] = useState(false);

    const encrypt = () => {
        if (!plainText || !key) return;
        try {
            const encrypted = CryptoJS.AES.encrypt(plainText, key).toString();
            setCipherText(encrypted);
            toast({ title: 'Encryption successful' });
        } catch (error) {
            toast({
                title: 'Encryption Error',
                description: 'Failed to encrypt text.',
                variant: 'destructive',
            });
        }
    };

    const decrypt = () => {
        if (!inputCipher || !key) return;
        try {
            const bytes = CryptoJS.AES.decrypt(inputCipher, key);
            const decrypted = bytes.toString(CryptoJS.enc.Utf8);
            if (!decrypted) throw new Error('Invalid key or corrupted data');
            setOutputPlain(decrypted);
            toast({ title: 'Decryption successful' });
        } catch (error) {
            toast({
                title: 'Decryption Error',
                description: 'Failed to decrypt. Ensure your key is correct.',
                variant: 'destructive',
            });
            setOutputPlain('');
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setIsCopied(true);
        toast({ title: 'Copied to clipboard' });
        setTimeout(() => setIsCopied(false), 2000);
    };

    return (
        <div className="container mx-auto py-10 px-4 max-w-4xl">
            <div className="flex flex-col items-center mb-10 text-center">
                <div className="p-4 rounded-2xl bg-primary/10 mb-4">
                    <Lock className="h-10 w-10 text-primary" />
                </div>
                <h1 className="text-4xl font-bold font-headline mb-2">Encrypt / Decrypt Text</h1>
                <p className="text-muted-foreground">Secure your sensitive information using industry-standard AES (Advanced Encryption Standard).</p>
            </div>

            <Card className="glass-panel mb-8 border-primary/20 bg-primary/5">
                <CardContent className="pt-6">
                    <div className="space-y-2">
                        <Label htmlFor="key" className="flex items-center gap-2">
                            <ShieldCheck className="h-4 w-4 text-primary" />
                            Secret Encryption Key (Passphrase)
                        </Label>
                        <div className="relative">
                            <Input
                                id="key"
                                type={showKey ? 'text' : 'password'}
                                value={key}
                                onChange={(e) => setKey(e.target.value)}
                                placeholder="Enter a strong unique secret key..."
                                className="pr-12"
                            />
                            <button
                                className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                                onClick={() => setShowKey(!showKey)}
                            >
                                {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Tabs defaultValue="encrypt" className="w-full">
                <TabsList className="grid w-full grid-cols-2 h-12 mb-8 glass-panel p-1">
                    <TabsTrigger value="encrypt" className="text-lg">Encrypt</TabsTrigger>
                    <TabsTrigger value="decrypt" className="text-lg">Decrypt</TabsTrigger>
                </TabsList>

                <TabsContent value="encrypt">
                    <Card className="glass-panel">
                        <CardHeader>
                            <CardTitle className="text-lg">AES Encryption</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="plain">Plain Text</Label>
                                <Textarea
                                    id="plain"
                                    value={plainText}
                                    onChange={(e) => setPlainText(e.target.value)}
                                    placeholder="Enter text to encrypt..."
                                    className="min-h-[150px]"
                                />
                            </div>
                            <Button className="w-full h-12 text-lg font-bold glow-button" onClick={encrypt} disabled={!plainText || !key}>
                                <Lock className="mr-2 h-5 w-5" />
                                Encrypt Text
                            </Button>

                            {cipherText && (
                                <div className="mt-8 space-y-2">
                                    <Label>Encrypted Result (Ciphertext)</Label>
                                    <div className="p-4 rounded-xl bg-muted/50 border border-border font-mono text-sm break-all relative group h-40 overflow-y-auto">
                                        {cipherText}
                                        <Button
                                            size="sm"
                                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                            onClick={() => copyToClipboard(cipherText)}
                                        >
                                            {isCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                        </Button>
                                    </div>
                                    <p className="text-[10px] text-muted-foreground italic flex items-center gap-1">
                                        <ShieldAlert className="h-3 w-3" />
                                        Encryption is client-side only. Your key and text never leave the browser.
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="decrypt">
                    <Card className="glass-panel">
                        <CardHeader>
                            <CardTitle className="text-lg">AES Decryption</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="cipher">Encrypted Text (Ciphertext)</Label>
                                <Textarea
                                    id="cipher"
                                    value={inputCipher}
                                    onChange={(e) => setInputCipher(e.target.value)}
                                    placeholder="Paste the encrypted text here..."
                                    className="min-h-[150px] font-mono text-xs"
                                />
                            </div>
                            <Button className="w-full h-12 text-lg font-bold glow-button" onClick={decrypt} disabled={!inputCipher || !key}>
                                <Unlock className="mr-2 h-5 w-5" />
                                Decrypt Text
                            </Button>

                            {outputPlain && (
                                <div className="mt-8 space-y-2">
                                    <Label>Decrypted Message</Label>
                                    <div className="p-4 rounded-xl bg-muted/50 border border-green-500/30 font-medium relative group min-h-[100px] flex items-center justify-center text-center">
                                        {outputPlain}
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                            onClick={() => copyToClipboard(outputPlain)}
                                        >
                                            {isCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
