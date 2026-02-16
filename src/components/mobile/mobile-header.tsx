"use client";

import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useState } from "react";
import dynamic from "next/dynamic";

const NotificationsPopover = dynamic(() => import("./notifications-popover").then(mod => mod.NotificationsPopover), {
    ssr: false,
    loading: () => <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
});


const Logo = ({ className }: { className?: string }) => (
    <svg
        viewBox="0 0 420 420"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={cn("w-8 h-8 transition-all duration-300", className)}
        aria-label="Tool Daddy Logo"
        role="img"
    >
        <title>Tool Daddy Logo</title>
        <path d="M128 341.333C128 304.6 154.6 278 181.333 278H234.667C261.4 278 288 304.6 288 341.333V341.333C288 378.067 261.4 404.667 234.667 404.667H181.333C154.6 404.667 128 378.067 128 341.333V341.333Z" fill="#F87171" />
        <path d="M288 170.667C288 133.933 314.6 107.333 341.333 107.333H384V404.667H341.333C314.6 404.667 288 378.067 288 341.333V170.667Z" fill="#F87171" />
        <path d="M150 256C183.5 204 250 204 282 256C314 308 380.5 308 414 256" stroke="currentColor" strokeWidth="20" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);



interface MobileHeaderProps {
    searchQuery?: string;
    setSearchQuery?: (query: string) => void;
}


export function MobileHeader({ searchQuery, setSearchQuery }: MobileHeaderProps) {
    const router = useRouter();
    const [localQuery, setLocalQuery] = useState("");

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        if (setSearchQuery) {
            setSearchQuery(val);
        } else {
            setLocalQuery(val);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !setSearchQuery) {
            router.push(`/?search=${encodeURIComponent(localQuery)}`);
        }
    }

    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-2xl border-b border-border shadow-sm">
            <div className="flex items-center gap-3 px-4 h-14 w-full">
                {/* Logo and Title */}
                <div className="flex items-center gap-2 shrink-0 group cursor-pointer" onClick={() => router.push('/')}>
                    <Logo className="w-6 h-6 text-foreground" />
                    <span className="font-bold text-lg tracking-tight text-foreground">
                        Tool Daddy
                    </span>
                </div>

                {/* Compact Search Bar & Notifications */}
                <div className="flex-1 flex items-center gap-2 min-w-0">
                    <div className="flex-1 min-w-0 relative">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Search..."
                            value={setSearchQuery ? searchQuery : localQuery}
                            onChange={handleSearch}
                            onKeyDown={handleKeyDown}
                            className="h-9 w-full bg-muted/50 border-transparent focus-visible:bg-background focus-visible:border-primary pl-9 rounded-full text-sm placeholder:text-muted-foreground"
                        />
                    </div>
                    <NotificationsPopover />
                </div>
            </div>
        </header>
    );
}
