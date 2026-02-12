'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dna, Copy, Check, RefreshCw, ArrowRight, BookOpen } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const GENETIC_CODE: Record<string, string> = {
    'UUU': 'Phe', 'UUC': 'Phe', 'UUA': 'Leu', 'UUG': 'Leu',
    'UCU': 'Ser', 'UCC': 'Ser', 'UCA': 'Ser', 'UCG': 'Ser',
    'UAU': 'Tyr', 'UAC': 'Tyr', 'UAA': 'STOP', 'UAG': 'STOP',
    'UGU': 'Cys', 'UGC': 'Cys', 'UGA': 'STOP', 'UGG': 'Trp',
    'CUU': 'Leu', 'CUC': 'Leu', 'CUA': 'Leu', 'CUG': 'Leu',
    'CCU': 'Pro', 'CCC': 'Pro', 'CCA': 'Pro', 'CCG': 'Pro',
    'CAU': 'His', 'CAC': 'His', 'CAA': 'Gln', 'CAG': 'Gln',
    'CGU': 'Arg', 'CGC': 'Arg', 'CGA': 'Arg', 'CGG': 'Arg',
    'AUU': 'Ile', 'AUC': 'Ile', 'AUA': 'Ile', 'AUG': 'Met (START)',
    'ACU': 'Thr', 'ACC': 'Thr', 'ACA': 'Thr', 'ACG': 'Thr',
    'AAU': 'Asn', 'AAC': 'Asn', 'AAA': 'Lys', 'AAG': 'Lys',
    'AGU': 'Ser', 'AGC': 'Ser', 'AGA': 'Arg', 'AGG': 'Arg',
    'GUU': 'Val', 'GUC': 'Val', 'GUA': 'Val', 'GUG': 'Val',
    'GCU': 'Ala', 'GCC': 'Ala', 'GCA': 'Ala', 'GCG': 'Ala',
    'GAU': 'Asp', 'GAC': 'Asp', 'GAA': 'Glu', 'GAG': 'Glu',
    'GGU': 'Gly', 'GGC': 'Gly', 'GGA': 'Gly', 'GGG': 'Gly',
};

export default function DnaToMrnaConverter() {
    const [dna, setDna] = useState('');
    const [mrna, setMrna] = useState('');
    const [protein, setProtein] = useState<string[]>([]);
    const { toast } = useToast();
    const [isCopied, setIsCopied] = useState(false);

    const convert = () => {
        const cleanedDna = dna.toUpperCase().replace(/[^ATCG]/g, '');
        if (!cleanedDna) {
            setMrna('');
            setProtein([]);
            return;
        }

        // Transcription: T -> A, A -> U, C -> G, G -> C
        const transcriptionMap: Record<string, string> = { 'A': 'U', 'T': 'A', 'C': 'G', 'G': 'C' };
        const resultMrna = cleanedDna.split('').map(base => transcriptionMap[base] || '?').join('');
        setMrna(resultMrna);

        // Translation: Split mRNA into codons (groups of 3)
        const codons = resultMrna.match(/.{1,3}/g) || [];
        const aminoAcids = codons.map(codon => {
            if (codon.length < 3) return '...';
            return GENETIC_CODE[codon] || 'Unknown';
        });
        setProtein(aminoAcids);
    };

    const copyMrna = () => {
        navigator.clipboard.writeText(mrna);
        setIsCopied(true);
        toast({ title: 'mRNA sequence copied' });
        setTimeout(() => setIsCopied(false), 2000);
    };

    return (
        <div className="container mx-auto py-10 px-4 max-w-4xl">
            <div className="flex flex-col items-center mb-10 text-center">
                <div className="p-4 rounded-2xl bg-primary/10 mb-4">
                    <Dna className="h-10 w-10 text-primary" />
                </div>
                <h1 className="text-4xl font-bold font-headline mb-2">DNA to mRNA Converter</h1>
                <p className="text-muted-foreground">Transcribe DNA sequences into messenger RNA and visualize the protein translation.</p>
            </div>

            <div className="space-y-8">
                <Card className="glass-panel">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <BookOpen className="h-5 w-5 text-primary" />
                            DNA Input
                        </CardTitle>
                        <CardDescription>Enter a DNA sequence (A, T, C, G). Non-standard characters will be ignored.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Textarea
                            value={dna}
                            onChange={(e) => {
                                setDna(e.target.value);
                                // Trigger live conversion
                            }}
                            onKeyUp={convert}
                            placeholder="ATGCCGTAG..."
                            className="min-h-[120px] font-mono text-lg tracking-widest uppercase"
                        />
                        <div className="flex justify-between items-center">
                            <p className="text-xs text-muted-foreground">Length: {dna.replace(/[^ATCG]/gi, '').length} bases</p>
                            <Button variant="outline" size="sm" onClick={() => { setDna(''); setMrna(''); setProtein([]); }}>
                                <RefreshCw className="mr-2 h-4 w-4" />
                                Clear
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {mrna && (
                    <div className="grid grid-cols-1 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <Card className="glass-panel border-primary/20 bg-primary/5">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground">mRNA Sequence (Transcription)</CardTitle>
                                <Button variant="ghost" size="icon" onClick={copyMrna}>
                                    {isCopied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                                </Button>
                            </CardHeader>
                            <CardContent>
                                <p className="font-mono text-xl tracking-[0.2em] break-all font-black text-primary">
                                    {mrna}
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="glass-panel">
                            <CardHeader>
                                <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground text-center">Protein Translation (Codons)</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-wrap gap-4 justify-center">
                                    {mrna.match(/.{1,3}/g)?.map((codon, i) => (
                                        <div key={i} className="flex flex-col items-center p-3 rounded-lg bg-muted/50 border border-border min-w-[80px]">
                                            <span className="text-xs text-muted-foreground mb-1 font-mono">{codon}</span>
                                            <ArrowRight className="h-3 w-3 text-muted-foreground/30 mb-1" />
                                            <span className={`font-bold text-sm ${protein[i] === 'STOP' ? 'text-red-500' : 'text-foreground'}`}>
                                                {protein[i]}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>

            <div className="mt-12 p-8 rounded-3xl bg-muted/20 border border-border">
                <h3 className="text-xl font-bold mb-4">Transcription Rules</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[
                        { from: 'Adenine (A)', to: 'Uracil (U)' },
                        { from: 'Thymine (T)', to: 'Adenine (A)' },
                        { from: 'Cytosine (C)', to: 'Guanine (G)' },
                        { from: 'Guanine (G)', to: 'Cytosine (C)' },
                    ].map((rule, i) => (
                        <div key={i} className="p-4 rounded-xl bg-background border border-border text-center">
                            <p className="text-[10px] text-muted-foreground font-bold uppercase">{rule.from}</p>
                            <ArrowRight className="h-4 w-4 mx-auto my-1 opacity-20" />
                            <p className="font-bold text-primary">{rule.to}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
