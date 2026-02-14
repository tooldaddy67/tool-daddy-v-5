'use client';

import { useState } from "react";
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { History, Trash2, Bot, Sparkles, Minimize, Replace, QrCode, Music, Video, Download, KeyRound, Check, ArrowUpRight } from 'lucide-react';
import { useHistory } from '@/hooks/use-history';
import { formatBytes, getFileExtension } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { MobileHeader } from '@/components/mobile/mobile-header';
import { useRouter } from "next/navigation";
import { useSettings } from "@/components/settings-provider";

const toolIcons: { [key: string]: React.ElementType } = {
    'AI Image Enhancer': Sparkles,
    'AI Text Humanizer': Bot,
    'Image Compressor': Minimize,
    'Image Converter': Replace,
    'QR Code Generator': QrCode,
    'Video to Audio Converter': Music,
    'Video Compressor': Video,
    'YouTube Video Downloader': Download,
    'YouTube to Audio': Music,
    'AI Playlist Maker': Music,
    'Password Generator': KeyRound,
};

export default function HistoryClient() {
    const router = useRouter();
    const { settings } = useSettings();
    const { history, isLoaded, clearHistory } = useHistory();
    const [searchQuery, setSearchQuery] = useState("");

    const handleDownload = (dataUrl: string, filename: string) => {
        const link = document.createElement("a");
        link.href = dataUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const filteredHistory = history.filter(item =>
        item.tool.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.data.playlistName && item.data.playlistName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.data.fileType && item.data.fileType.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <div className="min-h-screen pb-32">
            {/* Mobile Header */}
            <div className="md:hidden pt-4">
                <MobileHeader searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
            </div>

            <div className="container mx-auto px-4 md:px-8 space-y-12 pt-8 md:pt-12">
                {/* Main Page Header */}
                <div className="flex flex-col items-center justify-center text-center space-y-6 my-10 relative">
                    <div className="space-y-1 relative z-10">
                        <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white uppercase leading-tight block">
                            Activity History
                        </h1>
                        <div className="h-2 w-20 bg-primary mx-auto rounded-full shadow-[0_0_15px_hsl(var(--primary)/0.3)]" />
                    </div>
                    <p className="text-muted-foreground text-[12px] md:text-sm font-black uppercase tracking-[0.3em] text-center opacity-60">
                        Your Secure Toolkit Records
                    </p>

                    {history.length > 0 && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={clearHistory}
                            className="mt-4 border-red-500/20 text-red-400 hover:bg-red-500/10 rounded-full font-black uppercase tracking-widest text-[10px]"
                        >
                            <Trash2 className="w-3.5 h-3.5 mr-2" />
                            Purge Archives
                        </Button>
                    )}
                </div>

                {!isLoaded ? (
                    <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-[300px] w-full rounded-2xl bg-card/20 animate-pulse border border-border/10" />
                        ))}
                    </div>
                ) : filteredHistory.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 px-6">
                        <div className="p-6 rounded-full bg-primary/5 border border-primary/10">
                            <History className="w-12 h-12 text-primary/40" />
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-xl font-black text-white uppercase tracking-tight">
                                {history.length === 0 ? "Archives Empty" : "No Matches Found"}
                            </h3>
                            <p className="text-muted-foreground text-sm font-medium">
                                {history.length === 0
                                    ? "Your creations will appear here once you start using the tools."
                                    : `We couldn't find any records matching "${searchQuery}"`}
                            </p>
                        </div>
                        <Button
                            onClick={() => router.push('/tools')}
                            className="bg-primary text-white font-black uppercase tracking-widest h-12 px-8 rounded-xl shadow-[0_0_20px_hsl(var(--primary)/0.2)] active:scale-95 transition-all"
                        >
                            Launch Tools <ArrowUpRight className="ml-2 w-4 h-4" />
                        </Button>
                    </div>
                ) : (
                    <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {filteredHistory.map((item) => {
                            const Icon = toolIcons[item.tool] || History;
                            return (
                                <div
                                    key={item.id}
                                    className="group flex flex-col bg-[#0a0d14] border-2 border-zinc-800/50 rounded-2xl overflow-hidden hover:border-primary/50 transition-all duration-300 hover:shadow-[0_0_30px_hsl(var(--primary)/0.1)]"
                                >
                                    <div className="p-5 flex-grow space-y-5">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                                                    <Icon className="w-5 h-5" />
                                                </div>
                                                <div className="space-y-0.5">
                                                    <h3 className="font-black text-[13px] uppercase tracking-wider text-white">
                                                        {item.tool}
                                                    </h3>
                                                    <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest opacity-60">
                                                        {formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center">
                                                <Check className="w-3 h-3 text-white/20" />
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            {item.tool === 'AI Playlist Maker' && item.data.songs && (
                                                <div className="space-y-2">
                                                    <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20">
                                                        <p className="text-purple-400 font-black text-xs uppercase tracking-tight truncate">{item.data.playlistName}</p>
                                                        <p className="text-[10px] text-purple-300/60 font-medium">{item.data.songs.length} Tracks Generated</p>
                                                    </div>
                                                </div>
                                            )}

                                            {item.tool === 'Password Generator' && (
                                                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                                                    <p className="text-emerald-400 font-black text-xs uppercase tracking-tight">Secure Token Created</p>
                                                    <p className="text-[10px] text-emerald-300/60 font-medium">{item.data.passwordLength} chars generated</p>
                                                </div>
                                            )}

                                            {(item.tool.includes('Image') || item.tool.includes('Enhancer')) && (item.data.enhancedImage || item.data.compressedImage || item.data.convertedImage) && (
                                                <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black/40 border border-white/5 ring-1 ring-white/10">
                                                    <Image
                                                        src={item.data.enhancedImage || item.data.compressedImage || item.data.convertedImage || ''}
                                                        alt="Production Artifact"
                                                        fill
                                                        className="object-contain"
                                                    />
                                                </div>
                                            )}

                                            {item.tool === 'QR Code Generator' && item.data.qrCodeImage && (
                                                <div className="flex flex-col items-center gap-3">
                                                    <div className="p-3 bg-white rounded-xl">
                                                        <Image src={item.data.qrCodeImage} alt="QR Code" width={100} height={100} />
                                                    </div>
                                                    <p className="text-[10px] text-muted-foreground font-medium truncate max-w-full italic px-2">
                                                        "{item.data.qrCodeText}"
                                                    </p>
                                                </div>
                                            )}

                                            {item.data.details && (
                                                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3 font-medium bg-white/5 p-3 rounded-xl italic border border-white/5">
                                                    "{item.data.details}"
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {(item.data.enhancedImage || item.data.compressedImage || item.data.convertedImage || item.data.qrCodeImage || item.data.extractedAudio) && (
                                        <div className="px-5 pb-5 mt-auto">
                                            <Button
                                                onClick={() => {
                                                    const url = item.data.enhancedImage || item.data.compressedImage || item.data.convertedImage || item.data.qrCodeImage || item.data.extractedAudio;
                                                    if (url) handleDownload(url, `tool-daddy-export-${item.id}.png`);
                                                }}
                                                className="w-full bg-secondary/50 border border-border/10 text-white font-black uppercase tracking-widest text-[10px] h-10 hover:bg-primary hover:border-primary transition-all rounded-xl"
                                            >
                                                Download Artifact <Download className="ml-2 w-3.5 h-3.5" />
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
