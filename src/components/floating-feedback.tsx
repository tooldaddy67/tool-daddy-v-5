'use client';

import Link from 'next/link';
import { MessageSquarePlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

export function FloatingFeedback() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 300) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        // Initial check
        if (window.scrollY > 300) setIsVisible(true);

        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className={cn(
            "fixed bottom-24 right-6 z-[45] transition-all duration-500 md:bottom-10",
            isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0 pointer-events-none"
        )}>
            <Link href="/feedback">
                <Button
                    size="icon"
                    className="h-12 w-12 rounded-full shadow-2xl shadow-primary/20 bg-primary hover:bg-primary/90 text-primary-foreground group relative overflow-hidden transition-all duration-300 hover:scale-110 active:scale-95"
                >
                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <MessageSquarePlus className="h-6 w-6" />
                    <span className="sr-only">Report a bug or suggest a feature</span>

                    {/* Tooltip for desktop */}
                    <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-lg bg-popover text-popover-foreground border shadow-xl opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all pointer-events-none hidden md:block whitespace-nowrap text-sm font-bold">
                        Need help or found a bug?
                    </div>
                </Button>
            </Link>
        </div>
    );
}
