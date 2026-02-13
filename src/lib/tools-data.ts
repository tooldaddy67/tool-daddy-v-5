import {
    Image, Video, Music, FileText, Code2, ShieldAlert,
    Wifi, Calculator, Palette, type LucideIcon,
    Bot, QrCode, Link as LinkIcon, Clock, Fingerprint,
    Binary, Database, Globe, Key, Lock, Search, Terminal,
    Type, UserCircle, Wand2, Smartphone, Download,
    Volume2, Languages, List, CheckSquare, Timer, MessageCircle, Percent, Thermometer
} from "lucide-react";

export interface Tool {
    name: string;
    description: string;
    href: string;
    icon: LucideIcon;
    isNew?: boolean;
    isPopular?: boolean;
    isExternal?: boolean;
    desktopOnly?: boolean;
}

export interface ToolCategory {
    title: string;
    slug: string;
    icon: LucideIcon;
    tools: Tool[];
}

export const ALL_TOOLS_CATEGORIES: ToolCategory[] = [
    {
        title: "Media Studio",
        slug: "media",
        icon: Image,
        tools: [
            { name: "Image Compressor", description: "Compress images locally", href: "/image-compressor", icon: Image, isPopular: true },
            { name: "Image Converter", description: "Convert between formats", href: "/image-converter", icon: Image },
            { name: "Video Compressor", description: "Reduce video size", href: "/video-compressor", icon: Video, isPopular: true },
            { name: "Video to Audio", description: "Extract MP3 from video", href: "/video-to-audio-converter", icon: Music },
            { name: "YouTube Downloader", description: "Download videos", href: "/youtube-downloader", icon: Download, isPopular: true },
            { name: "YouTube to Audio", description: "Convert YT to MP3", href: "/youtube-to-audio", icon: Music },
            { name: "AI Image Enhancer", description: "Upscale & fix images", href: "/ai-image-enhancer", icon: Wand2, isNew: true, desktopOnly: true },
            { name: "Metadata Extractor", description: "View Exif data", href: "/metadata-extractor", icon: FileText },
        ]
    },
    {
        title: "AI & Text",
        slug: "ai-text",
        icon: Bot,
        tools: [
            { name: "AI Text Humanizer", description: "Make AI text natural", href: "/ai-text-humanizer", icon: Bot, isPopular: true },
            { name: "AI Playlist Maker", description: "Generate playlists", href: "/ai-playlist-maker", icon: Music, isNew: true },
            { name: "Simple Notepad", description: "Distraction-free writing", href: "/simple-notepad", icon: FileText, isPopular: true, desktopOnly: true },
        ]
    },
    {
        title: "Security",
        slug: "security",
        icon: ShieldAlert,
        tools: [
            { name: "Password Generator", description: "Strong passwords", href: "/password-generator", icon: Key, isPopular: true },
            { name: "Password Analyzer", description: "Check strength", href: "/password-strength-analyser", icon: ShieldAlert },
        ]
    },
    {
        title: "Converters",
        slug: "converters",
        icon: Calculator,
        tools: [
            { name: "Date/Time Converter", description: "Timezones & Epoch", href: "/date-time-converter", icon: Clock },
            { name: "Temperature", description: "C/F/K converter", href: "/temperature-converter", icon: Thermometer },
        ]
    },
    {
        title: "Productivity",
        slug: "productivity",
        icon: CheckSquare,
        tools: [
            { name: "To-Do List", description: "Manage tasks", href: "/todo-list", icon: CheckSquare, isPopular: true },
            { name: "QR Generator", description: "Make QR codes", href: "/qr-code-generator", icon: QrCode },
            { name: "Timer & Stopwatch", description: "Countdown & track", href: "/timer-stopwatch", icon: Timer },
            { name: "ETA Calculator", description: "Estimate travel time", href: "/eta-calculator", icon: Clock },
            { name: "Link Shortener", description: "Shorten URLs", href: "/link-shortener", icon: LinkIcon },
            { name: "WhatsApp Link", description: "Direct chat links", href: "/whatsapp-link-generator", icon: MessageCircle },
            { name: "Percentage Calc", description: "Quick math", href: "/percentage-calculator", icon: Percent },
        ]
    },
    {
        title: "Design",
        slug: "design",
        icon: Palette,
        tools: [
            { name: "Palette Generator", description: "Create color schemes", href: "/color-palette-generator", icon: Palette, isPopular: true },
            { name: "Palette Extractor", description: "Get colors from image", href: "/color-palette-extractor", icon: Image },
        ]
    }
];
