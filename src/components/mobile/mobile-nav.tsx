"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Grid, History, Settings, User, LogIn } from "lucide-react";
import { cn } from "@/lib/utils";
import { m } from "framer-motion";
import { useUser } from "@/firebase";
import { UserAuthButton } from "@/components/user-auth-button";

export function MobileNav() {
    const pathname = usePathname();
    const { user } = useUser();

    const isActive = (href: string) => {
        if (href === '/') return pathname === '/';
        return pathname.startsWith(href);
    };

    const navItems = [
        { href: '/', icon: Home, label: 'Home' },
        { href: '/tools', icon: Grid, label: 'Tools' },
        { href: '/history', icon: History, label: 'History' },
        { href: '/settings', icon: Settings, label: 'Settings' },
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 z-[100] xl:hidden px-4 pb-4 bg-gradient-to-t from-background via-background/80 to-transparent pointer-events-none">
            <div className="bg-secondary/95 backdrop-blur-xl border border-white/10 rounded-[2rem] shadow-2xl h-16 flex items-center justify-around px-2 pointer-events-auto max-w-md mx-auto">
                {navItems.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                            "flex flex-col items-center gap-1 p-2 transition-all duration-300 relative group",
                            isActive(item.href) ? "text-primary scale-110" : "text-muted-foreground"
                        )}
                    >
                        <div className={cn(
                            "p-1.5 rounded-2xl transition-all duration-300",
                            isActive(item.href) && "bg-primary/10"
                        )}>
                            <item.icon className={cn("w-5 h-5", isActive(item.href) && "fill-current/20")} />
                        </div>
                        <span className={cn(
                            "text-[9px] font-black uppercase tracking-widest transition-all",
                            isActive(item.href) ? "opacity-100" : "opacity-40"
                        )}>
                            {item.label}
                        </span>
                        {isActive(item.href) && (
                            <m.div
                                layoutId="activeNav"
                                className="absolute -top-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary shadow-[0_0_10px_rgba(var(--primary),0.5)]"
                            />
                        )}
                    </Link>
                ))}

                {/* Account / Auth Item */}
                <div className="flex flex-col items-center gap-1 p-2">
                    {user && !user.isAnonymous ? (
                        <Link
                            href="/dashboard"
                            className={cn(
                                "flex flex-col items-center gap-1 transition-all duration-300",
                                isActive('/dashboard') ? "text-primary scale-110" : "text-muted-foreground"
                            )}
                        >
                            <div className={cn(
                                "p-1.5 rounded-2xl transition-all duration-300",
                                isActive('/dashboard') && "bg-primary/10"
                            )}>
                                <User className="w-5 h-5" />
                            </div>
                            <span className={cn(
                                "text-[9px] font-black uppercase tracking-widest transition-all",
                                isActive('/dashboard') ? "opacity-100" : "opacity-40"
                            )}>
                                Profile
                            </span>
                        </Link>
                    ) : (
                        <UserAuthButton
                            customTrigger={
                                <div className="flex flex-col items-center gap-1 text-muted-foreground hover:text-primary transition-all">
                                    <div className="p-1.5 rounded-2xl">
                                        <LogIn className="w-5 h-5" />
                                    </div>
                                    <span className="text-[9px] font-black uppercase tracking-widest opacity-40">Login</span>
                                </div>
                            }
                        />
                    )}
                </div>
            </div>
        </div>
    );
}
