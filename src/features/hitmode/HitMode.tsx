"use client";

import React, { useState, useEffect, useRef } from "react";
import { HitEvent } from "./types";
import { playHitSound, unlockAudio, stopAllSounds } from "./sound";
import { startMicKnockDetection, stopMicKnockDetection } from "./knockMic";
import { useToast } from "@/hooks/use-toast";

type ConnectionState = "disconnected" | "connecting" | "connected-accel" | "connected-mic" | "error";

export function HitMode({ compact = false }: { compact?: boolean }) {
    const [enabled, setEnabled] = useState(false);
    const [token, setToken] = useState("");
    const [status, setStatus] = useState<ConnectionState>("disconnected");
    const [errorDetail, setErrorDetail] = useState<string | null>(null);

    const [hitCount, setHitCount] = useState(0);
    const [lastEvent, setLastEvent] = useState<HitEvent | null>(null);
    const [isShaking, setIsShaking] = useState(false);
    const [isMac, setIsMac] = useState(false);
    const wsRef = useRef<WebSocket | null>(null);
    const { toast } = useToast();

    // Check platform and load token
    useEffect(() => {
        setIsMac(navigator.platform.toUpperCase().indexOf('MAC') >= 0);
        const savedToken = localStorage.getItem("hit_bridge_token");
        if (savedToken) setToken(savedToken);
    }, []);

    const handleTokenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setToken(e.target.value);
        localStorage.setItem("hit_bridge_token", e.target.value);
    };

    const processHit = (event: HitEvent) => {
        playHitSound(event.severity);
        setHitCount((prev) => prev + 1);
        setLastEvent(event);

        // Dispatch global event for Zen Background
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('hit-impact', { detail: event }));
        }

        // Trigger shake
        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 250);
    };

    const enableFeature = () => {
        unlockAudio();
        setEnabled(true);
        setStatus("connecting");

        // Try starting WebSocket
        const wsUrl = `ws://127.0.0.1:8787/ws?token=${token}`;
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        const connectionTimeout = setTimeout(() => {
            if (ws.readyState !== WebSocket.OPEN) {
                console.log("WebSocket failed to connect in time. Falling back to mic.");
                ws.close();
                triggerMicFallback();
            }
        }, 1500); // Wait 1.5s for helper

        ws.onopen = () => {
            clearTimeout(connectionTimeout);
            setStatus("connected-accel");
            console.log("Connected to native hit-bridge");
        };

        ws.onmessage = (msg) => {
            try {
                const event: HitEvent = JSON.parse(msg.data);
                if (event.type === "hit") {
                    processHit(event);
                }
            } catch (e) {
                console.error("WS message parse error", e);
            }
        };

        ws.onerror = () => {
            // ws onerror also fires if connection refused
        };

        ws.onclose = () => {
            if (status === "connected-accel") {
                setStatus("disconnected");
                // Optional: auto fallback to mic if WS drops
                triggerMicFallback();
            }
        };
    };

    const triggerMicFallback = async () => {
        setStatus("connecting");
        setErrorDetail(null);
        try {
            const stop = await startMicKnockDetection({
                onHit: processHit,
                threshold: 0.15,
                cooldownMs: 600
            });

            if (stop) {
                setStatus("connected-mic");
            } else {
                throw new Error("System blocked microphone access or another device is using it.");
            }
        } catch (err: any) {
            console.error("Mic fallback error:", err);
            const errMsg = err.message || String(err);
            setStatus("error");
            setErrorDetail(errMsg);
            setEnabled(false);

            if (errMsg.includes("Permission denied") || errMsg.includes("NotAllowedError")) {
                toast({
                    title: "Microphone Access Blocked",
                    description: "Chrome is blocking the mic. Please click 'Reset permissions' in the address bar menu and REFRESH the page.",
                    variant: "destructive"
                });
            } else if (errMsg.includes("Could not start") || errMsg.includes("NotReadableError")) {
                toast({
                    title: "Microphone Busy",
                    description: "Your microphone might be used by another app (like Zoom/Discord). Please close them and try again.",
                    variant: "destructive"
                });
            } else {
                toast({
                    title: "Connection Error",
                    description: `Error: ${errMsg}. Check browser console for more details.`,
                    variant: "destructive"
                });
            }
        }
    };

    const disableFeature = () => {
        setEnabled(false);
        setStatus("disconnected");
        if (wsRef.current) {
            wsRef.current.close();
            wsRef.current = null;
        }
        stopMicKnockDetection();
        stopAllSounds();
    };

    const shakeStyle = isShaking
        ? { transform: "translate(3px, 3px) rotate(0.5deg)", transition: "0.05s ease-in-out" }
        : { transition: "0.3s cubic-bezier(0.4, 0, 0.2, 1)" };

    if (compact) {
        return (
            <div className="space-y-6" style={shakeStyle}>
                <div className="flex items-center justify-between gap-4">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            <span className={`w-2 h-2 rounded-full animate-pulse ${status.includes('connected') ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' :
                                status === 'connecting' ? 'bg-yellow-500' :
                                    status === 'error' ? 'bg-red-500' : 'bg-muted-foreground/30'
                                }`} />
                            <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">
                                {status === "disconnected" ? "Inactive" :
                                    status === "connecting" ? "Syncing..." :
                                        status === "connected-accel" ? "Accelerometer Active" :
                                            status === "connected-mic" ? "Microphone Listening" :
                                                "System Error"}
                            </span>
                        </div>
                        <h4 className="text-sm font-bold leading-tight">Interactive Surface</h4>
                        <p className="text-[11px] text-muted-foreground leading-tight mt-1">Tap your device to trigger site reactions.</p>
                    </div>

                    <button
                        onClick={enabled ? disableFeature : enableFeature}
                        className={`relative h-11 w-11 rounded-xl flex items-center justify-center transition-all duration-300 active:scale-95 ${enabled
                            ? "bg-red-500/10 text-red-500 hover:bg-red-500/20 shadow-inner"
                            : "bg-primary text-primary-foreground hover:shadow-lg hover:shadow-primary/20"
                            }`}
                    >
                        {enabled ? (
                            <div className="w-3 h-3 bg-red-500 rounded-sm" />
                        ) : (
                            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z" />
                            </svg>
                        )}
                    </button>
                </div>

                {!enabled && !isMac && (
                    <div className="bg-muted/30 p-3 rounded-lg border border-border/50">
                        <p className="text-[10px] text-muted-foreground leading-relaxed italic">
                            Running on Windows: We'll use your <strong>Microphone</strong> to detect knocks on the surface.
                        </p>
                    </div>
                )}

                {enabled && (
                    <div className="relative group">
                        {/* Error Context if any */}
                        {status === 'error' && errorDetail && (
                            <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-lg mb-4">
                                <p className="text-[10px] text-red-500 font-mono italic">
                                    System Trace: {errorDetail}
                                </p>
                            </div>
                        )}
                        <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-primary/5 to-primary/20 rounded-xl blur opacity-20 group-hover:opacity-40 transition-opacity" />
                        <div className="relative bg-background/50 backdrop-blur-sm rounded-xl p-4 border border-primary/20 space-y-4">
                            <div className="flex justify-between items-end">
                                <div className="space-y-1">
                                    <span className="text-[10px] font-bold uppercase tracking-tighter opacity-40">Impact Force</span>
                                    <div className="text-2xl font-black tabular-nums">
                                        {lastEvent ? lastEvent.amplitude.toFixed(3) : "0.000"}
                                    </div>
                                </div>
                                <div className="text-right space-y-1">
                                    <span className="text-[10px] font-bold uppercase tracking-tighter opacity-40">Total Events</span>
                                    <div className="text-2xl font-black tabular-nums text-primary">{hitCount}</div>
                                </div>
                            </div>

                            <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                                <div
                                    className={`h-full transition-all duration-300 ${lastEvent?.severity === 'heavy' ? 'bg-red-500' :
                                        lastEvent?.severity === 'medium' ? 'bg-yellow-500' : 'bg-primary'
                                        }`}
                                    style={{ width: `${Math.min(100, (lastEvent?.amplitude || 0) * 100)}%` }}
                                />
                            </div>

                            {lastEvent && (
                                <div className={`text-[10px] font-black uppercase tracking-widest text-center animate-in fade-in slide-in-from-bottom-1 ${lastEvent.severity === 'heavy' ? 'text-red-500' :
                                    lastEvent.severity === 'medium' ? 'text-yellow-500' : 'text-primary'
                                    }`}>
                                    {lastEvent.severity} Impact Detected
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // Default "Premium" View (for Settings Dialog)
    return (
        <div className={`group relative overflow-hidden transition-all duration-500 ${isShaking ? "scale-[0.99]" : ""}`} style={shakeStyle}>
            {/* Glow Background Deco */}
            <div className={`absolute -inset-24 bg-primary/5 rounded-full blur-3xl opacity-0 transition-opacity duration-1000 ${enabled ? "opacity-100" : ""}`} />

            <div className="relative p-6 rounded-2xl border border-border/50 bg-muted/20 backdrop-blur-md overflow-hidden space-y-6">
                <div className="flex justify-between items-start relative z-10">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${status.includes('connected') ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.6)]' :
                                status === 'connecting' ? 'bg-yellow-500 animate-pulse' :
                                    status === 'error' ? 'bg-red-500' : 'bg-muted-foreground/30'
                                }`} />
                            <span className="text-[10px] font-black uppercase tracking-widest text-primary opacity-80">
                                {status.replace('-', ' ')}
                            </span>
                        </div>
                        <h3 className="text-xl font-black tracking-tight">Kinetic Interface</h3>
                        <p className="text-xs text-muted-foreground font-medium max-w-[200px]">
                            Physical hit/knock detection for immersive interaction.
                        </p>
                    </div>

                    <button
                        onClick={enabled ? disableFeature : enableFeature}
                        className={`relative group/btn h-12 px-6 rounded-xl font-bold transition-all duration-300 ${enabled
                            ? "bg-red-500 text-white shadow-lg shadow-red-500/20 hover:scale-105"
                            : "bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:scale-105 active:scale-95"
                            }`}
                    >
                        <span className="relative z-10">{enabled ? "Dissable" : "Activate"}</span>
                        <div className="absolute inset-0 rounded-xl bg-white/20 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                    </button>
                </div>

                <div className="space-y-4 relative z-10">
                    {!enabled && isMac && (
                        <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                            <label className="text-[10px] font-bold uppercase opacity-50 tracking-widest">Bridge Token</label>
                            <input
                                type="text"
                                value={token}
                                onChange={handleTokenChange}
                                placeholder="Paste token here..."
                                className="w-full h-11 px-4 bg-background/50 border border-border/50 rounded-xl text-xs outline-none focus:ring-2 focus:ring-primary/40 transition-all font-mono"
                            />
                        </div>
                    )}

                    {!enabled && !isMac && (
                        <div className="bg-primary/5 border border-primary/10 p-4 rounded-xl">
                            <p className="text-[11px] text-foreground/80 leading-relaxed">
                                <span className="font-bold text-primary">Windows User:</span> Tap or knock on your laptop base or the desk next to it. We use high-frequency mic analysis to detect impacts.
                            </p>
                        </div>
                    )}

                    {enabled && (
                        <div className="grid grid-cols-2 gap-4 animate-in zoom-in-95 duration-500">
                            <div className="bg-background/40 border border-border/50 p-4 rounded-xl flex flex-col items-center justify-center space-y-1">
                                <span className="text-[10px] font-bold uppercase opacity-40">Impacts</span>
                                <span className="text-3xl font-black text-primary tabular-nums">{hitCount}</span>
                            </div>
                            <div className="bg-background/40 border border-border/50 p-4 rounded-xl flex flex-col items-center justify-center space-y-1">
                                <span className="text-[10px] font-bold uppercase opacity-40">Last Peak</span>
                                <span className="text-3xl font-black tabular-nums">{lastEvent ? lastEvent.amplitude.toFixed(2) : "0.00"}</span>
                            </div>
                        </div>
                    )}

                    {enabled && lastEvent && (
                        <div className="w-full space-y-2">
                            <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest opacity-50">
                                <span>Amplitude History</span>
                                <span>{lastEvent.severity}</span>
                            </div>
                            <div className="w-full h-2 bg-muted rounded-full overflow-hidden p-0.5">
                                <div
                                    className={`h-full rounded-full transition-all duration-300 ${lastEvent.severity === 'heavy' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' :
                                        lastEvent.severity === 'medium' ? 'bg-yellow-500' : 'bg-primary shadow-[0_0_8px_rgba(var(--primary),0.5)]'
                                        }`}
                                    style={{ width: `${Math.min(100, lastEvent.amplitude * 100)}%` }}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
