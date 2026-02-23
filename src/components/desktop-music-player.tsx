'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import {
    Play, Pause, SkipForward, SkipBack, Volume2,
    Music, X, Maximize2, Minimize2, Upload,
    MoreVertical, List, GripHorizontal, Trash2, Timer,
    Clock, Palette, CloudRain, Flame, Trees, Wind,
    Repeat, Repeat1, Shuffle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { useSettings } from '@/components/settings-provider';
import { useToast } from '@/hooks/use-toast';

interface Track {
    id: string;
    title: string;
    artist: string;
    url: string;
    isUserAdded?: boolean;
}

const DEFAULT_PLAYLIST: Track[] = [];

export function DesktopMusicPlayer() {
    const { settings, updateSettings } = useSettings();
    const { toast } = useToast();
    const [isOpen, setIsOpen] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
    const [volume, setVolume] = useState(50);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const [playlist, setPlaylist] = useState<Track[]>(DEFAULT_PLAYLIST);
    const [isMinimized, setIsMinimized] = useState(false);
    const [size, setSize] = useState({ width: 400, height: 650 });
    const [position, setPosition] = useState({ x: 100, y: 100 });
    const [showPlaylist, setShowPlaylist] = useState(false);
    const [sleepTimer, setSleepTimer] = useState<number | null>(null); // in minutes
    const [timeLeft, setTimeLeft] = useState<number | null>(null); // in seconds
    const [isTimerActive, setIsTimerActive] = useState(false);

    // NEW FEATURES STATE
    const [theme, setTheme] = useState<'emerald' | 'cyberpunk' | 'nord' | 'sakura'>('emerald');
    const [activeOverlay, setActiveOverlay] = useState<string | null>(null);
    const [overlayVolume, setOverlayVolume] = useState(40);
    const overlayAudioRef = useRef<HTMLAudioElement | null>(null);

    const themes = {
        emerald: { primary: '#10b981', glow: 'rgba(16, 185, 129, 0.4)', bg: 'bg-emerald-500/20' },
        cyberpunk: { primary: '#f626af', glow: 'rgba(246, 38, 175, 0.4)', bg: 'bg-pink-500/20' },
        nord: { primary: '#88c0d0', glow: 'rgba(136, 192, 208, 0.4)', bg: 'bg-blue-400/20' },
        sakura: { primary: '#ffb7c5', glow: 'rgba(255, 183, 197, 0.4)', bg: 'bg-rose-300/20' }
    };

    const overlays = [
        { id: 'rain', icon: CloudRain, url: '/audio/atmospheric_sounds/rain.mp3', label: 'Rain' },
        { id: 'fire', icon: Flame, url: '/audio/atmospheric_sounds/fire.mp3', label: 'Fire' },
        { id: 'forest', icon: Trees, url: '/audio/atmospheric_sounds/forest.mp3', label: 'Forest' },
        { id: 'wind', icon: Wind, url: '/audio/atmospheric_sounds/wind.mp3', label: 'Wind' }
    ];

    const [loopMode, setLoopMode] = useState<'none' | 'all' | 'one'>('none');
    const [isShuffle, setIsShuffle] = useState(false);

    // Media Key Integration
    useEffect(() => {
        if ('mediaSession' in navigator && playlist[currentTrackIndex]) {
            const track = playlist[currentTrackIndex];
            navigator.mediaSession.metadata = new MediaMetadata({
                title: track.title,
                artist: track.artist,
                album: 'Tool Daddy Music',
                artwork: [
                    { src: 'https://tooldaddy.com/logo.png', sizes: '512x512', type: 'image/png' }
                ]
            });

            navigator.mediaSession.setActionHandler('play', () => setIsPlaying(true));
            navigator.mediaSession.setActionHandler('pause', () => setIsPlaying(false));
            navigator.mediaSession.setActionHandler('previoustrack', handlePrev);
            navigator.mediaSession.setActionHandler('nexttrack', handleNext);
        }
    }, [currentTrackIndex, playlist]);

    // Nature Overlay Effect
    useEffect(() => {
        if (overlayAudioRef.current) {
            if (activeOverlay) {
                const source = overlays.find(o => o.id === activeOverlay)?.url;
                if (source) {
                    overlayAudioRef.current.src = source;
                    overlayAudioRef.current.loop = true;
                    overlayAudioRef.current.volume = overlayVolume / 100;
                    overlayAudioRef.current.play().catch(e => console.log("Overlay play blocked"));
                }
            } else {
                overlayAudioRef.current.pause();
            }
        }
    }, [activeOverlay]);

    useEffect(() => {
        if (overlayAudioRef.current) {
            overlayAudioRef.current.volume = overlayVolume / 100;
        }
    }, [overlayVolume]);

    const toggleOverlay = (id: string) => {
        setActiveOverlay(prev => prev === id ? null : id);
    };

    // Sleep Timer Logic
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isTimerActive && timeLeft !== null && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft(prev => (prev !== null ? prev - 1 : null));
            }, 1000);
        } else if (timeLeft === 0 && isTimerActive) {
            handleTimerEnd();
        }
        return () => clearInterval(interval);
    }, [isTimerActive, timeLeft]);

    const handleTimerEnd = async () => {
        setIsTimerActive(false);
        setSleepTimer(null);
        setTimeLeft(null);

        // Professional Fade Out
        if (audioRef.current) {
            const startVolume = audioRef.current.volume;
            let currentVol = startVolume;
            const fadeInterval = setInterval(() => {
                currentVol -= 0.05;
                if (currentVol <= 0) {
                    clearInterval(fadeInterval);
                    setIsPlaying(false);
                    if (audioRef.current) {
                        audioRef.current.volume = startVolume; // Reset for next play
                    }
                    toast({
                        title: "Concentration Session Ended",
                        description: "Music stopped as scheduled. Great work!",
                    });
                } else if (audioRef.current) {
                    audioRef.current.volume = currentVol;
                }
            }, 100);
        }
    };

    const startTimer = (mins: number) => {
        setSleepTimer(mins);
        setTimeLeft(mins * 60);
        setIsTimerActive(true);
        toast({
            title: "Sleep Timer Set",
            description: `Music will stop in ${mins} minutes.`,
        });
    };

    const [isDesktop, setIsDesktop] = useState(false);

    useEffect(() => {
        const checkDesktop = () => setIsDesktop(window.innerWidth >= 1280);
        checkDesktop();
        window.addEventListener('resize', checkDesktop);
        return () => window.removeEventListener('resize', checkDesktop);
    }, []);

    const audioRef = useRef<HTMLAudioElement | null>(null);
    const playerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setIsOpen(settings.showMusicPlayer);
    }, [settings.showMusicPlayer]);

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = volume / 100;
        }
    }, [volume]);

    useEffect(() => {
        if (isPlaying && audioRef.current) {
            const playPromise = audioRef.current.play();
            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    console.error("Playback failed:", error);
                    setIsPlaying(false);
                });
            }
        } else {
            audioRef.current?.pause();
        }
    }, [isPlaying, currentTrackIndex]);
    // IndexedDB setup for persistent music
    useEffect(() => {
        const initDB = async () => {
            const request = indexedDB.open('ToolDaddyMusic', 1);

            request.onupgradeneeded = (e: any) => {
                const db = e.target.result;
                if (!db.objectStoreNames.contains('user_music')) {
                    db.createObjectStore('user_music', { keyPath: 'id' });
                }
            };

            request.onsuccess = (e: any) => {
                const db = e.target.result;
                const transaction = db.transaction(['user_music'], 'readonly');
                const store = transaction.objectStore('user_music');
                const getAll = store.getAll();

                getAll.onsuccess = () => {
                    const savedTracks = getAll.result.map((item: any) => ({
                        ...item,
                        url: URL.createObjectURL(item.file) // Re-create blob URL from stored binary
                    }));
                    if (savedTracks.length > 0) {
                        setPlaylist([...DEFAULT_PLAYLIST, ...savedTracks]);
                    }
                };
            };
        };

        initDB();
    }, []);

    const saveTrackToDB = (track: Track, file: File) => {
        const request = indexedDB.open('ToolDaddyMusic', 1);
        request.onsuccess = (e: any) => {
            const db = e.target.result;
            const transaction = db.transaction(['user_music'], 'readwrite');
            const store = transaction.objectStore('user_music');
            // Store the actual file object (binary) which IndexedDB supports
            store.put({
                id: track.id,
                title: track.title,
                artist: track.artist,
                file: file,
                isUserAdded: true
            });
        };
    };

    const deleteTrackFromDB = (id: string) => {
        const request = indexedDB.open('ToolDaddyMusic', 1);
        request.onsuccess = (e: any) => {
            const db = e.target.result;
            const transaction = db.transaction(['user_music'], 'readwrite');
            const store = transaction.objectStore('user_music');
            store.delete(id);
        };
    };

    const handleAudioError = () => {
        setIsPlaying(false);
        const failedTrack = playlist[currentTrackIndex];

        toast({
            title: "Playback Issue",
            description: `"${failedTrack?.title || 'Track'}" could not be loaded. Please check your connection or try another song.`,
            variant: "destructive"
        });

        console.error("Audio error on track:", {
            id: failedTrack?.id,
            title: failedTrack?.title,
            url: failedTrack?.url
        });
    };

    const removeTrack = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        const indexToRemove = playlist.findIndex(t => t.id === id);
        const trackToDelete = playlist[indexToRemove];

        if (trackToDelete.isUserAdded) {
            deleteTrackFromDB(id);
        }

        setPlaylist(prev => prev.filter(t => t.id !== id));

        if (indexToRemove < currentTrackIndex) {
            setCurrentTrackIndex(prev => prev - 1);
        } else if (indexToRemove === currentTrackIndex) {
            setIsPlaying(false);
            setCurrentTrackIndex(0);
        }
    };

    const handleTimeUpdate = () => {
        if (audioRef.current) {
            setProgress((audioRef.current.currentTime / audioRef.current.duration) * 100);
            setDuration(audioRef.current.duration);
        }
    };

    const handleTrackEnd = () => {
        if (loopMode === 'one') {
            if (audioRef.current) {
                audioRef.current.currentTime = 0;
                audioRef.current.play();
            }
        } else if (loopMode === 'all' || isShuffle) {
            handleNext();
        } else {
            if (currentTrackIndex < playlist.length - 1) {
                handleNext();
            } else {
                setIsPlaying(false);
            }
        }
    };

    const handleNext = () => {
        if (playlist.length === 0) return;
        if (isShuffle) {
            let nextIndex;
            do {
                nextIndex = Math.floor(Math.random() * playlist.length);
            } while (nextIndex === currentTrackIndex && playlist.length > 1);
            setCurrentTrackIndex(nextIndex);
        } else {
            setCurrentTrackIndex((prev) => (prev + 1) % playlist.length);
        }
    };

    const handlePrev = () => {
        if (playlist.length === 0) return;
        if (isShuffle) {
            let nextIndex;
            do {
                nextIndex = Math.floor(Math.random() * playlist.length);
            } while (nextIndex === currentTrackIndex && playlist.length > 1);
            setCurrentTrackIndex(nextIndex);
        } else {
            setCurrentTrackIndex((prev) => (prev - 1 + playlist.length) % playlist.length);
        }
    };

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
    const animationFrameRef = useRef<number>();

    // Initial Audio Context Setup
    const initAudioContext = useCallback(() => {
        if (audioContextRef.current || !audioRef.current) return;

        try {
            const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
            const ctx = new AudioContextClass();
            const analyser = ctx.createAnalyser();
            analyser.fftSize = 128; // Shorter for cleaner bars

            const source = ctx.createMediaElementSource(audioRef.current);
            source.connect(analyser);
            analyser.connect(ctx.destination);

            audioContextRef.current = ctx;
            analyserRef.current = analyser;
            sourceRef.current = source;
        } catch (e) {
            console.error("Visualizer init failed:", e);
        }
    }, []);

    // Drawing Loop
    useEffect(() => {
        if (!isPlaying || !analyserRef.current || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const analyser = analyserRef.current;
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const draw = () => {
            animationFrameRef.current = requestAnimationFrame(draw);
            analyser.getByteFrequencyData(dataArray);

            const width = canvas.width;
            const height = canvas.height;
            ctx.clearRect(0, 0, width, height);

            const barWidth = (width / bufferLength) * 2;
            let x = 0;

            for (let i = 0; i < bufferLength; i++) {
                const barHeight = (dataArray[i] / 255) * height * 0.8;

                // Beautiful neon gradient
                const gradient = ctx.createLinearGradient(0, height, 0, height - barHeight);
                const currentTheme = themes[theme];
                gradient.addColorStop(0, `${currentTheme.primary}22`);
                gradient.addColorStop(1, currentTheme.primary);

                ctx.fillStyle = gradient;
                // Rounded bar effect
                ctx.beginPath();
                ctx.roundRect(x, height - barHeight, barWidth - 2, barHeight, [4, 4, 0, 0]);
                ctx.fill();

                x += barWidth;
            }
        };

        draw();
        return () => {
            if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
        };
    }, [isPlaying]);

    const dragControls = useDragControls();

    const handlePlayPause = () => {
        if (playlist.length === 0) {
            toast({ title: "No music in playlist", description: "Upload some music to get started!" });
            return;
        }

        // Resume context if suspended (browser requirement)
        if (audioContextRef.current?.state === 'suspended') {
            audioContextRef.current.resume();
        } else if (!audioContextRef.current) {
            initAudioContext();
        }

        setIsPlaying(!isPlaying);
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            const filesArray = Array.from(files);
            const newTracks: Track[] = filesArray.map((file, index) => ({
                id: `user-${Date.now()}-${index}`,
                title: file.name.replace(/\.[^/.]+$/, ""),
                artist: 'My Upload',
                url: URL.createObjectURL(file),
                isUserAdded: true
            }));

            // Save to IndexedDB for persistence
            newTracks.forEach((track, index) => {
                saveTrackToDB(track, filesArray[index]);
            });

            setPlaylist([...playlist, ...newTracks]);
            toast({ title: "Music Added", description: `${newTracks.length} tracks added to playlist.` });
        }
    };

    const currentTrack = playlist[currentTrackIndex];

    const toggleMaximize = () => {
        if (size.width === 700) {
            setSize({ width: 400, height: 650 });
        } else {
            setSize({ width: 700, height: 750 });
        }
    };



    if (!isOpen || !isDesktop) return null;

    return (
        <AnimatePresence>
            <motion.div
                ref={playerRef}
                drag
                dragControls={dragControls}
                dragListener={false}
                dragMomentum={false}
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{
                    opacity: 1,
                    scale: 1,
                    y: 0,
                    width: isMinimized ? 300 : size.width,
                    height: isMinimized ? 60 : size.height
                }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                style={{
                    position: 'fixed',
                    zIndex: 100,
                    left: position.x,
                    top: position.y,
                    maxWidth: '90vw',
                    maxHeight: '90vh'
                }}
                className={cn(
                    "bg-card/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-card-foreground",
                    "hover:border-primary/30 transition-colors duration-500"
                )}
            >
                {/* Mac Window Header */}
                <div
                    className="h-10 flex items-center px-4 bg-muted/30 border-b border-white/5 cursor-move touch-none"
                    onPointerDown={(e) => dragControls.start(e)}
                    style={{ borderColor: `${themes[theme].primary}22` }}
                >
                    <div className="flex gap-2 mr-4">
                        <button
                            onClick={() => updateSettings({ showMusicPlayer: false })}
                            className="w-3 h-3 rounded-full bg-red-500/80 hover:bg-red-500 transition-colors flex items-center justify-center group"
                        >
                            <X className="w-2 h-2 text-black/60" />
                        </button>
                        <button
                            onClick={() => setIsMinimized(!isMinimized)}
                            className="w-3 h-3 rounded-full bg-yellow-500/80 hover:bg-yellow-500 transition-colors flex items-center justify-center group"
                        >
                            <Minimize2 className="w-2 h-2 text-black/60" />
                        </button>
                        <button
                            onClick={toggleMaximize}
                            className="w-3 h-3 rounded-full bg-green-500/80 hover:bg-green-500 transition-colors flex items-center justify-center group"
                        >
                            <Maximize2 className="w-2 h-2 text-black/60" />
                        </button>
                    </div>
                    <div className="flex-1 text-center">
                        <span
                            className="text-[10px] font-bold uppercase tracking-widest opacity-50 flex items-center justify-center gap-1"
                            style={{ color: themes[theme].primary }}
                        >
                            <Music className="w-3 h-3" /> Tool Daddy Player
                        </span>
                    </div>
                    <div className="w-16"></div>
                </div>

                {/* Player Content */}
                {!isMinimized && (
                    <div className="flex-1 flex flex-col p-6 gap-6 relative overflow-hidden">
                        {/* THEME GLOW */}
                        <div
                            className="absolute -top-24 -left-24 w-64 h-64 rounded-full blur-[100px] opacity-20 animate-pulse pointer-events-none"
                            style={{ backgroundColor: themes[theme].primary }}
                        />

                        {/* Visualizer Placeholder / Album Art */}
                        <div
                            className={cn(
                                "w-full rounded-xl bg-muted/10 border border-white/5 flex items-center justify-center relative group overflow-hidden transition-all duration-500",
                                showPlaylist ? "h-[500px] w-[90%] left-1/2 -translate-x-1/2 z-50 absolute top-0" : "w-full aspect-square" // Increased playlist height by 40% and decreased width by 10%
                            )}
                            style={{ borderColor: `${themes[theme].primary}33` }}
                        >
                            <canvas
                                ref={canvasRef}
                                className="absolute inset-0 w-full h-full opacity-50 z-0"
                                width={600}
                                height={600}
                            />
                            <div
                                className={cn(
                                    "absolute inset-0 animate-pulse z-10",
                                    isPlaying ? "opacity-100" : "opacity-0"
                                )}
                                style={{ background: `linear-gradient(to bottom right, ${themes[theme].primary}33, transparent)` }}
                            />
                            <Music
                                className={cn(
                                    "w-24 h-24 relative z-20",
                                    isPlaying && "animate-bounce"
                                )}
                                style={{ color: themes[theme].primary, opacity: 0.3 }}
                            />

                            {/* Overlay for playlist info */}
                            {showPlaylist && (
                                <div className="absolute inset-0 bg-background/95 backdrop-blur-xl animate-in fade-in flex flex-col z-20">
                                    <div className="p-4 border-b border-white/5 flex justify-between items-center bg-muted/20">
                                        <span className="text-xs font-bold uppercase tracking-tighter opacity-70">My Playlist</span>
                                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setShowPlaylist(false)}>
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    <div className="flex-1 overflow-y-auto no-scrollbar p-2">
                                        {playlist.length === 0 ? (
                                            <div className="h-full flex flex-col items-center justify-center opacity-40 text-center p-4">
                                                <Music className="w-8 h-8 mb-2" />
                                                <p className="text-xs">Your playlist is empty</p>
                                            </div>
                                        ) : (
                                            playlist.map((track, index) => (
                                                <div
                                                    key={track.id}
                                                    onClick={() => setCurrentTrackIndex(index)}
                                                    className={cn(
                                                        "w-full text-left p-3 rounded-xl text-sm flex items-center gap-3 transition-all cursor-pointer group mb-1",
                                                        currentTrackIndex === index ? "bg-primary/20 text-primary font-bold border border-primary/20" : "hover:bg-white/5"
                                                    )}
                                                >
                                                    <div className={cn(
                                                        "w-2 h-2 rounded-full transition-all",
                                                        currentTrackIndex === index ? "bg-primary glow-sm" : "bg-muted-foreground/30"
                                                    )} />
                                                    <div className="flex-1 truncate">
                                                        <div className="truncate">{track.title}</div>
                                                        <div className="text-[10px] opacity-60 font-medium truncate">{track.artist}</div>
                                                    </div>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-500 hover:bg-red-500/10"
                                                        onClick={(e) => removeTrack(e, track.id)}
                                                    >
                                                        <Trash2 className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                    <div className="p-4 border-t border-white/5 mt-auto">
                                        <label className="w-full">
                                            <div className="flex items-center justify-center gap-2 p-3 border-2 border-dashed border-primary/20 rounded-2xl cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all group">
                                                <Upload className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
                                                <span className="text-xs font-bold uppercase tracking-wide">Import Own Music</span>
                                            </div>
                                            <input type="file" accept="audio/*" multiple className="hidden" onChange={handleFileUpload} />
                                        </label>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Title & Artist */}
                        <div className="text-center min-h-[60px] flex flex-col justify-center">
                            {currentTrack ? (
                                <>
                                    <h3 className="text-xl font-bold truncate leading-tight">{currentTrack.title}</h3>
                                    <p className="text-sm text-muted-foreground truncate opacity-70">{currentTrack.artist}</p>
                                </>
                            ) : (
                                <>
                                    <h3 className="text-lg font-bold opacity-30 italic">No Track Selected</h3>
                                    <p className="text-xs text-muted-foreground opacity-30 mt-1">Upload music to start listening</p>
                                </>
                            )}
                        </div>

                        {/* Controls */}
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <Slider
                                    value={[progress]}
                                    max={100}
                                    step={0.1}
                                    disabled={!currentTrack}
                                    onValueChange={([val]) => {
                                        if (audioRef.current) {
                                            audioRef.current.currentTime = (val / 100) * audioRef.current.duration;
                                        }
                                    }}
                                    className="cursor-pointer"
                                />
                                <div className="flex justify-between text-[10px] opacity-50 font-mono tracking-tighter">
                                    <span>{formatTime(audioRef.current?.currentTime || 0)}</span>
                                    <span>{formatTime(duration)}</span>
                                </div>
                            </div>

                            <div className="flex items-center justify-center gap-6">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setIsShuffle(!isShuffle)}
                                    className={cn("h-8 w-8 transition-all", isShuffle ? "opacity-100" : "opacity-30 hover:opacity-100")}
                                    style={{ color: isShuffle ? themes[theme].primary : 'inherit' }}
                                >
                                    <Shuffle className="h-4 w-4" />
                                </Button>

                                <Button variant="ghost" size="icon" onClick={handlePrev} disabled={playlist.length <= 1} className="hover:scale-125 transition-all active:scale-95" style={{ color: themes[theme].primary }}>
                                    <SkipBack className="h-6 w-6" />
                                </Button>

                                <Button
                                    onClick={handlePlayPause}
                                    disabled={playlist.length === 0}
                                    className="w-16 h-16 rounded-full text-primary-foreground shadow-2xl transition-all active:scale-90"
                                    style={{
                                        backgroundColor: themes[theme].primary,
                                        boxShadow: `0 20px 40px -12px ${themes[theme].glow}`
                                    }}
                                >
                                    {isPlaying ? <Pause className="h-8 w-8" /> : <Play className="h-8 w-8 ml-1" />}
                                </Button>

                                <Button variant="ghost" size="icon" onClick={handleNext} disabled={playlist.length <= 1} className="hover:scale-125 transition-all active:scale-95" style={{ color: themes[theme].primary }}>
                                    <SkipForward className="h-6 w-6" />
                                </Button>

                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => {
                                        if (loopMode === 'none') setLoopMode('all');
                                        else if (loopMode === 'all') setLoopMode('one');
                                        else setLoopMode('none');
                                    }}
                                    className={cn("h-8 w-8 transition-all relative", loopMode !== 'none' ? "opacity-100" : "opacity-30 hover:opacity-100")}
                                    style={{ color: loopMode !== 'none' ? themes[theme].primary : 'inherit' }}
                                >
                                    {loopMode === 'one' ? <Repeat1 className="h-4 w-4" /> : <Repeat className="h-4 w-4" />}
                                </Button>
                            </div>

                            <div className="flex items-center gap-4 px-2">
                                <div className="p-2 rounded-full bg-muted/30">
                                    <Volume2 className="h-4 w-4 opacity-70" />
                                </div>
                                <Slider
                                    value={[volume]}
                                    max={100}
                                    onValueChange={([val]) => setVolume(val)}
                                    className="flex-1 cursor-pointer"
                                />

                                <div className="flex items-center gap-1 border-l border-white/10 pl-4">
                                    {/* Theme Picker */}
                                    <div className="relative group/themes">
                                        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-muted transition-all">
                                            <Palette className="h-5 w-5" style={{ color: themes[theme].primary }} />
                                        </Button>
                                        <div className="absolute bottom-full right-0 mb-2 p-2 bg-popover border border-white/10 rounded-xl shadow-2xl opacity-0 invisible group-hover/themes:opacity-100 group-hover/themes:visible transition-all z-50 flex gap-2">
                                            {Object.keys(themes).map((t) => (
                                                <button
                                                    key={t}
                                                    onClick={() => setTheme(t as any)}
                                                    className={cn(
                                                        "w-6 h-6 rounded-full border-2 transition-all",
                                                        theme === t ? "border-white scale-110" : "border-transparent opacity-50 hover:opacity-100"
                                                    )}
                                                    style={{ backgroundColor: themes[t as keyof typeof themes].primary }}
                                                />
                                            ))}
                                        </div>
                                    </div>

                                    {/* Atmosphere Picker */}
                                    <div className="relative group/atm">
                                        <Button variant="ghost" size="icon" className={cn("h-10 w-10 rounded-xl transition-all", activeOverlay ? "bg-primary/20" : "hover:bg-muted")}>
                                            <Wind className="h-5 w-5" style={{ color: activeOverlay ? themes[theme].primary : 'inherit' }} />
                                        </Button>
                                        <div className="absolute bottom-full right-0 mb-2 p-3 bg-popover border border-white/10 rounded-xl shadow-2xl opacity-0 invisible group-hover/atm:opacity-100 group-hover/atm:visible transition-all z-50 min-w-[200px]">
                                            <div className="text-[10px] font-bold uppercase opacity-50 mb-3 px-1">Atmosphere Focus</div>
                                            <div className="grid grid-cols-4 gap-2 mb-4">
                                                {overlays.map((ov) => {
                                                    const Icon = ov.icon;
                                                    return (
                                                        <button
                                                            key={ov.id}
                                                            onClick={() => toggleOverlay(ov.id)}
                                                            className={cn(
                                                                "p-2 rounded-lg flex flex-col items-center gap-1 transition-all",
                                                                activeOverlay === ov.id ? "bg-primary/20 scale-105" : "hover:bg-white/5 opacity-50"
                                                            )}
                                                        >
                                                            <Icon className="w-5 h-5" style={{ color: activeOverlay === ov.id ? themes[theme].primary : 'inherit' }} />
                                                            <span className="text-[8px] font-bold uppercase">{ov.label}</span>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                            <div className="space-y-2">
                                                <div className="flex justify-between text-[8px] font-bold uppercase opacity-50 px-1">
                                                    <span>Atmosphere Volume</span>
                                                    <span>{overlayVolume}%</span>
                                                </div>
                                                <Slider
                                                    value={[overlayVolume]}
                                                    onValueChange={([v]) => setOverlayVolume(v)}
                                                    max={100}
                                                    className="h-1 underline"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="relative group/timer">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className={cn(
                                                "h-10 w-10 rounded-xl transition-all",
                                                isTimerActive ? "shadow-inner bg-primary/10" : "hover:bg-muted"
                                            )}
                                            style={{ color: isTimerActive ? themes[theme].primary : 'inherit' }}
                                        >
                                            <Timer className="h-5 w-5" />
                                        </Button>

                                        {/* Timer Menu */}
                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-2 bg-popover border border-white/10 rounded-xl shadow-2xl opacity-0 invisible group-hover/timer:opacity-100 group-hover/timer:visible transition-all z-50 min-w-[120px]">
                                            <div className="text-[10px] font-bold uppercase opacity-50 px-2 mb-1">Set Timer</div>
                                            {[1, 15, 25, 60].map(mins => (
                                                <button
                                                    key={mins}
                                                    onClick={() => startTimer(mins)}
                                                    className="w-full text-left px-2 py-1.5 hover:bg-primary/20 rounded-lg text-xs transition-colors flex justify-between items-center"
                                                >
                                                    <span>{mins}m</span>
                                                    {sleepTimer === mins && <div className="w-1.5 h-1.5 bg-primary rounded-full" />}
                                                </button>
                                            ))}
                                            {isTimerActive && (
                                                <button
                                                    onClick={() => {
                                                        setIsTimerActive(false);
                                                        setSleepTimer(null);
                                                        setTimeLeft(null);
                                                    }}
                                                    className="w-full text-left px-2 py-1.5 hover:bg-red-500/20 text-red-500 rounded-lg text-xs transition-colors mt-1 border-t border-white/5 pt-2"
                                                >
                                                    Cancel
                                                </button>
                                            )}
                                        </div>

                                        {/* Countdown Tooltip */}
                                        {isTimerActive && timeLeft !== null && (
                                            <div className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[8px] font-bold px-1 rounded-full animate-bounce">
                                                {Math.ceil(timeLeft / 60)}m
                                            </div>
                                        )}
                                    </div>

                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className={cn(
                                            "h-10 w-10 rounded-xl transition-all",
                                            showPlaylist ? "bg-primary/20 text-primary shadow-inner" : "hover:bg-muted"
                                        )}
                                        onClick={() => setShowPlaylist(!showPlaylist)}
                                    >
                                        <List className="h-5 w-5" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Minimized View */}
                {isMinimized && (
                    <div className="flex-1 flex items-center px-4 gap-4 animate-in slide-in-from-top-4 duration-300">
                        <Button variant="ghost" size="icon" className="h-10 w-10 hover:bg-primary/10 hover:text-primary transition-colors" onClick={handlePlayPause} disabled={playlist.length === 0}>
                            {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
                        </Button>
                        <div className="flex-1 truncate">
                            <span className="text-xs font-bold leading-none">{currentTrack ? currentTrack.title : 'No track'}</span>
                            {currentTrack && <div className="text-[10px] opacity-60 leading-none mt-0.5">{currentTrack.artist}</div>}
                        </div>
                        <Button variant="ghost" size="icon" className="h-10 w-10 hover:bg-muted transition-colors" onClick={() => setIsMinimized(false)}>
                            <Maximize2 className="h-4 w-4" />
                        </Button>
                    </div>
                )}

                {/* Main Audio Element */}
                <audio
                    ref={audioRef}
                    src={currentTrack?.url}
                    onTimeUpdate={handleTimeUpdate}
                    onEnded={handleTrackEnd}
                    onLoadedMetadata={handleTimeUpdate}
                    onError={handleAudioError}
                    preload="none"
                />

                {/* Atmosphere Overlay Audio */}
                <audio
                    ref={overlayAudioRef}
                    preload="auto"
                    crossOrigin="anonymous"
                />

                {/* Resize Handles (Windows 11 Style) */}
                {!isMinimized && (
                    <>
                        {/* Right Edge */}
                        <div
                            className="absolute top-0 right-0 w-1.5 h-full cursor-ew-resize z-50 hover:bg-primary/10 transition-colors"
                            onMouseDown={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                const startWidth = size.width;
                                const startX = e.clientX;
                                const onMouseMove = (moveEvent: MouseEvent) => {
                                    setSize(prev => ({
                                        ...prev,
                                        width: Math.max(300, startWidth + (moveEvent.clientX - startX))
                                    }));
                                };
                                const onMouseUp = () => {
                                    window.removeEventListener('mousemove', onMouseMove);
                                    window.removeEventListener('mouseup', onMouseUp);
                                };
                                window.addEventListener('mousemove', onMouseMove);
                                window.addEventListener('mouseup', onMouseUp);
                            }}
                        />
                        {/* Bottom Edge */}
                        <div
                            className="absolute bottom-0 left-0 w-full h-1.5 cursor-ns-resize z-50 hover:bg-primary/10 transition-colors"
                            onMouseDown={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                const startHeight = size.height;
                                const startY = e.clientY;
                                const onMouseMove = (moveEvent: MouseEvent) => {
                                    setSize(prev => ({
                                        ...prev,
                                        height: Math.max(400, startHeight + (moveEvent.clientY - startY))
                                    }));
                                };
                                const onMouseUp = () => {
                                    window.removeEventListener('mousemove', onMouseMove);
                                    window.removeEventListener('mouseup', onMouseUp);
                                };
                                window.addEventListener('mousemove', onMouseMove);
                                window.addEventListener('mouseup', onMouseUp);
                            }}
                        />
                        {/* Bottom-Right Corner */}
                        <div
                            className="absolute bottom-0 right-0 w-4 h-4 cursor-nwse-resize z-[60] flex items-center justify-center group/resize"
                            onMouseDown={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                const startWidth = size.width;
                                const startHeight = size.height;
                                const startX = e.clientX;
                                const startY = e.clientY;
                                const onMouseMove = (moveEvent: MouseEvent) => {
                                    setSize({
                                        width: Math.max(300, startWidth + (moveEvent.clientX - startX)),
                                        height: Math.max(400, startHeight + (moveEvent.clientY - startY)),
                                    });
                                };
                                const onMouseUp = () => {
                                    window.removeEventListener('mousemove', onMouseMove);
                                    window.removeEventListener('mouseup', onMouseUp);
                                };
                                window.addEventListener('mousemove', onMouseMove);
                                window.addEventListener('mouseup', onMouseUp);
                            }}
                        >
                            <div className="w-1.5 h-1.5 bg-primary/20 rounded-full opacity-0 group-hover/resize:opacity-100 transition-opacity" />
                        </div>
                    </>
                )}
            </motion.div>
        </AnimatePresence>
    );
}

function formatTime(seconds: number) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}
