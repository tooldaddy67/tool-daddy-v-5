'use client';

import React from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { Sparkles, Minimize, Shuffle, ChevronDown } from 'lucide-react';

const DynamicToolCard = dynamic(() => import('@/components/dynamic-tool-card'), { ssr: true });

export function HomeTools() {
    return (
        <section className="space-y-12 py-12">
            <div className="flex flex-col items-center text-center space-y-4">
                <h2 className="text-4xl font-bold tracking-tight font-headline">Explore Our Tools</h2>
                <p className="text-muted-foreground max-w-2xl text-lg">
                    Discover a wide range of utilities designed to boost your productivity.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <DynamicToolCard
                    name="AI Image Enhancer"
                    description="Upscale and enhance your images using powerful AI models."
                    href="/ai-image-enhancer"
                    icon={Sparkles}
                    isExternal={false}
                    variantIndex={0}
                />
                <DynamicToolCard
                    name="Image Compressor"
                    description="Reduce image file size while maintaining quality."
                    href="/image-compressor"
                    icon={Minimize}
                    variantIndex={1}
                />
                <DynamicToolCard
                    name="Token Generator"
                    description="Generate random strings with customizable character sets."
                    href="/token-generator"
                    icon={Shuffle}
                    variantIndex={2}
                />
            </div>

            <div className="flex justify-center">
                <Link href="/tools" className="group flex flex-col items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                    <span className="text-lg font-medium">Explore More Tools</span>
                    <ChevronDown className="w-6 h-6 animate-bounce group-hover:text-primary" />
                </Link>
            </div>
        </section>
    );
}
