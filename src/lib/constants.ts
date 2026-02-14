import {
  Sparkles,
  Bot,
  QrCode,
  Minimize,
  Replace,
  Music,
  Video,
  Download,
  Palette,
  KeyRound,
  type LucideIcon,
  Notebook,
  ListMusic,
  Timer,
  Share2,
  Pencil,
  ListTodo,
  Users,
  Coffee,
  Signal,
  FileSearch,
  Paintbrush,
  Router,
  Binary,
  ChevronsUpDown,
  Search,
  Plus,
  Factory,
  Shuffle,
  Hash,
  Lock,
  ShieldCheck,
  Fingerprint,
  ListOrdered,
  AlignLeft,
  Equal,
  FileKey,
  Gauge,
  FileBadge,
  Calendar,
  Calculator,
  Percent,
  Timer as ClockIcon,
  Thermometer,
  Zap,
  Dna,
  Languages,
  Link as LinkIcon,
  MessageCircle,
  Clock,
  GraduationCap,
  Compass,
  Network,
  Database,
  FileText,
  Globe,
  GitCompare,
} from 'lucide-react';

export type Tool = {
  name: string;
  description: string;
  href: string;
  icon: LucideIcon;
  isExternal?: boolean;
  desktopOnly?: boolean;
  isMobileFriendly?: boolean;
};

export type ToolCategory = {
  name: string;
  tools: Tool[];
};

