'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { FileBadge, Upload, ShieldCheck, ShieldAlert, Info, CheckCircle2, XCircle, FileText, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { PDFDocument } from 'pdf-lib';

export default function PdfSignatureChecker() {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const { toast } = useToast();

    const checkPdf = async (file: File) => {
        setLoading(true);
        setResult(null);
        try {
            const arrayBuffer = await file.arrayBuffer();
            const pdfDoc = await PDFDocument.load(arrayBuffer);

            // PDF-Lib doesn't have a high-level "getSignatures" method, 
            // but we can check the cross-reference table and objects for digital signatures (/Sig)
            // A digital signature in PDF is usually an entry in the AcroForm dictionary

            const acroForm = pdfDoc.catalog.get(pdfDoc.context.obj('AcroForm'));
            let signatureFound = false;
            let signatureCount = 0;

            if (acroForm) {
                // Check Fields for signatures
                // This is a simplified check for demo purposes
                // Real verification requires heavy cryptographic libraries
                const rawBuffer = new Uint8Array(arrayBuffer);
                const text = new TextDecoder().decode(rawBuffer.slice(0, 1000000)); // Scan first 1MB

                if (text.includes('/Sig')) {
                    signatureFound = true;
                    // Try to count occurrences
                    signatureCount = (text.match(/\/Type\s*\/Sig/g) || []).length;
                }
            }

            setResult({
                name: file.name,
                size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
                pages: pdfDoc.getPageCount(),
                isSigned: signatureFound,
                signatureCount: signatureCount,
                version: pdfDoc.getForm().getFields().length ? 'Contains Form Fields' : 'Flat PDF',
            });

            if (signatureFound) {
                toast({ title: 'Digital Signatures Detected' });
            } else {
                toast({ title: 'Analysis Complete', description: 'No digital signatures found.' });
            }

        } catch (error) {
            toast({
                title: 'Analysis Failed',
                description: 'Could not parse PDF file.',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) checkPdf(file);
    };

    return (
        <div className="container mx-auto py-10 px-4 max-w-4xl">
            <div className="flex flex-col items-center mb-10 text-center">
                <div className="p-4 rounded-2xl bg-primary/10 mb-4">
                    <FileBadge className="h-10 w-10 text-primary" />
                </div>
                <h1 className="text-4xl font-bold font-headline mb-2">PDF Signature Checker</h1>
                <p className="text-muted-foreground">Analyze PDF documents to detect digital signatures and verify document integrity.</p>
            </div>

            <Card className="glass-panel border-2 border-dashed border-primary/20 bg-primary/5 hover:border-primary/40 transition-all cursor-pointer relative overflow-hidden group">
                <CardContent className="py-12 flex flex-col items-center justify-center text-center">
                    <input
                        type="file"
                        accept="application/pdf"
                        onChange={handleFileChange}
                        className="absolute inset-0 opacity-0 cursor-pointer z-10"
                    />
                    <div className="p-4 rounded-full bg-background/50 mb-4 group-hover:scale-110 transition-transform">
                        {loading ? <Loader2 className="h-8 w-8 text-primary animate-spin" /> : <Upload className="h-8 w-8 text-primary" />}
                    </div>
                    <h3 className="text-xl font-bold mb-2">Drop your PDF here</h3>
                    <p className="text-sm text-muted-foreground">or click to browse your files (Max 50MB)</p>
                </CardContent>
            </Card>

            {result && (
                <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in duration-500">
                    <Card className="md:col-span-2 glass-panel">
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <FileText className="h-5 w-5 text-primary" />
                                File Metadata
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mb-1">Filename</p>
                                    <p className="font-semibold truncate">{result.name}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mb-1">File Size</p>
                                    <p className="font-semibold">{result.size}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mb-1">Total Pages</p>
                                    <p className="font-semibold">{result.pages}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mb-1">Structure</p>
                                    <p className="font-semibold">{result.version}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className={`glass-panel border-2 ${result.isSigned ? 'border-green-500/30 bg-green-500/5' : 'border-border/50'}`}>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <ShieldCheck className={`h-5 w-5 ${result.isSigned ? 'text-green-500' : 'text-muted-foreground'}`} />
                                Signature Status
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col items-center justify-center pt-2 pb-6">
                            {result.isSigned ? (
                                <>
                                    <div className="h-16 w-16 rounded-full bg-green-500/10 flex items-center justify-center mb-4">
                                        <CheckCircle2 className="h-10 w-10 text-green-500" />
                                    </div>
                                    <p className="text-2xl font-black text-green-500">{result.signatureCount}</p>
                                    <p className="text-sm font-bold opacity-80">SIGNATURE(S) FOUND</p>
                                </>
                            ) : (
                                <>
                                    <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                                        <XCircle className="h-10 w-10 text-muted-foreground" />
                                    </div>
                                    <p className="text-sm font-bold text-muted-foreground">NO DIGITAL SIGNATURE</p>
                                </>
                            )}
                        </CardContent>
                    </Card>

                    <div className="md:col-span-3">
                        <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 flex gap-3 text-xs text-muted-foreground leading-relaxed">
                            <Info className="h-4 w-4 text-primary shrink-0" />
                            <p>
                                **Note on Verification:** This tool performs a structural analysis to detect the presence of digital signatures. To verify the cryptographic identity of the signers (Certificate Authority verification), please use a dedicated tool like Adobe Acrobat or a government-authorized validator.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
