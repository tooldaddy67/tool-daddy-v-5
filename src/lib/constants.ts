
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
  BookMarked,
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
} from 'lucide-react';

export type Tool = {
  name: string;
  description: string;
  href: string;
  icon: LucideIcon;
  isExternal?: boolean;
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
    name: 'General Tools',
    tools: [
      {
        name: 'QR Code Generator',
        description: 'Create and customize QR codes for URLs, text, and more.',
        href: '/qr-code-generator',
        icon: QrCode,
      },
      {
        name: 'Password Generator',
        description: 'Create strong, secure, and random passwords.',
        href: '/password-generator',
        icon: KeyRound,
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