export const TOOL_CATEGORIES: ToolCategory[] = [
  {
    name: 'Productivity',
    tools: [
      {
        name: 'Simple Notepad',
        description: 'A simple notepad for quick notes with rich text support.',
        href: '/simple-notepad',
        icon: Notebook,
        desktopOnly: true,
      },
      {
        name: 'Timer & Stopwatch',
        description: 'A simple timer and stopwatch for tracking time.',
        href: '/timer-stopwatch',
        icon: Timer,
      },
      {
        name: 'To-Do List',
        description: 'A minimalist to-do list to keep you on track.',
        href: '/todo-list',
        icon: ListTodo,
      }
    ]
  },
  {
    name: 'AI Tools',
    tools: [
      {
        name: 'AI Text Humanizer',
        description: 'Refine AI-generated text to sound more natural and human.',
        href: '/ai-text-humanizer',
        icon: Bot,
      },
      {
        name: 'AI Image Enhancer',
        description: 'Upscale and enhance your images before being redirected.',
        href: '/ai-image-enhancer',
        icon: Sparkles,
        isExternal: false,
        desktopOnly: true,
      },
      {
        name: 'AI Playlist Maker',
        description: 'Generate a music playlist based on a vibe or prompt.',
        href: '/ai-playlist-maker',
        icon: ListMusic,
      },
    ],
  },
  {
    name: 'Media Utilities',
    tools: [
      {
        name: 'Image Compressor',
        description: 'Reduce image file size while maintaining quality.',
        href: '/image-compressor',
        icon: Minimize,
      },
      {
        name: 'Image Converter',
        description: 'Convert images between formats like PNG, JPEG, and WEBP.',
        href: '/image-converter',
        icon: Replace,
      },
      {
        name: 'Color Palette Extractor',
        description: 'Extract a color palette from an uploaded image.',
        href: '/color-palette-extractor',
        icon: Palette,
      },
      {
        name: 'Metadata Extractor',
        description: 'Extract and view metadata like EXIF data from your files.',
        href: '/metadata-extractor',
        icon: FileSearch,
      },
      {
        name: 'Video to Audio Converter',
        description: 'Extract audio from your own video files and save as MP3.',
        href: '/video-to-audio-converter',
        icon: Music,
      },
      {
        name: 'Video Compressor',
        description: 'Reduce video file size via a high-quality external service.',
        href: '/video-compressor',
        icon: Video,
        isExternal: false,
      },
      {
        name: 'YouTube Video Downloader',
        description: 'Download YouTube videos via an external service.',
        href: '/youtube-downloader',
        icon: Download,
        isExternal: false,
      },
      {
        name: 'YouTube to Audio',
        description: 'Convert YouTube videos to audio via an external service.',
        href: '/youtube-to-audio',
        icon: Music,
        isExternal: false,
      },
    ],
  },
  {
    name: 'Creative',
    tools: [
      {
        name: 'Drawing Canvas',
        description: 'A minimalist canvas for quick sketches and notes.',
        href: '/drawing-canvas',
        icon: Pencil,
        desktopOnly: true,
      },
      {
        name: 'Color Palette Generator',
        description: 'Discover, create, and save beautiful color palettes for your projects.',
        href: '/color-palette-generator',
        icon: Paintbrush,
      },
    ]
  },
  {
    name: 'Data Tools',
    tools: [
      {
        name: 'JSON Formatter',
        description: 'Format, validate, and beautify your JSON data.',
        href: '/json-formatter',
        icon: FileSearch,
        isMobileFriendly: true,
      },
      {
        name: 'JSON Tree Viewer',
        description: 'Visualize your JSON data in an interactive tree format.',
        href: '/json-tree-viewer',
        icon: Network,
        desktopOnly: true,
      },
      {
        name: 'YAML ↔ JSON',
        description: 'Convert between YAML and JSON formats.',
        href: '/yaml-json-converter',
        icon: Replace,
        desktopOnly: true,
      },
      {
        name: 'SQL Formatter',
        description: 'Format and beautify your SQL queries.',
        href: '/sql-formatter',
        icon: Database,
        desktopOnly: true,
      },
    ]
  },
  {
    name: 'Encoding Tools',
    tools: [
      {
        name: 'Base64 Encoder',
        description: 'Encode and decode text to Base64.',
        href: '/base64-encoder',
        icon: Lock,
        isMobileFriendly: true,
      },
      {
        name: 'URL Encoder',
        description: 'Encode and decode URLs safely.',
        href: '/url-encoder',
        icon: LinkIcon,
        isMobileFriendly: true,
      },
    ]
  },
  {
    name: 'Security Tools',
    tools: [
      {
        name: 'JWT Decoder',
        description: 'Decode and inspect JSON Web Tokens.',
        href: '/jwt-decoder',
        icon: ShieldCheck,
        isMobileFriendly: true,
      },
      {
        name: 'Hash Generator',
        description: 'Generate cryptographic hashes (SHA-256, SHA-512, etc.) using Web Crypto.',
        href: '/hash-text',
        icon: Hash,
        isMobileFriendly: true,
      },
      {
        name: 'Password Generator',
        description: 'Create strong, secure, and random passwords.',
        href: '/password-generator',
        icon: KeyRound,
        isMobileFriendly: true,
      },
    ]
  },
  {
    name: 'DevOps Tools',
    tools: [
      {
        name: 'Cron Expression Parser',
        description: 'Parse cron expressions into human-readable descriptions.',
        href: '/cron-parser',
        icon: Clock,
        isMobileFriendly: true,
      },
      {
        name: 'PostgreSQL Config',
        description: 'Generate optimized PostgreSQL configuration.',
        href: '/pg-config-generator',
        icon: Database,
        desktopOnly: true,
      },
    ]
  },
  {
    name: 'Generator Tools',
    tools: [
      {
        name: 'UUIDs Generator',
        description: 'Generate Universally Unique Identifiers (UUID) version 4.',
        href: '/uuids-generator',
        icon: Fingerprint,
        isMobileFriendly: true,
      },
      {
        name: 'QR Code Generator',
        description: 'Create and customize QR codes for URLs, text, and more.',
        href: '/qr-code-generator',
        icon: QrCode,
        isMobileFriendly: true,
      },
      {
        name: 'Lorem Ipsum Generator',
        description: 'Generate placeholder text for your designs.',
        href: '/lorem-ipsum',
        icon: FileText,
        isMobileFriendly: true,
      },
      {
        name: 'Token Generator',
        description: 'Generate random strings with customizable character sets.',
        href: '/token-generator',
        icon: Shuffle,
        isMobileFriendly: true,
      },
      {
        name: 'ULID Generator',
        description: 'Generate Universally Unique Lexicographically Sortable Identifiers.',
        href: '/ulid-generator',
        icon: ListOrdered,
        isMobileFriendly: true,
      },
      {
        name: 'BIP39 Passphrase',
        description: 'Generate secure BIP39 mnemonic passphrases.',
        href: '/bip39-generator',
        icon: AlignLeft,
        isMobileFriendly: true,
      },
    ]
  },
  {
    name: 'Text & Reference',
    tools: [
      {
        name: 'Regex Tester',
        description: 'Test and debug Regular Expressions.',
        href: '/regex-tester',
        icon: Search,
        desktopOnly: true,
      },
      {
        name: 'Text Diff Checker',
        description: 'Compare two text blocks and highlight differences.',
        href: '/text-diff',
        icon: GitCompare,
        desktopOnly: true,
      },
      {
        name: 'Color Converter',
        description: 'Convert between HEX, RGB, HSL, and CMYK.',
        href: '/color-converter',
        icon: Palette,
        isMobileFriendly: true,
      },
      {
        name: 'HTTP Status Codes',
        description: 'Reference list of HTTP status codes and meanings.',
        href: '/http-status-codes',
        icon: Globe,
        isMobileFriendly: true,
      },
    ]
  },
  {
    name: 'Network',
    tools: [
      {
        name: 'IPv4 Subnet Calculator',
        description: 'Calculate subnet masks, network addresses, and usable IP ranges.',
        href: '/ipv4-subnet-calculator',
        icon: Router,
      },
      {
        name: 'IPv4 Address Converter',
        description: 'Convert IPv4 addresses between decimal, binary, and hexadecimal.',
        href: '/ipv4-address-converter',
        icon: Binary,
      },
      {
        name: 'IPv4 Range Expander',
        description: 'Expand CIDR notations and IP ranges into full list of addresses.',
        href: '/ipv4-range-expander',
        icon: ChevronsUpDown,
      },
      {
        name: 'MAC Address Lookup',
        description: 'Identify the manufacturer and vendor of a network interface by its MAC address.',
        href: '/mac-address-lookup',
        icon: Search,
      },
      {
        name: 'MAC Address Generator',
        description: 'Generate random, valid MAC addresses for testing and privacy.',
        href: '/mac-address-generator',
        icon: Plus,
      },
      {
        name: 'IPv6 ULA Generator',
        description: 'Generate Unique Local Addresses (ULA) for private IPv6 networks.',
        href: '/ipv6-ula-generator',
        icon: Factory,
      },
    ]
  },
  {
    name: 'IT & Development',
    tools: [
      {
        name: 'Bcrypt Generator',
        description: 'Hash and verify passwords using the secure Bcrypt algorithm.',
        href: '/bcrypt-generator',
        icon: ShieldCheck,
      },
      {
        name: 'Encrypt / Decrypt Text',
        description: 'Securely encrypt and decrypt text using AES encryption.',
        href: '/encrypt-decrypt-text',
        icon: Lock,
      },
      {
        name: 'HMAC Generator',
        description: 'Compute Hash-based Message Authentication Codes with a secret key.',
        href: '/hmac-generator',
        icon: Equal,
      },
      {
        name: 'RSA Key Pair Generator',
        description: 'Generate public and private RSA key pairs in PEM format.',
        href: '/rsa-key-generator',
        icon: FileKey,
        desktopOnly: true,
      },
      {
        name: 'Password Strength Analyser',
        description: 'Check the security and entropy of your passwords.',
        href: '/password-strength-analyser',
        icon: Gauge,
      },
      {
        name: 'PDF Signature Checker',
        description: 'Verify the digital signatures and integrity of PDF documents.',
        href: '/pdf-signature-checker',
        icon: FileBadge,
        desktopOnly: true,
      },
      {
        name: 'Date-Time Converter',
        description: 'Convert between Unix timestamps, ISO formats, and human-readable dates.',
        href: '/date-time-converter',
        icon: Calendar,
      },
    ]
  },
  {
    name: 'Math & Calculation',
    tools: [
      {
        name: 'Math Evaluator',
        description: 'Evaluate complex mathematical expressions and functions.',
        href: '/math-evaluator',
        icon: Calculator,
      },
      {
        name: 'Percentage Calculator',
        description: 'Calculate percentages, increases, decreases, and differences.',
        href: '/percentage-calculator',
        icon: Percent,
      },
      {
        name: 'ETA Calculator',
        description: 'Estimate time of arrival based on distance and speed.',
        href: '/eta-calculator',
        icon: ClockIcon,
      },
    ]
  },
  {
    name: 'Measurement',
    tools: [
      {
        name: 'Temperature Converter',
        description: 'Convert between Celsius, Fahrenheit, Kelvin, and other scales.',
        href: '/temperature-converter',
        icon: Thermometer,
      },
      {
        name: 'Benchmark Builder',
        description: 'Create and run performance benchmarks for your code.',
        href: '/benchmark-builder',
        icon: Zap,
        desktopOnly: true,
      },
    ]
  },
  {
    name: 'Marketing & Social',
    tools: [
      {
        name: 'WhatsApp Link Generator',
        description: 'Create clickable WhatsApp chat links with pre-filled messages.',
        href: '/whatsapp-link-generator',
        icon: MessageCircle,
      },
      {
        name: 'Link Shortener',
        description: 'Shorten long URLs into clean, shareable links.',
        href: '/link-shortener',
        icon: LinkIcon,
      },
    ]
  },
  {
    name: 'Science & Education',
    tools: [
      {
        name: 'DNA to mRNA Converter',
        description: 'Transcribe DNA sequences into mRNA and identify codons.',
        href: '/dna-to-mrna-converter',
        icon: Dna,
      },
      {
        name: 'Japanese Name Converter',
        description: 'Convert names into Hiragana, Katakana, and Romaji.',
        href: '/japanese-name-converter',
        icon: Languages,
      },
      {
        name: 'European Skills & Jobs Survey',
        description: ' Cedefop database on skills and jobs across Europe.',
        href: 'https://www.cedefop.europa.eu/en/tools/european-skills-and-jobs-survey',
        icon: GraduationCap,
        isExternal: true,
      },
      {
        name: 'European Skills Index',
        description: 'Compare skill system performance across EU countries.',
        href: 'https://www.cedefop.europa.eu/en/tools/european-skills-index',
        icon: ListOrdered,
        isExternal: true,
      },
      {
        name: 'Mobility Scoreboard',
        description: 'Database for monitoring VET mobility across Europe.',
        href: 'https://www.cedefop.europa.eu/en/tools/mobility-scoreboard',
        icon: Compass,
        isExternal: true,
      },
      {
        name: 'Skills Intelligence',
        description: ' Cedefop portal for labor market trends and skill needs.',
        href: 'https://www.cedefop.europa.eu/en/tools/skills-intelligence',
        icon: Zap,
        isExternal: true,
      },
    ]
  },
  {
    name: 'Support',
    tools: [
      {
        name: 'About Us',
        description: 'Learn more about the team behind Tool Daddy.',
        href: '/about',
        icon: Users,
      },
      {
        name: 'Buy Me a Coffee',
        description: 'Enjoying the tools? Support our work with a coffee!',
        href: '/buy-me-a-coffee',
        icon: Coffee,
      },
    ]
  }
];

export const ALL_TOOLS: Tool[] = TOOL_CATEGORIES.flatMap(category => category.tools);
