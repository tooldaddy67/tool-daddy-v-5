'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { MessageCircle, Copy, Check, ExternalLink, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function WhatsAppLinkGenerator() {
    const [phone, setPhone] = useState('');
    const [message, setMessage] = useState('');
    const [generatedLink, setGeneratedLink] = useState('');
    const { toast } = useToast();
    const [isCopied, setIsCopied] = useState(false);

    const generateLink = () => {
        if (!phone) {
            toast({
                title: 'Error',
                description: 'Please enter a phone number.',
                variant: 'destructive',
            });
            return;
        }

        // Clean phone number: remove +, spaces, dashes
        const cleanPhone = phone.replace(/\D/g, '');
        const encodedMessage = encodeURIComponent(message);
        const link = `https://wa.me/${cleanPhone}${message ? `?text=${encodedMessage}` : ''}`;

        setGeneratedLink(link);
    };

    const copyToClipboard = () => {
        if (!generatedLink) return;
        navigator.clipboard.writeText(generatedLink);
        setIsCopied(true);
        toast({ title: 'Link copied to clipboard' });
        setTimeout(() => setIsCopied(false), 2000);
    };

    const resetFields = () => {
        setPhone('');
        setMessage('');
        setGeneratedLink('');
    };

    return (
        <div className="container mx-auto py-10 px-4 max-w-4xl">
            <div className="flex flex-col items-center mb-10 text-center">
                <div className="p-4 rounded-2xl bg-primary/10 mb-4">
                    <MessageCircle className="h-10 w-10 text-primary" />
                </div>
                <h1 className="text-4xl font-bold font-headline mb-2">WhatsApp Link Generator</h1>
                <p className="text-muted-foreground">Create direct chat links for your WhatsApp number without saving contacts.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card className="glass-panel">
                    <CardHeader>
                        <CardTitle className="text-lg">Generator Settings</CardTitle>
                        <CardDescription>Enter details to generate your link.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number (with Country Code)</Label>
                            <Input
                                id="phone"
                                type="text"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="e.g. 1234567890"
                                className="h-12"
                            />
                            <p className="text-[10px] text-muted-foreground">Include country code without + or 00 (e.g. 1 for US, 44 for UK).</p>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="message">Pre-filled Message (Optional)</Label>
                            <Textarea
                                id="message"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Hello, I'm interested in..."
                                className="min-h-[120px]"
                            />
                        </div>
                        <div className="flex gap-2">
                            <Button className="flex-1 h-12 text-lg font-bold glow-button" onClick={generateLink}>
                                Generate Link
                            </Button>
                            <Button variant="outline" size="icon" className="h-12 w-12" onClick={resetFields}>
                                <RefreshCw className="h-5 w-5" />
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <Card className="glass-panel flex flex-col">
                    <CardHeader>
                        <CardTitle className="text-lg">Generated Link</CardTitle>
                        <CardDescription>Your clickable WhatsApp link will appear here.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col justify-center gap-6">
                        {generatedLink ? (
                            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 break-all font-mono text-sm text-center">
                                    {generatedLink}
                                </div>
                                <div className="flex flex-col gap-3">
                                    <Button className="w-full h-12" onClick={copyToClipboard}>
                                        {isCopied ? <Check className="mr-2 h-5 w-5 text-green-500" /> : <Copy className="mr-2 h-5 w-5" />}
                                        {isCopied ? 'Copied!' : 'Copy Link'}
                                    </Button>
                                    <Button variant="outline" className="w-full h-12" asChild>
                                        <a href={generatedLink} target="_blank" rel="noopener noreferrer">
                                            <ExternalLink className="mr-2 h-5 w-5" />
                                            Open in WhatsApp
                                        </a>
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-border rounded-xl opacity-50">
                                <MessageCircle className="h-12 w-12 mb-4 text-muted-foreground" />
                                <p>Fill in the settings to generate your link.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <div className="mt-12 p-6 rounded-2xl bg-muted/30 border border-border">
                <h3 className="text-xl font-bold mb-4">How to use</h3>
                <ul className="space-y-2 text-sm text-muted-foreground list-disc pl-5">
                    <li>Enter your full phone number including the international country code.</li>
                    <li>Omit any zeroes, brackets, or dashes from the phone number.</li>
                    <li>Add an optional message that will appear in the user's text field when they click the link.</li>
                    <li>Copy the link and use it in your Instagram bio, website, or email signature.</li>
                </ul>
            </div>
        </div>
    );
}
