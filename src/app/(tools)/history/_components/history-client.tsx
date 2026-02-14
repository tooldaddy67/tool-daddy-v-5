'use client';

import { useState } from "react";
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { History, Trash2, Bot, Sparkles, Minimize, Replace, QrCode, Music, Video, Download, KeyRound, Check } from 'lucide-react';
import { useHistory } from '@/hooks/use-history';
import { formatBytes, getFileExtension } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

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
        <div className="w-full space-y-6 md:mt-0 mt-8">
            <Card className="bg-card/50 backdrop-blur-lg border-border/20">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <History className="w-6 h-6" />
                        History
                    </CardTitle>
                    {history.length > 0 && (
                        <Button variant="outline" size="sm" onClick={clearHistory}>
                            <Trash2 className="w-4 h-4 mr-2" />
                            Clear History
                        </Button>
                    )}
                </CardHeader>
            </Card>

            {!isLoaded && (
                <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed rounded-lg">
                    <p className="text-muted-foreground">Loading history...</p>
                </div>
            )}

            {isLoaded && filteredHistory.length === 0 && (
                <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed rounded-lg">
                    {history.length === 0 ? (
                        <>
                            <p className="text-muted-foreground">Your history is empty.</p>
                            <p className="text-sm text-muted-foreground/80">Creations from the tools will appear here.</p>
                        </>
                    ) : (
                        <p className="text-muted-foreground">No history items found matching "{searchQuery}".</p>
                    )}
                </div>
            )}

            {isLoaded && filteredHistory.length > 0 && (
                <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                    {filteredHistory.map((item) => {
                        const Icon = toolIcons[item.tool] || History;
                        return (
                            <Card key={item.id} className="flex flex-col bg-card/50 backdrop-blur-lg border-border/20">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-lg">
                                        <Icon className="w-5 h-5 text-primary" />
                                        {item.tool}
                                    </CardTitle>
                                    <p className="text-xs text-muted-foreground">
                                        {formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}
                                    </p>
                                </CardHeader>
                                <CardContent className="flex-grow space-y-4">
                                    {item.tool === 'AI Playlist Maker' && item.data.songs && (
                                        <div className="space-y-3">
                                            <Alert className="border-purple-500/30 bg-purple-500/5">
                                                <AlertTitle className="text-purple-400 font-bold">{item.data.playlistName}</AlertTitle>
                                                <AlertDescription className="text-xs">
                                                    {item.data.songs.length} songs generated for you.
                                                </AlertDescription>
                                            </Alert>
                                            <div className="space-y-1">
                                                {item.data.songs.slice(0, 3).map((song: any, i: number) => (
                                                    <div key={i} className="text-xs flex justify-between p-2 bg-muted/30 rounded border border-border/10">
                                                        <span className="font-medium truncate mr-2">{song.title}</span>
                                                        <span className="text-muted-foreground shrink-0">{song.artist}</span>
                                                    </div>
                                                ))}
                                                {item.data.songs.length > 3 && (
                                                    <p className="text-[10px] text-center text-muted-foreground mt-1">
                                                        + {item.data.songs.length - 3} more songs
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                    {item.tool === 'Password Generator' && (
                                        <div className="space-y-2">
                                            <Alert className="border-green-500/30 bg-green-500/5">
                                                <AlertTitle className="text-green-500 flex items-center gap-2">
                                                    <Check className="h-4 w-4" /> Securely Generated
                                                </AlertTitle>
                                                <AlertDescription className="text-xs">
                                                    {item.data.passwordLength} character password created.
                                                </AlertDescription>
                                            </Alert>
                                            <p className="text-xs text-muted-foreground italic text-center">Passwords are not stored in history for your security.</p>
                                        </div>
                                    )}
                                    {item.tool === 'AI Image Enhancer' && item.data.enhancedImage && (
                                        <div className="space-y-2">
                                            <div className="relative w-full aspect-square rounded-md overflow-hidden border">
                                                <Image src={item.data.enhancedImage} alt="Enhanced" fill className="object-contain" />
                                            </div>
                                            <Button onClick={() => handleDownload(item.data.enhancedImage!, `enhanced-image.${getFileExtension(item.data.fileType)}`)} variant="secondary" size="sm" className="w-full">Download</Button>
                                        </div>
                                    )}
                                    {item.tool === 'Image Compressor' && item.data.compressedImage && (
                                        <div className="space-y-2">
                                            <div className="relative w-full aspect-square rounded-md overflow-hidden border">
                                                <Image src={item.data.compressedImage} alt="Compressed" fill className="object-contain" />
                                            </div>
                                            <Alert>
                                                <AlertDescription className="text-center">
                                                    Compressed from {formatBytes(item.data.originalSize || 0)} to {formatBytes(item.data.compressedSize || 0)}
                                                </AlertDescription>
                                            </Alert>
                                            <Button onClick={() => handleDownload(item.data.compressedImage!, `compressed-image.${getFileExtension(item.data.fileType)}`)} variant="secondary" size="sm" className="w-full">Download</Button>
                                        </div>
                                    )}
                                    {item.tool === 'Image Converter' && item.data.convertedImage && (
                                        <div className="space-y-2">
                                            <div className="relative w-full aspect-square rounded-md overflow-hidden border">
                                                <Image src={item.data.convertedImage} alt="Converted" fill className="object-contain" />
                                            </div>
                                            <Alert>
                                                <AlertDescription className="text-center">
                                                    Converted from {item.data.originalFormat?.toUpperCase()} to {item.data.targetFormat?.toUpperCase()}
                                                </AlertDescription>
                                            </Alert>
                                            <Button onClick={() => handleDownload(item.data.convertedImage!, `converted-image.${item.data.targetFormat}`)} variant="secondary" size="sm" className="w-full">Download</Button>
                                        </div>
                                    )}
                                    {item.tool === 'QR Code Generator' && item.data.qrCodeImage && (
                                        <div className="space-y-2 text-center">
                                            <div className="p-4 bg-white rounded-lg border inline-block">
                                                <Image src={item.data.qrCodeImage} alt="QR Code" width={128} height={128} />
                                            </div>
                                            <p className="text-xs text-muted-foreground truncate" title={item.data.qrCodeText}>{item.data.qrCodeText}</p>
                                            <Button onClick={() => handleDownload(item.data.qrCodeImage!, `qrcode.png`)} variant="secondary" size="sm" className="w-full">Download</Button>
                                        </div>
                                    )}
                                    {item.tool === 'AI Text Humanizer' && item.data.humanizedText && (
                                        <div className="space-y-2">
                                            <p className="text-sm p-3 bg-muted/50 rounded-md max-h-40 overflow-y-auto">{item.data.humanizedText}</p>
                                        </div>
                                    )}
                                    {item.tool === 'Video to Audio Converter' && item.data.videoFileName && (
                                        <div className="space-y-2">
                                            <Alert>
                                                <AlertTitle className="text-center text-sm">{item.data.videoFileName}</AlertTitle>
                                                <AlertDescription className="text-center">
                                                    Converted video of size {formatBytes(item.data.videoFileSize || 0)}
                                                </AlertDescription>
                                            </Alert>
                                            {item.data.extractedAudio ? (
                                                <>
                                                    <audio controls src={item.data.extractedAudio} className="w-full"></audio>
                                                    <Button onClick={() => handleDownload(item.data.extractedAudio!, `${item.data.videoFileName?.split('.')[0] || 'audio'}.mp3`)} variant="secondary" size="sm" className="w-full">Download MP3</Button>
                                                </>
                                            ) : (
                                                <div className="text-center p-4">
                                                    <Music className="w-16 h-16 mx-auto text-muted-foreground" />
                                                    <p className="text-xs mt-2">Audio not stored in history to save space.</p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    {item.tool === 'Video Compressor' && item.data.videoFileName && (
                                        <div className="space-y-2">
                                            <Alert>
                                                <AlertTitle className="text-center text-sm">{item.data.videoFileName}</AlertTitle>
                                                <AlertDescription className="text-center">
                                                    Compressed from {formatBytes(item.data.originalSize || 0)} to {formatBytes(item.data.compressedSize || 0)}
                                                </AlertDescription>
                                            </Alert>
                                            <div className="text-center p-4">
                                                <Video className="w-16 h-16 mx-auto text-muted-foreground" />
                                                <p className="text-xs mt-2">Video compression history does not store the video itself.</p>
                                            </div>
                                        </div>
                                    )}
                                    {item.data.details && !item.data.songs && !item.data.humanizedText && (
                                        <div className="space-y-2">
                                            <p className="text-sm p-3 bg-muted/50 rounded-md">{item.data.details}</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>
            )}
        </div>
    );
}
