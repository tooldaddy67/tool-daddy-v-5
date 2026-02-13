"use client";

import { useEffect, useState } from "react";
import { Skull, Timer } from "lucide-react";

export function BrutalLockout({ lockedUntil }: { lockedUntil: number }) {
    const [timeLeft, setTimeLeft] = useState("");
    const [seconds, setSeconds] = useState(0);

    useEffect(() => {
        const updateCountdown = () => {
            const now = Date.now();
            const diff = lockedUntil - now;

            if (diff <= 0) {
                window.location.reload();
                return;
            }

            const mins = Math.floor(diff / 60000);
            const secs = Math.floor((diff % 60000) / 1000);
            setTimeLeft(`${mins}:${secs < 10 ? "0" : ""}${secs}`);
            setSeconds(Math.ceil(diff / 1000));
        };

        updateCountdown();
        const interval = setInterval(updateCountdown, 1000);
        return () => clearInterval(interval);
    }, [lockedUntil]);

    return (
        <div className="fixed inset-0 z-[9999] bg-black flex flex-col items-center justify-center p-6 text-center select-none overflow-hidden">
            {/* Pulsing red background glow */}
            <div className="absolute inset-0 bg-red-900/10 animate-pulse" />

            <div className="relative space-y-8 max-w-2xl animate-in fade-in zoom-in duration-700">
                <div className="flex justify-center">
                    <div className="relative">
                        <Skull className="w-24 h-24 text-red-600 animate-bounce" />
                    </div>
                </div>

                <div className="space-y-4">
                    <h1 className="text-5xl md:text-7xl font-black font-headline text-white tracking-tighter uppercase italic">
                        ACCESS <span className="text-red-600">TERMINATED.</span>
                    </h1>
                    <p className="text-xl md:text-2xl font-bold text-red-500/80 italic tracking-tight">
                        "Stop trying to hack me, you script-kiddie noob."
                    </p>
                </div>

                <div className="space-y-6 bg-red-950/20 border border-red-900/50 p-8 rounded-3xl backdrop-blur-xl">
                    <div className="flex flex-col items-center gap-2">
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-red-400 opacity-70">
                            Time until you're worth my pixels
                        </span>
                        <div className="flex items-center gap-4 text-6xl md:text-8xl font-black text-white font-mono">
                            <Timer className="w-12 h-12 text-red-600 animate-spin-slow" />
                            {timeLeft}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="h-1.5 w-full bg-red-900/30 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-red-600 transition-all duration-1000"
                                style={{ width: `${(seconds / 180) * 100}%` }}
                            />
                        </div>
                        <p className="text-[9px] text-red-400 font-bold uppercase tracking-widest opacity-50">
                            Refreshing won't save you. Your IP is stained.
                        </p>
                    </div>
                </div>

                <div className="pt-8 text-muted-foreground text-xs font-mono opacity-40">
                    [SYSTEM_ERROR: SECURITY_BREACH_DETECTED]<br />
                    [BLOCK_RELEASE: {new Date(lockedUntil).toLocaleTimeString()}]<br />
                    [AUTHORITY: TOOL_DADDY_OVERLORD]
                </div>
            </div>

            <style jsx global>{`
                @keyframes spin-slow {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .animate-spin-slow {
                    animation: spin-slow 8s linear infinite;
                }
            `}</style>
        </div>
    );
}
