"use client";

import { Notebook, ListTodo, Bot, Music, QrCode, Pencil, ArrowRight } from "lucide-react";
import DynamicToolCard from "@/components/dynamic-tool-card";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const FEATURED_TOOLS = [
    {
        name: 'Simple Notepad',
        description: 'A simple notepad for quick notes with rich text support.',
        href: '/simple-notepad',
        icon: Notebook,
    },
    {
        name: 'To-Do List',
        description: 'A minimalist to-do list to keep you on track.',
        href: '/todo-list',
        icon: ListTodo,
    },
    {
        name: 'AI Text Humanizer',
        description: 'Refine AI-generated text to sound more natural and human.',
        href: '/ai-text-humanizer',
        icon: Bot,
    },
    {
        name: 'Video to Audio',
        description: 'Extract audio from your own video files and save as MP3.',
        href: '/video-to-audio-converter',
        icon: Music,
    },
    {
        name: 'QR Code Generator',
        description: 'Create and customize QR codes for URLs, text, and more.',
        href: '/qr-code-generator',
        icon: QrCode,
    },
    {
        name: 'Drawing Canvas',
        description: 'A minimalist canvas for quick sketches and notes.',
        href: '/drawing-canvas',
        icon: Pencil,
    },
];

export function FeaturedTools() {
    return (
        <section id="tools" className="hidden md:block container px-4 md:px-6 py-12 md:py-24 space-y-12">
            <div className="flex flex-col items-center justify-center text-center space-y-4 mb-8">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl font-headline">Popular Tools</h2>
                <div className="h-1 w-20 bg-primary/40 rounded-full" />
                <p className="text-muted-foreground max-w-[600px]">
                    Our most loved utilities, ready to help you create and convert.
                </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {FEATURED_TOOLS.map((tool, index) => (
                    <DynamicToolCard
                        key={tool.name}
                        href={tool.href}
                        name={tool.name}
                        description={tool.description}
                        icon={tool.icon}
                        variantIndex={index}
                        isExternal={false}
                    />
                ))}
            </div>

            <div className="flex justify-center pt-8">
                <Link href="/tools">
                    <Button size="lg" variant="outline" className="rounded-full px-8 gap-2">
                        View All Tools <ArrowRight className="w-4 h-4" />
                    </Button>
                </Link>
            </div>
        </section>
    );
}
