"use client";

import { useState } from "react";
import { MobileHeader } from "@/components/mobile/mobile-header";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Zap, Shield, Camera, Wand2, Rocket } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useUser } from "@/firebase";

export function MobileHome() {
    const [searchQuery, setSearchQuery] = useState("");
    const { user } = useUser();

    return (
        <div className="min-h-screen bg-[#0a192f] md:hidden pb-32">
            <MobileHeader searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

            <main className="pt-20 px-6 space-y-12">
                {/* Vogue Style Header */}
                <div className="relative pt-8">
                    <div className="absolute top-0 right-0 font-playfair italic text-6xl opacity-20 text-white pointer-events-none">
                        Vol.5
                    </div>

                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-6"
                    >
                        <h1 className="text-6xl font-black text-white leading-[0.9] tracking-tighter uppercase font-headline">
                            Unlock <br /> System <br /> Power
                        </h1>
                        <p className="text-base font-bold text-white/90 max-w-[300px] leading-snug uppercase tracking-tight">
                            With Tool Daddy, aspiring creators receive the necessary tools and resources to build a high-end digital workflow that can be shared across the workspace. This gives you the chance to boost your productivity by thousands!
                        </p>

                        <Link href="/tools" className="inline-flex items-center gap-2 text-white font-black uppercase text-sm border-b-2 border-white pb-1 hover:gap-4 transition-all group">
                            Explore All Tools
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </motion.div>
                </div>

                {/* Feature Triplets - Functional & Non-Image */}
                <div className="grid grid-cols-3 gap-3 h-[240px]">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="relative group overflow-hidden rounded-xl border border-white/10"
                    >
                        <Link href="/image-enhancer" className="absolute inset-0 z-20" />
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-black to-black group-hover:from-blue-600/40 transition-all duration-700" />
                        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_white_1px,_transparent_1px)] bg-[size:10px_10px]" />
                        <div className="relative h-full z-10 flex flex-col items-center justify-end p-3 pb-6">
                            <Camera className="w-8 h-8 text-white mb-3 group-hover:scale-110 transition-transform" />
                            <span className="text-[10px] font-black text-white uppercase tracking-tighter text-center leading-none">AI <br /> Vision</span>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="relative group overflow-hidden rounded-xl border border-white/10"
                    >
                        <Link href="/video-downloader" className="absolute inset-0 z-20" />
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 via-black to-black group-hover:from-purple-600/40 transition-all duration-700" />
                        <div className="absolute inset-0 opacity-10 bg-[linear-gradient(45deg,_white_1px,_transparent_1px),_linear-gradient(-45deg,_white_1px,_transparent_1px)] bg-[size:10px_10px]" />
                        <div className="relative h-full z-10 flex flex-col items-center justify-end p-3 pb-6">
                            <Wand2 className="w-8 h-8 text-white mb-3 group-hover:scale-110 transition-transform" />
                            <span className="text-[10px] font-black text-white uppercase tracking-tighter text-center leading-none">Stream <br /> Lab</span>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="relative group overflow-hidden rounded-xl border border-white/10"
                    >
                        <Link href="/metadata-extractor" className="absolute inset-0 z-20" />
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/20 via-black to-black group-hover:from-emerald-600/40 transition-all duration-700" />
                        <div className="absolute inset-0 opacity-10 bg-[repeating-linear-gradient(90deg,_white_1px,_transparent_1px_10px)]" />
                        <div className="relative h-full z-10 flex flex-col items-center justify-end p-3 pb-6">
                            <Shield className="w-8 h-8 text-white mb-3 group-hover:scale-110 transition-transform" />
                            <span className="text-[10px] font-black text-white uppercase tracking-tighter text-center leading-none">Cyber <br /> Vault</span>
                        </div>
                    </motion.div>
                </div>

                {/* Jump Back In Section - The "New" Mobile Grid */}
                {user && (
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="space-y-6 pt-12 border-t border-white/10"
                    >
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-black text-white uppercase tracking-tighter">Jump Back In</h2>
                            <Link href="/history" className="text-xs font-bold text-white/60 uppercase">View All</Link>
                        </div>

                        <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar -mx-6 px-6">
                            <div className="flex-shrink-0 w-[160px] aspect-[4/5] bg-black rounded-xl p-4 flex flex-col justify-between group overflow-hidden">
                                <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center border border-red-500/30">
                                    <Sparkles className="w-5 h-5 text-red-500" />
                                </div>
                                <div className="space-y-4">
                                    <h3
                                        className="text-sm font-bold text-white uppercase leading-tight bg-clip-text text-transparent bg-gradient-to-b from-white via-white/90 to-white/40"
                                        style={{ WebkitBoxReflect: 'below -2px linear-gradient(transparent, rgba(255,255,255,0.15))' } as any}
                                    >
                                        Image <br /> Enhancer
                                    </h3>
                                    <p className="text-[10px] text-white/40 mt-1 uppercase">AI Tool</p>
                                </div>
                            </div>

                            <div className="flex-shrink-0 w-[160px] aspect-[4/5] liquid-glass rounded-xl p-4 flex flex-col justify-between group relative overflow-hidden">
                                <Link href="/video-downloader" className="absolute inset-0 z-10" />
                                <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
                                    <Rocket className="w-5 h-5 text-blue-500" />
                                </div>
                                <div className="space-y-4">
                                    <h3
                                        className="text-sm font-bold text-white uppercase leading-tight bg-clip-text text-transparent bg-gradient-to-b from-white via-white/90 to-white/40"
                                        style={{ WebkitBoxReflect: 'below -2px linear-gradient(transparent, rgba(255,255,255,0.15))' } as any}
                                    >
                                        Video <br /> Downloader
                                    </h3>
                                    <p className="text-[10px] text-white/40 mt-1 uppercase">Media Tool</p>
                                </div>
                            </div>

                            <div className="flex-shrink-0 w-[160px] aspect-[4/5] liquid-glass rounded-xl p-4 flex flex-col justify-between group relative overflow-hidden">
                                <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center border border-amber-500/30">
                                    <Zap className="w-5 h-5 text-amber-500" />
                                </div>
                                <div className="space-y-4">
                                    <h3
                                        className="text-sm font-bold text-white uppercase leading-tight bg-clip-text text-transparent bg-gradient-to-b from-white via-white/90 to-white/40"
                                        style={{ WebkitBoxReflect: 'below -2px linear-gradient(transparent, rgba(255,255,255,0.15))' } as any}
                                    >
                                        Quick <br /> Convert
                                    </h3>
                                    <p className="text-[10px] text-white/40 mt-1 uppercase">Utility</p>
                                </div>
                            </div>
                        </div>
                    </motion.section>
                )}
            </main>
        </div>
    );
}
