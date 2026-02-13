'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home, Play } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef } from 'react';

export default function NotFound() {
    const [hasInteracted, setHasInteracted] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const handleContinue = () => {
        setHasInteracted(true);
        // Play the audio roast
        const audio = new Audio('/audio/roast.mp3');
        audio.volume = 0.8;
        audioRef.current = audio;
        audio.play().catch(err => console.log("Audio play failed:", err));
    };

    return (
        <div className="relative min-h-[80vh] w-full flex items-center justify-center overflow-hidden">
            <AnimatePresence>
                {!hasInteracted ? (
                    <motion.div
                        key="overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, scale: 1.1 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-background/95 backdrop-blur-xl px-4"
                    >
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-center space-y-8 max-w-md"
                        >
                            <div className="space-y-4">
                                <h1 className="text-4xl md:text-6xl font-black tracking-tighter font-headline text-foreground uppercase italic">
                                    Hold Up Lil Bro
                                </h1>
                                <p className="text-xl text-muted-foreground font-medium">
                                    You're about to witness something tragic. Are you ready for the smoke?
                                </p>
                            </div>

                            <Button
                                onClick={handleContinue}
                                size="lg"
                                className="h-20 w-full rounded-2xl gap-4 font-black text-2xl bg-primary text-primary-foreground hover:scale-105 transition-all shadow-2xl shadow-primary/40 group"
                            >
                                <Play className="w-8 h-8 fill-current group-hover:animate-pulse" />
                                ENTER THE ROAST
                            </Button>
                        </motion.div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="content"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center justify-center w-full px-4 text-center py-12"
                    >
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, ease: "easeOut" }}
                            className="relative w-full max-w-2xl p-8 md:p-12 overflow-hidden glass-panel tool-island border-border/20 shadow-2xl rounded-[var(--radius)]"
                            style={{ '--glow-color': 'var(--primary)' } as React.CSSProperties}
                        >
                            <div className="absolute top-0 right-0 p-4 opacity-10 select-none">
                                <h1 className="text-9xl font-black tracking-tighter font-headline">404</h1>
                            </div>

                            <div className="relative z-10 space-y-8">
                                <div className="space-y-4">
                                    <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-foreground font-headline uppercase italic">
                                        You really typed that trash?
                                    </h2>
                                    <p className="text-xl md:text-2xl font-bold text-primary tracking-tight font-headline">
                                        Fingers straight-up betrayed you, folded you like cheap laundry.
                                    </p>
                                </div>

                                <p className="text-2xl md:text-3xl font-extrabold text-foreground leading-tight font-headline">
                                    Now go cry in the corner, lil bro. <br />
                                    Door's that way →
                                </p>

                                <div className="flex justify-center pt-2">
                                    <Link href="/">
                                        <Button size="lg" className="h-16 rounded-full gap-3 px-10 font-black text-xl hover:scale-105 transition-all shadow-lg shadow-primary/20 bg-primary text-primary-foreground">
                                            <Home className="w-6 h-6" />
                                            GET HOME LIL BRO
                                        </Button>
                                    </Link>
                                </div>

                                <p className="text-lg md:text-xl font-medium text-muted-foreground/80 max-w-xl mx-auto leading-relaxed border-t border-border/10 pt-8 font-body">
                                    Don't come back until you've touched grass or at least learned how to spell.
                                </p>
                            </div>

                            {/* Decorative corner glow */}
                            <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-primary/20 blur-[100px] rounded-full" />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
