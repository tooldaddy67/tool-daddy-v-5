"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Grid, History, Settings, LogIn } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSettings } from "@/components/settings-provider";
import { useUser } from "@/firebase";
import { UserAuthButton } from "@/components/user-auth-button";

export function MobileNav() {
    const pathname = usePathname();
    const { setSettingsOpen } = useSettings();
    const { user } = useUser();

    const isActive = (href: string) => {
        if (href === '/') return pathname === '/';
        return pathname.startsWith(href);
    };

    return (
        <div className="fixed bottom-6 left-4 right-4 z-50 md:hidden">
            <div className="bg-background/40 backdrop-blur-2xl border border-white/10 rounded-full shadow-2xl h-16 px-6 flex items-center justify-between">
                <Link
                    href="/"
                    className={cn(
                        "relative p-3 rounded-full transition-all duration-300 hover:bg-muted font-medium",
                        isActive('/') ? "text-primary" : "text-muted-foreground"
                    )}
                >
                    <Home className={cn("w-6 h-6", isActive('/') && "fill-current/20")} />
                    {isActive('/') && (
                        <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary shadow-sm" />
                    )}
                </Link>

                <div className="w-[1px] h-6 bg-border/20" />

                <Link
                    href="/tools"
                    className={cn(
                        "relative p-3 rounded-full transition-all duration-300 hover:bg-muted font-medium",
                        isActive('/tools') ? "text-primary" : "text-muted-foreground"
                    )}
                >
                    <Grid className={cn("w-6 h-6", isActive('/tools') && "fill-current/20")} />
                    {isActive('/tools') && (
                        <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary shadow-sm" />
                    )}
                </Link>

                <div className="w-[1px] h-6 bg-border/20" />

                <Link
                    href="/history"
                    className={cn(
                        "relative p-3 rounded-full transition-all duration-300 hover:bg-muted font-medium",
                        isActive('/history') ? "text-primary" : "text-muted-foreground"
                    )}
                >
                    <History className={cn("w-6 h-6", isActive('/history') && "fill-current/20")} />
                    {isActive('/history') && (
                        <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary shadow-sm" />
                    )}
                </Link>

                <div className="w-[1px] h-6 bg-border/20" />

                {user && !user.isAnonymous ? (
                    <Link
                        href="/settings"
                        className={cn(
                            "relative p-3 rounded-full transition-all duration-300 hover:bg-muted font-medium",
                            isActive('/settings') ? "text-primary" : "text-muted-foreground"
                        )}
                    >
                        <Settings className={cn("w-6 h-6", isActive('/settings') && "fill-current/20")} />
                        {isActive('/settings') && (
                            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary shadow-sm" />
                        )}
                    </Link>
                ) : (
                    <UserAuthButton
                        customTrigger={
                            <div className="relative p-3 rounded-full transition-all duration-300 hover:bg-muted font-medium text-muted-foreground hover:text-primary">
                                <LogIn className="w-6 h-6" />
                            </div>
                        }
                    />
                )}
            </div>
        </div>
    );
}
