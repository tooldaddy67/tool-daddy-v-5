
import {
    Image, Video, Music, FileText, Code2, ShieldAlert,
    Wifi, Calculator, Palette, type LucideIcon,
    Bot, QrCode, Link as LinkIcon, Clock, Fingerprint,
    Binary, Database, Globe, Key, Lock, Search, Terminal,
    Type, UserCircle, Wand2, Smartphone, Download,
    Volume2, Languages, List, CheckSquare, Timer, MessageCircle, Percent, Thermometer,
    Sparkles, KeyRound, Notebook, ListMusic, Share2, Pencil, ListTodo, Users,
    Coffee, Signal, FileSearch, Paintbrush, Router, ChevronsUpDown, Plus, Factory,
    Shuffle, Hash, ShieldCheck, ListOrdered, AlignLeft, Equal, FileKey, Gauge,
    FileBadge, Calendar, Zap, Dna, GraduationCap, Compass, Network, GitCompare,
    History, MessageSquare, ShieldAlert as ShieldAlertIcon,
    Minimize, Replace
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
    isMobileFriendly?: boolean;
}

export interface ToolCategory {
    title: string;
    slug: string;
    icon: LucideIcon;
    tools: Tool[];
}

export const ALL_TOOLS_CATEGORIES: ToolCategory[] = [
    {
        title: "Productivity",
        slug: "productivity",
        icon: CheckSquare,
        tools: [
            { name: "Simple Notepad", description: "A simple notepad for quick notes with rich text support.", href: "/simple-notepad", icon: Notebook, desktopOnly: true, isPopular: true },
            { name: "Timer & Stopwatch", description: "A simple timer and stopwatch for tracking time.", href: "/timer-stopwatch", icon: Timer, isMobileFriendly: true },
            { name: "To-Do List", description: "A minimalist to-do list to keep you on track.", href: "/todo-list", icon: ListTodo, isPopular: true, isMobileFriendly: true },
        ]
    },
    {
        title: "AI Tools",
        slug: "ai",
        icon: Bot,
        tools: [
            { name: "AI Text Humanizer", description: "Refine AI-generated text to sound more natural and human.", href: "/ai-text-humanizer", icon: Bot, isPopular: true, isMobileFriendly: true },
            { name: "AI Image Enhancer", description: "Upscale and enhance your images locally.", href: "/ai-image-enhancer", icon: Sparkles, isNew: true, desktopOnly: true },
            { name: "AI Playlist Maker", description: "Generate a music playlist based on a vibe or prompt.", href: "/ai-playlist-maker", icon: ListMusic, isNew: true, isMobileFriendly: true },
            { name: "Numeronym Generator", description: "Shorten words by replacing middle letters with their count.", href: "/numeronym-generator", icon: Hash, isMobileFriendly: true },
        ]
    },
    {
        title: "Media Studio",
        slug: "media",
        icon: Image,
        tools: [
            { name: "Image Compressor", description: "Reduce image file size while maintaining quality.", href: "/image-compressor", icon: Minimize, isPopular: true, isMobileFriendly: true },
            { name: "Image Converter", description: "Convert images between formats like PNG, JPEG, and WEBP.", href: "/image-converter", icon: Replace, isMobileFriendly: true },
            { name: "Color Palette Extractor", description: "Extract a color palette from an uploaded image.", href: "/color-palette-extractor", icon: Palette, isMobileFriendly: true },
            { name: "Metadata Extractor", description: "Extract and view metadata like EXIF data from your files.", href: "/metadata-extractor", icon: FileSearch, isMobileFriendly: true },
            { name: "Video to Audio", description: "Extract audio from your own video files and save as MP3.", href: "/video-to-audio-converter", icon: Music, isMobileFriendly: true },
            { name: "Video Compressor", description: "Reduce video file size via a high-quality service.", href: "/video-compressor", icon: Video, isPopular: true },
            { name: "YouTube Downloader", description: "Download YouTube videos easily.", href: "/youtube-downloader", icon: Download, isPopular: true },
            { name: "YouTube to Audio", description: "Convert YouTube videos to audio.", href: "/youtube-to-audio", icon: Music, isPopular: true },
        ]
    },
    {
        title: "Creative",
        slug: "creative",
        icon: Pencil,
        tools: [
            { name: "Drawing Canvas", description: "A minimalist canvas for quick sketches and notes.", href: "/drawing-canvas", icon: Pencil, desktopOnly: true },
            { name: "Palette Generator", description: "Create beautiful color schemes for your projects.", href: "/color-palette-generator", icon: Paintbrush, isPopular: true, isMobileFriendly: true },
            { name: "ASCII Art Generator", description: "Turn your text into stylized ASCII banners.", href: "/ascii-art-generator", icon: Terminal, isMobileFriendly: true },
        ]
    },
    {
        title: "Data Tools",
        slug: "data",
        icon: Database,
        tools: [
            { name: "JSON Formatter", description: "Format, validate, and beautify your JSON data.", href: "/json-formatter", icon: FileSearch, isMobileFriendly: true },
            { name: "JSON Tree Viewer", description: "Visualize your JSON data in an interactive tree format.", href: "/json-tree-viewer", icon: Network, desktopOnly: true },
            { name: "YAML ↔ JSON", description: "Convert between YAML and JSON formats.", href: "/yaml-json-converter", icon: Replace, desktopOnly: true },
            { name: "SQL Formatter", description: "Format and beautify your SQL queries.", href: "/sql-formatter", icon: Database, desktopOnly: true },
            { name: "Text to ASCII & Binary", description: "Convert text to Binary, Decimal, and Hex code.", href: "/text-to-ascii-binary", icon: Binary, isMobileFriendly: true },
        ]
    },
    {
        title: "Encoding Tools",
        slug: "encoding",
        icon: Lock,
        tools: [
            { name: "Base64 String", description: "Encode and decode text strings to Base64.", href: "/base64-string", icon: Lock, isMobileFriendly: true },
            { name: "Base64 File", description: "Convert any file to Base64 or back to file.", href: "/base64-file", icon: Lock, isMobileFriendly: true },
            { name: "URL Encoder", description: "Encode and decode URLs safely.", href: "/url-encoder", icon: LinkIcon, isMobileFriendly: true },
        ]
    },
    {
        title: "Security Tools",
        slug: "security",
        icon: ShieldAlertIcon,
        tools: [
            { name: "Password Generator", description: "Create strong, secure, and random passwords.", href: "/password-generator", icon: KeyRound, isPopular: true, isMobileFriendly: true },
            { name: "Password Analyzer", description: "Check the security and entropy of your passwords.", href: "/password-strength-analyser", icon: ShieldAlertIcon, isMobileFriendly: true },
            { name: "JWT Decoder", description: "Decode and inspect JSON Web Tokens.", href: "/jwt-decoder", icon: ShieldCheck, isMobileFriendly: true },
            { name: "Hash Generator", description: "Generate cryptographic hashes (SHA-256, SHA-512, etc.).", href: "/hash-text", icon: Hash, isMobileFriendly: true },
            { name: "String Obfuscator", description: "Scramble or transform text using various methods.", href: "/string-obfuscator", icon: ShieldAlertIcon, isMobileFriendly: true },
            { name: "Bcrypt Tool", description: "Hash and verify passwords using Bcrypt algorithm.", href: "/bcrypt-generator", icon: ShieldCheck, isMobileFriendly: true },
            { name: "RSA Key Generator", description: "Generate public and private RSA key pairs.", href: "/rsa-key-generator", icon: FileKey, desktopOnly: true },
            { name: "Encrypt / Decrypt", description: "Securely encrypt and decrypt text using AES.", href: "/encrypt-decrypt-text", icon: Lock, isMobileFriendly: true },
            { name: "HMAC Generator", description: "Compute Hash-based Message Authentication Codes.", href: "/hmac-generator", icon: Equal, isMobileFriendly: true },
        ]
    },
    {
        title: "DevOps Tools",
        slug: "devops",
        icon: Terminal,
        tools: [
            { name: "Cron Parser", description: "Parse cron expressions into human-readable text.", href: "/cron-parser", icon: Clock, isMobileFriendly: true },
            { name: "PostgreSQL Config", description: "Generate optimized PostgreSQL configuration.", href: "/pg-config-generator", icon: Database, desktopOnly: true },
        ]
    },
    {
        title: "Generator Tools",
        slug: "generators",
        icon: Fingerprint,
        tools: [
            { name: "UUIDs Generator", description: "Generate Universally Unique Identifiers (v4).", href: "/uuids-generator", icon: Fingerprint, isMobileFriendly: true },
            { name: "QR Code Generator", description: "Create and customize QR codes for any data.", href: "/qr-code-generator", icon: QrCode, isMobileFriendly: true },
            { name: "Lorem Ipsum", description: "Generate placeholder text for your designs.", href: "/lorem-ipsum", icon: FileText, isMobileFriendly: true },
            { name: "Token Generator", description: "Generate random strings with custom sets.", href: "/token-generator", icon: Shuffle, isMobileFriendly: true },
            { name: "ULID Generator", description: "Generate lexicographically sortable identifiers.", href: "/ulid-generator", icon: ListOrdered, isMobileFriendly: true },
            { name: "BIP39 Passphrase", description: "Generate secure mnemonic passphrases.", href: "/bip39-generator", icon: AlignLeft, isMobileFriendly: true },
            { name: "MAC Address Gen", description: "Generate random, valid MAC addresses.", href: "/mac-address-generator", icon: Plus, isMobileFriendly: true },
        ]
    },
    {
        title: "Converters",
        slug: "converters",
        icon: Calculator,
        tools: [
            { name: "Date-Time Converter", description: "Unix timestamps and ISO formats conversion.", href: "/date-time-converter", icon: Calendar, isMobileFriendly: true },
            { name: "Temperature", description: "Convert between C, F, K and other scales.", href: "/temperature-converter", icon: Thermometer, isMobileFriendly: true },
            { name: "Roman Numerals", description: "Convert between Arabic and Roman numerals.", href: "/roman-numeral-converter", icon: History, isMobileFriendly: true },
            { name: "Base Converter", description: "Convert numbers between different bases (2-36).", href: "/integer-base-converter", icon: Binary, isMobileFriendly: true },
        ]
    },
    {
        title: "Network",
        slug: "network",
        icon: Router,
        tools: [
            { name: "Subnet Calculator", description: "Calculate masks, network and IP ranges.", href: "/ipv4-subnet-calculator", icon: Router, isMobileFriendly: true },
            { name: "IP Address Conv", description: "Convert IP to decimal, binary, and hex.", href: "/ipv4-address-converter", icon: Binary, isMobileFriendly: true },
            { name: "IP Range Expander", description: "Expand CIDR notations into address lists.", href: "/ipv4-range-expander", icon: ChevronsUpDown, isMobileFriendly: true },
            { name: "MAC Lookup", description: "Identify manufacturer by MAC address.", href: "/mac-address-lookup", icon: Search, isMobileFriendly: true },
            { name: "IPv6 ULA Gen", description: "Generate Unique Local Addresses for IPv6.", href: "/ipv6-ula-generator", icon: Factory },
        ]
    },
    {
        title: "Math & Calculation",
        slug: "math",
        icon: Calculator,
        tools: [
            { name: "Math Evaluator", description: "Evaluate complex mathematical expressions.", href: "/math-evaluator", icon: Calculator, isMobileFriendly: true },
            { name: "Percentage Calc", description: "Quickly calculate percentages and differences.", href: "/percentage-calculator", icon: Percent, isMobileFriendly: true },
            { name: "ETA Calculator", description: "Estimate arrival based on distance and speed.", href: "/eta-calculator", icon: Clock, isMobileFriendly: true },
        ]
    },
    {
        title: "Text & Reference",
        slug: "text",
        icon: Type,
        tools: [
            { name: "Regex Tester", description: "Test and debug Regular Expressions.", href: "/regex-tester", icon: Search, desktopOnly: true },
            { name: "Text Diff Checker", description: "Compare two text blocks and highlight diffs.", href: "/text-diff", icon: GitCompare, desktopOnly: true },
            { name: "Color Converter", description: "Convert between HEX, RGB, HSL, and CMYK.", href: "/color-converter", icon: Palette, isMobileFriendly: true },
            { name: "HTTP Status Codes", description: "Reference list of HTTP status codes.", href: "/http-status-codes", icon: Globe, isMobileFriendly: true },
            { name: "Text to NATO", description: "Convert text to the NATO Phonetic Alphabet.", href: "/text-to-nato", icon: MessageSquare, isMobileFriendly: true },
        ]
    },
    {
        title: "Science & Education",
        slug: "education",
        icon: GraduationCap,
        tools: [
            { name: "DNA to mRNA", description: "Transcribe DNA sequences into mRNA.", href: "/dna-to-mrna-converter", icon: Dna, isMobileFriendly: true },
            { name: "Japanese Name", description: "Convert names into Katakana and Hiragana.", href: "/japanese-name-converter", icon: Languages, isMobileFriendly: true },
            { name: "Skills Intelligence", description: "Cedefop portal for labor market trends.", href: "https://www.cedefop.europa.eu/en/tools/skills-intelligence", icon: Zap, isExternal: true },
        ]
    },
    {
        title: "Marketing & Support",
        slug: "support",
        icon: Users,
        tools: [
            { name: "WhatsApp Link", description: "Create clickable chat links with messages.", href: "/whatsapp-link-generator", icon: MessageCircle, isMobileFriendly: true },
            { name: "Link Shortener", description: "Shorten long URLs into clean links.", href: "/link-shortener", icon: LinkIcon, isMobileFriendly: true },
            { name: "About Us", description: "Learn more about the team behind Tool Daddy.", href: "/about", icon: Users, isMobileFriendly: true },
            { name: "Buy Me a Coffee", description: "Support our work with a coffee!", href: "/buy-me-a-coffee", icon: Coffee, isMobileFriendly: true },
        ]
    }
];

export const ALL_TOOLS: Tool[] = ALL_TOOLS_CATEGORIES.flatMap(category => category.tools);

// Mapping for names from constants.ts to titles in tools-data.ts if needed for compatibility
export const TOOL_CATEGORIES = ALL_TOOLS_CATEGORIES.map(cat => ({
    name: cat.title,
    tools: cat.tools
}));
