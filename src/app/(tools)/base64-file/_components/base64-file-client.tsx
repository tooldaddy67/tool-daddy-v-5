'use client';

import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { FileUp, FileDown, Copy, Check, Trash2, Download, Eye, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';

export default function Base64FileClient() {
    const [fileBase64, setFileBase64] = useState('');
    const [fileName, setFileName] = useState('');
    const [fileType, setFileType] = useState('');
    const [mode, setMode] = useState<'encode' | 'decode'>('encode');
    const { toast } = useToast();
    const [isCopied, setIsCopied] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [decodedText, setDecodedText] = useState<string | null>(null);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Security check: Limit file size to 10MB
        if (file.size > 10 * 1024 * 1024) {
            toast({
                title: 'File Too Large',
                description: 'Please select a file smaller than 10MB.',
                variant: 'destructive'
            });
            return;
        }

        setFileName(file.name);
        setFileType(file.type);

        const reader = new FileReader();
        reader.onload = (event) => {
            const result = event.target?.result as string;
            const split = result.split(',');
            const base64Content = split.length > 1 ? split[1] : split[0];
            setFileBase64(base64Content);

            // For text preview
            if (file.type.startsWith('text/') || file.name.endsWith('.json') || file.name.endsWith('.svg')) {
                const decoder = new TextDecoder();
                const binary = atob(base64Content);
                const bytes = new Uint8Array(binary.length);
                for (let i = 0; i < binary.length; i++) {
                    bytes[i] = binary.charCodeAt(i);
                }
                setDecodedText(decoder.decode(bytes));
            } else {
                setDecodedText(null);
            }

            toast({ title: 'File converted to Base64' });
        };
        reader.onerror = () => {
            toast({ title: 'Upload Failed', variant: 'destructive' });
        };
        reader.readAsDataURL(file);
    };

    const downloadFile = () => {
        if (!fileBase64) return;
        try {
            // Clean the base64 string of any whitespaces or newlines
            const cleanBase64 = fileBase64.replace(/\s/g, '');
            const binary = atob(cleanBase64);
            const bytes = new Uint8Array(binary.length);
            for (let i = 0; i < binary.length; i++) {
                bytes[i] = binary.charCodeAt(i);
            }
            const blob = new Blob([bytes], { type: fileType || 'application/octet-stream' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName || 'downloaded-file';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (err) {
            toast({ title: 'Download Failed', description: 'Invalid Base64 data', variant: 'destructive' });
        }
    };

    const copyToClipboard = () => {
        if (!fileBase64) return;
        navigator.clipboard.writeText(fileBase64.replace(/\s/g, ''));
        setIsCopied(true);
        toast({ title: 'Base64 copied to clipboard' });
        setTimeout(() => setIsCopied(false), 2000);
    };

    const handleBase64InputChange = (val: string) => {
        const clean = val.replace(/^data:.*?;base64,/, '').replace(/\s/g, '');
        setFileBase64(clean);

        // Try to generate a preview if it looks like text or image
        if (mode === 'decode' && clean.length > 0) {
            try {
                const binary = atob(clean);
                // Simple heuristic for text: check if it's mostly printable characters
                // Or if user set fileType to text
                if (fileType.startsWith('text/') || (fileType === '' && binary.length < 10000)) {
                    const bytes = new Uint8Array(binary.length);
                    for (let i = 0; i < binary.length; i++) {
                        bytes[i] = binary.charCodeAt(i);
                    }
                    setDecodedText(new TextDecoder().decode(bytes));
                }
            } catch (e) {
                setDecodedText(null);
            }
        }
    };

    const reset = () => {
        setFileBase64('');
        setFileName('');
        setFileType('');
        setDecodedText(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const isImage = fileType.startsWith('image/') || (mode === 'decode' && fileBase64 && (fileBase64.startsWith('iVBORw') || fileBase64.startsWith('/9j/')));
    const isTextPreviewable = decodedText !== null;

    return (
        <div className="container mx-auto py-10 px-4 max-w-5xl">
            <div className="flex flex-col items-center mb-10 text-center">
                <div className="p-4 rounded-2xl bg-primary/10 mb-4">
                    {mode === 'encode' ? <FileUp className="h-10 w-10 text-primary" /> : <FileDown className="h-10 w-10 text-primary" />}
                </div>
                <h1 className="text-4xl font-bold font-headline mb-2">Base64 File {mode === 'encode' ? 'Encoder' : 'Decoder'}</h1>
                <p className="text-muted-foreground">Convert files to Base64 strings or reconstruct files from Base64 data.</p>
            </div>

            <div className="flex flex-col md:flex-row gap-8">
                <Card className="flex-1 glass-panel border-primary/20">
                    <CardHeader className="pb-4">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">Input Area</CardTitle>
                            <div className="flex gap-2">
                                <Button
                                    variant={mode === 'encode' ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => { setMode('encode'); reset(); }}
                                >
                                    File to Text
                                </Button>
                                <Button
                                    variant={mode === 'decode' ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => { setMode('decode'); reset(); }}
                                >
                                    Text to File
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {mode === 'encode' ? (
                            <div className="space-y-4">
                                <div className="border-2 border-dashed border-primary/20 rounded-2xl p-8 flex flex-col items-center justify-center bg-primary/5 hover:bg-primary/10 transition-colors cursor-pointer"
                                    onClick={() => fileInputRef.current?.click()}>
                                    <FileUp className="h-12 w-12 text-primary/40 mb-4" />
                                    <p className="text-sm font-bold">Click to Upload File</p>
                                    <p className="text-xs text-muted-foreground mt-1">Maximum file size: 10MB</p>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        className="hidden"
                                        onChange={handleFileUpload}
                                    />
                                </div>
                                {fileName && (
                                    <div className="p-4 rounded-xl bg-background/50 border border-border flex items-center gap-3">
                                        <FileText className="h-5 w-5 text-primary" />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-bold truncate">{fileName}</p>
                                            <p className="text-[10px] text-muted-foreground uppercase">{fileType || 'binary'}</p>
                                        </div>
                                        <Button variant="ghost" size="sm" onClick={reset}>
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <Label className="text-xs font-bold uppercase opacity-50">Paste Base64 Data</Label>
                                <Textarea
                                    placeholder="Paste Base64 string here..."
                                    className="min-h-[200px] font-mono text-xs bg-background/50"
                                    value={fileBase64}
                                    onChange={(e) => handleBase64InputChange(e.target.value)}
                                />
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase opacity-50">Set File Name</Label>
                                        <input
                                            placeholder="filename.ext"
                                            className="w-full h-10 px-3 rounded-md bg-background/50 border border-border text-xs"
                                            value={fileName}
                                            onChange={(e) => setFileName(e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase opacity-50">Set MIME Type (Optional)</Label>
                                        <input
                                            placeholder="image/png, application/pdf"
                                            className="w-full h-10 px-3 rounded-md bg-background/50 border border-border text-xs"
                                            value={fileType}
                                            onChange={(e) => setFileType(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card className="flex-1 glass-panel bg-primary/5 border-primary/30 flex flex-col">
                    <CardHeader className="flex flex-row items-center justify-between pb-4">
                        <CardTitle className="text-lg">Preview & Output</CardTitle>
                        <div className="flex gap-2">
                            {fileBase64 && mode === 'encode' && (
                                <Button variant="outline" size="sm" onClick={copyToClipboard}>
                                    {isCopied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                                    Copy String
                                </Button>
                            )}
                            {fileBase64 && mode === 'decode' && (
                                <Button variant="default" size="sm" onClick={downloadFile}>
                                    <Download className="h-4 w-4 mr-2" />
                                    Download File
                                </Button>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col gap-6">
                        {fileBase64 && isImage ? (
                            <div className="relative aspect-video w-full rounded-2xl overflow-hidden border-2 border-primary/20 bg-black/20 flex items-center justify-center">
                                <img
                                    src={`data:${fileType || (fileBase64.startsWith('iVBORw') ? 'image/png' : 'image/jpeg')};base64,${fileBase64}`}
                                    alt="Preview"
                                    className="max-h-full object-contain"
                                />
                                <div className="absolute top-4 right-4 p-2 bg-background/80 blur-backdrop rounded-lg border border-border text-[10px] font-bold uppercase">
                                    Image Preview
                                </div>
                            </div>
                        ) : isTextPreviewable ? (
                            <div className="aspect-video w-full rounded-2xl border-2 border-primary/20 bg-background/50 overflow-hidden flex flex-col">
                                <div className="px-4 py-2 bg-primary/10 border-b border-primary/20 text-[10px] font-bold uppercase flex justify-between items-center">
                                    <span>Text Preview</span>
                                    <span className="opacity-50">{decodedText!.length} chars</span>
                                </div>
                                <div className="flex-1 p-4 font-mono text-[10px] overflow-auto whitespace-pre-wrap">
                                    {decodedText}
                                </div>
                            </div>
                        ) : fileBase64 ? (
                            <div className="aspect-video w-full rounded-2xl border-2 border-dashed border-border flex flex-col items-center justify-center bg-background/50">
                                <FileText className="h-16 w-16 text-muted-foreground opacity-20 mb-4" />
                                <p className="text-sm font-bold text-muted-foreground">Preview not available for this type</p>
                                <p className="text-[10px] text-muted-foreground/50 mt-1">{fileType || 'unknown binary'}</p>
                            </div>
                        ) : (
                            <div className="aspect-video w-full rounded-2xl border-2 border-dashed border-border flex flex-col items-center justify-center opacity-30">
                                <Eye className="h-16 w-16 mb-4" />
                                <p className="text-sm">No data to preview</p>
                            </div>
                        )}

                        {mode === 'encode' && fileBase64 && (
                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase opacity-50">Base64 Output</Label>
                                <div className="p-4 rounded-xl bg-background/50 border border-border font-mono text-[10px] break-all max-h-[150px] overflow-y-auto">
                                    {fileBase64}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

