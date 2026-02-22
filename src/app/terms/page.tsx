import { Metadata } from 'next';
import { Gavel, Scale, AlertTriangle, UserCheck, Zap, StopCircle } from 'lucide-react';

export const metadata: Metadata = {
    title: 'Terms of Service | Tool Daddy',
    description: 'The rules of the game at Tool Daddy.',
};

export default function TermsPage() {
    const lastUpdated = "February 22, 2026";

    return (
        <div className="min-h-screen bg-transparent py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                {/* Header Section */}
                <div className="text-center mb-16 space-y-4">
                    <div className="inline-flex items-center justify-center p-3 bg-amber-500/10 rounded-2xl mb-4">
                        <Scale className="h-8 w-8 text-amber-500" />
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black tracking-tight text-foreground uppercase italic">
                        Terms of <span className="text-amber-500">Service</span>
                    </h1>
                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                        Rules, responsibilities, and the fine print. Let's keep Tool Daddy a safe and useful place for everyone.
                    </p>
                    <div className="text-xs font-mono uppercase tracking-widest opacity-50">
                        Version 1.0 • {lastUpdated}
                    </div>
                </div>

                {/* Content Card */}
                <div className="bg-card/40 backdrop-blur-xl border border-border/40 rounded-[2rem] p-8 md:p-12 shadow-2xl space-y-12">

                    {/* Section 1: Acceptance */}
                    <section className="space-y-4">
                        <div className="flex items-center gap-3 text-2xl font-bold italic uppercase tracking-tighter">
                            <Gavel className="text-amber-500 h-6 w-6" />
                            <h2>1. Agreement to Terms</h2>
                        </div>
                        <p className="text-muted-foreground leading-relaxed">
                            By accessing Tool Daddy, you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, you are prohibited from using our services.
                        </p>
                    </section>

                    {/* Section 2: AI Responsibility */}
                    <section className="space-y-4">
                        <div className="flex items-center gap-3 text-2xl font-bold italic uppercase tracking-tighter text-blue-500">
                            <Zap className="h-6 w-6" />
                            <h2>2. AI Content Disclaimer</h2>
                        </div>
                        <p className="text-muted-foreground leading-relaxed">
                            Tool Daddy provides various AI-powered conversion and generation tools.
                        </p>
                        <div className="p-6 bg-blue-500/5 border border-blue-500/10 rounded-2xl space-y-3">
                            <p className="text-sm font-bold text-blue-400 uppercase tracking-widest">Crucial Note:</p>
                            <p className="text-sm text-muted-foreground italic">
                                "AI-generated results (including text humanization, code modification, and data parsing) are probabilistic. We do NOT guarantee 100% accuracy. Users are solely responsible for verifying the output before using it in critical applications, legal documents, or academic work."
                            </p>
                        </div>
                    </section>

                    {/* Section 3: Proper Use */}
                    <section className="space-y-4">
                        <div className="flex items-center gap-3 text-2xl font-bold italic uppercase tracking-tighter text-green-500">
                            <UserCheck className="h-6 w-6" />
                            <h2>3. Acceptable Use</h2>
                        </div>
                        <p className="text-muted-foreground leading-relaxed">
                            You agree to use Tool Daddy only for lawful purposes. Prohibited activities include:
                        </p>
                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                            <li className="flex items-center gap-2 p-3 bg-muted/20 rounded-lg">
                                <StopCircle className="h-4 w-4 text-red-500" /> Automated scraping or botting
                            </li>
                            <li className="flex items-center gap-2 p-3 bg-muted/20 rounded-lg">
                                <StopCircle className="h-4 w-4 text-red-500" /> Bypassing daily rate limits
                            </li>
                            <li className="flex items-center gap-2 p-3 bg-muted/20 rounded-lg">
                                <StopCircle className="h-4 w-4 text-red-500" /> Reverse engineering the AI flows
                            </li>
                            <li className="flex items-center gap-2 p-3 bg-muted/20 rounded-lg">
                                <StopCircle className="h-4 w-4 text-red-500" /> Uploading malicious payloads
                            </li>
                        </ul>
                    </section>

                    {/* Section 4: Limitation of Liability */}
                    <section className="space-y-4">
                        <div className="flex items-center gap-2 text-2xl font-bold italic uppercase tracking-tighter text-red-500 font-headline">
                            <AlertTriangle className="h-6 w-6" />
                            <h2>4. Limitation of Liability</h2>
                        </div>
                        <p className="text-muted-foreground leading-relaxed text-sm">
                            TOOL DADDY AND ITS CREATORS SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES, RESULTING FROM:
                        </p>
                        <div className="text-xs uppercase font-mono opacity-60 leading-loose border-l-2 border-red-500/20 pl-4">
                            (I) YOUR ACCESS TO OR USE OF OR INABILITY TO ACCESS OR USE THE SERVICES; (II) ANY CONDUCT OR CONTENT OF ANY THIRD PARTY ON THE SERVICES; (III) ANY CONTENT OBTAINED FROM THE SERVICES.
                        </div>
                    </section>

                    {/* Section 5: Termination */}
                    <section className="space-y-4">
                        <div className="text-2xl font-bold italic uppercase tracking-tighter">
                            <h2>5. Account Termination</h2>
                        </div>
                        <p className="text-muted-foreground leading-relaxed">
                            We reserve the right to terminate or suspend your access immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
                        </p>
                    </section>

                    {/* Final Clause */}
                    <div className="pt-12 border-t border-border/10 text-center space-y-2">
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            These terms are governed by the laws of the jurisdiction in which the operator resides.
                        </p>
                        <p className="text-xs font-bold text-primary uppercase tracking-widest">
                            Tool Daddy • Build Smarter, Not Harder.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
