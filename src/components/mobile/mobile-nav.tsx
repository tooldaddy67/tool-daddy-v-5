"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Grid, Heart, User } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
    { label: "Home", href: "/", icon: Home },
    { label: "Tools", href: "/tools", icon: Grid },
    { label: "Favorites", href: "/favorites", icon: Heart },
    { label: "Profile", href: "/profile", icon: User },
];

export function MobileNav() {
    const pathname = usePathname();

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#0B0B0F]/95 backdrop-blur-xl border-t border-white/5 md:hidden pb-safe">
            <div className="flex items-center justify-around h-20 px-4">
                {NAV_ITEMS.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="flex flex-col items-center justify-center w-full gap-1 group"
                        >
                            <div className={cn(
                                "flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300",
                                isActive
                                    ? "bg-primary text-primary-foreground shadow-[0_0_20px_-5px_hsl(var(--primary))]"
                                    : "text-muted-foreground group-hover:text-foreground group-hover:bg-white/5"
                            )}>
                                <item.icon className={cn("w-5 h-5", isActive && "fill-current")} />
                            </div>
                            <span className={cn(
                                "text-[10px] font-medium transition-colors duration-300",
                                isActive ? "text-primary" : "text-muted-foreground"
                            )}>
                                {item.label}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
