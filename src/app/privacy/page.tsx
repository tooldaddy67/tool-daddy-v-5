import { Metadata } from 'next';
import { Shield, Lock, Eye, Clock, Cpu, Trash2, Globe } from 'lucide-react';

export const metadata: Metadata = {
    title: 'Privacy Policy | Tool Daddy',
    description: 'Learn how Tool Daddy protects your data and privacy.',
};

export default function PrivacyPage() {
    const lastUpdated = "February 22, 2026";

    return (
        <div className="min-h-screen bg-transparent py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                {/* Header Section */}
                <div className="text-center mb-16 space-y-4">
                    <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-2xl mb-4">
                        <Shield className="h-8 w-8 text-primary" />
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black tracking-tight text-foreground uppercase italic">
                        Privacy <span className="text-primary">Policy</span>
                    </h1>
                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                        Your trust is our most valuable asset. Here's how we protect your data while you build, convert, and create.
                    </p>
                    <div className="text-xs font-mono uppercase tracking-widest opacity-50">
                        Last Updated: {lastUpdated}
                    </div>
                </div>

                {/* Content Card */}
                <div className="bg-card/40 backdrop-blur-xl border border-border/40 rounded-[2rem] p-8 md:p-12 shadow-2xl space-y-12">

                    {/* Section 1: Overview */}
                    <section className="space-y-4">
                        <div className="flex items-center gap-3 text-2xl font-bold italic uppercase tracking-tighter">
                            <Eye className="text-primary h-6 w-6" />
                            <h2>1. Information We Collect</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                            <div className="p-6 bg-muted/30 rounded-2xl border border-border/10">
                                <h3 className="font-bold text-lg mb-2">Profile Data</h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    When you sign up using our OTP (One-Time Password) system, we collect your <strong>Email Address</strong>. We may also store your username and avatar for personalization.
                                </p>
                            </div>
                            <div className="p-6 bg-muted/30 rounded-2xl border border-border/10">
                                <h3 className="font-bold text-lg mb-2">Usage Data</h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    We track which tools you use and the frequency of execution. This helps us optimize performance and manage AI quotas.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Section 2: AI Disclosure */}
                    <section className="space-y-4">
                        <div className="flex items-center gap-3 text-2xl font-bold italic uppercase tracking-tighter text-blue-500">
                            <Cpu className="h-6 w-6" />
                            <h2>2. AI Processing Disclosure</h2>
                        </div>
                        <p className="text-muted-foreground leading-relaxed">
                            Many of our advanced features are powered by <strong>Google Gemini API</strong>.
                        </p>
                        <div className="bg-blue-500/5 border border-blue-500/10 rounded-2xl p-6 italic">
                            "Input data provided to AI tools is securely transmitted to Google for real-time processing. We do not use your private inputs to train our own models, and we adhere to Google's Enterprise Privacy standards."
                        </div>
                    </section>

                    {/* Section 3: Retention & Deletion */}
                    <section className="space-y-4">
                        <div className="flex items-center gap-3 text-2xl font-bold italic uppercase tracking-tighter text-red-500">
                            <Clock className="h-6 w-6" />
                            <h2>3. Data Retention & Cleanup</h2>
                        </div>
                        <p className="text-muted-foreground leading-relaxed">
                            We believe in data minimization. We don't keep your data longer than necessary.
                        </p>
                        <div className="flex items-start gap-4 p-6 bg-red-500/5 border border-red-500/10 rounded-2xl">
                            <Trash2 className="h-6 w-6 text-red-500 shrink-0 mt-1" />
                            <div>
                                <h3 className="font-bold text-red-500 mb-1">90-Day Auto-Cleanup Policy</h3>
                                <p className="text-sm text-muted-foreground">
                                    Inactive accounts that have not been logged into for more than <strong>90 consecutive days</strong> are automatically purged from our systems, including your Auth profile and all usage history.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Section 4: Security */}
                    <section className="space-y-4">
                        <div className="flex items-center gap-3 text-2xl font-bold italic uppercase tracking-tighter text-green-500">
                            <Lock className="h-6 w-6" />
                            <h2>4. Security Measures</h2>
                        </div>
                        <p className="text-muted-foreground leading-relaxed">
                            We implement industry-standard security measures, including:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground ml-4">
                            <li><strong>reCAPTCHA v3</strong>: Protection against bot attacks and spam.</li>
                            <li><strong>End-to-End Encryption</strong>: All data is encrypted in transit using SSL/TLS.</li>
                            <li><strong>Secure OTP</strong>: No passwords are stored; access is verified via unique codes sent to your email.</li>
                        </ul>
                    </section>

                    {/* Section 5: Cookies */}
                    <section className="space-y-4">
                        <div className="flex items-center gap-3 text-2xl font-bold italic uppercase tracking-tighter text-orange-500">
                            <Globe className="h-6 w-6" />
                            <h2>5. Third-Party Services</h2>
                        </div>
                        <p className="text-muted-foreground leading-relaxed">
                            We use the following third-party services to enhance your experience:
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="p-4 bg-muted/20 rounded-xl text-center border border-border/5">
                                <span className="font-bold block">Firebase</span>
                                <span className="text-[10px] uppercase opacity-50 font-mono">Auth & Hosting</span>
                            </div>
                            <div className="p-4 bg-muted/20 rounded-xl text-center border border-border/5">
                                <span className="font-bold block">Supabase</span>
                                <span className="text-[10px] uppercase opacity-50 font-mono">Database</span>
                            </div>
                            <div className="p-4 bg-muted/20 rounded-xl text-center border border-border/5">
                                <span className="font-bold block">Google Analytics</span>
                                <span className="text-[10px] uppercase opacity-50 font-mono">Monitoring</span>
                            </div>
                        </div>
                    </section>

                    {/* Footer Info */}
                    <div className="pt-12 border-t border-border/10 text-center">
                        <p className="text-sm text-muted-foreground italic">
                            Questions about our privacy practices? Contact us through our <a href="/feedback" className="text-primary underline">Feedback Board</a>.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
