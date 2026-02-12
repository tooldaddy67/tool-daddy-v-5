'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, ExternalLink, ShieldCheck, Zap, Info } from 'lucide-react';

function RedirectContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const targetUrl = searchParams.get('to');
    const toolName = searchParams.get('name') || 'External Tool';

    const [countdown, setCountdown] = useState(5);
    const [isRedirecting, setIsRedirecting] = useState(false);

    useEffect(() => {
        if (!targetUrl) {
            router.push('/');
            return;
        }

        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    // Use a local function or direct call to avoid dependency issues if handleRedirect isn't memoized
                    // But here we can just define logic inline or use the function below
                    if (targetUrl) {
                        setIsRedirecting(true);
                        window.location.href = targetUrl;
                    }
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [targetUrl, router]);

    const handleRedirect = () => {
        if (!targetUrl) return;
        setIsRedirecting(true);
        window.location.href = targetUrl;
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[#020617] relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px] animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] animate-pulse delay-700" />

            <div className="max-w-xl w-full space-y-8 relative z-10">
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-black font-headline tracking-tight text-white">Redirecting to {toolName}</h1>
                    <p className="text-muted-foreground">Please wait while we prepare your tool...</p>
                </div>

                {/* AD SLOT CONTAINER */}
                <Card className="glass-panel border-primary/20 bg-primary/5 overflow-hidden group">
                    <div className="p-1 bg-gradient-to-r from-primary/50 via-blue-500/50 to-primary/50 animate-gradient-x" />
                    <CardHeader className="text-center pb-2">
                        <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                            <Zap className="h-6 w-6 text-primary" />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary/50">Sponsored Advertisement</span>
                        <CardTitle className="text-xl">Unlock Premium Speed</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6 text-center">
                        <p className="text-sm text-muted-foreground px-4">
                            Tired of waiting? Get instant access to all tools and go Ad-Free with Tool Daddy Pro.
                            Support the developers and enjoy priority processing!
                        </p>
                        <div className="flex justify-center gap-4">
                            <Button className="glow-button h-11 px-8 font-bold">Get Pro Now</Button>
                        </div>
                    </CardContent>
                </Card>

                <div className="flex flex-col items-center gap-6">
                    <div className="relative flex items-center justify-center w-24 h-24">
                        <svg className="w-full h-full -rotate-90">
                            <circle
                                cx="48"
                                cy="48"
                                r="40"
                                stroke="currentColor"
                                strokeWidth="4"
                                fill="transparent"
                                className="text-primary/10"
                            />
                            <circle
                                cx="48"
                                cy="48"
                                r="40"
                                stroke="currentColor"
                                strokeWidth="4"
                                fill="transparent"
                                strokeDasharray={251.2}
                                strokeDashoffset={251.2 - (251.2 * (5 - countdown)) / 5}
                                className="text-primary transition-all duration-1000 ease-linear"
                            />
                        </svg>
                        <span className="absolute text-3xl font-black text-white">{countdown}</span>
                    </div>

                    <div className="flex flex-col w-full gap-3">
                        <Button
                            onClick={handleRedirect}
                            disabled={isRedirecting}
                            className="w-full h-14 text-lg font-bold glow-button"
                        >
                            {isRedirecting ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    Redirecting...
                                </>
                            ) : (
                                <>
                                    Skip to Tool
                                    <ExternalLink className="ml-2 h-5 w-5" />
                                </>
                            )}
                        </Button>
                        <p className="text-[11px] text-center text-muted-foreground flex items-center justify-center gap-2">
                            <ShieldCheck className="h-3 w-3" />
                            Secure link verified by Tool Daddy Security
                        </p>
                    </div>
                </div>

                <div className="p-6 rounded-2xl bg-white/5 border border-white/10 flex gap-4">
                    <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <p className="text-xs text-muted-foreground leading-relaxed">
                        You are being redirected to an external website. Tool Daddy is not responsible for the content,
                        privacy policies, or practices of third-party sites or services.
                    </p>
                </div>
            </div>
        </div>
    );
}

export default function ExternalRedirectPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-[#020617] text-white">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        }>
            <RedirectContent />
        </Suspense>
    );
}
