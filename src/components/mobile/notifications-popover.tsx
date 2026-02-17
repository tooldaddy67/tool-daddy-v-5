"use client";

import { Bell, Check, Loader2 } from "lucide-react";
import { useState, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useFirebase } from "@/firebase";
import { cn } from "@/lib/utils";
import { useSettings } from "@/components/settings-provider";

function timeAgo(date: Date): string {
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
}

export function NotificationsPopover() {
    const { firestore, user, isUserLoading } = useFirebase();
    const { settings } = useSettings();
    const [open, setOpen] = useState(false);

    const notifications: any[] = [];
    const isLoading = false;
    const unreadCount = 0;

    const handleMarkAllRead = useCallback(() => { }, []);

    // Don't show for anonymous/loading users OR if notifications are disabled
    if (isUserLoading || !user || user.isAnonymous || !settings.notifications) return null;

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative h-10 w-10 text-muted-foreground hover:bg-muted/50 rounded-full transition-all">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground ring-2 ring-background">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-[320px] p-0 bg-popover border-border shadow-2xl rounded-2xl overflow-hidden">
                <div className="flex items-center justify-between border-b border-border/50 px-4 py-3 bg-muted/50">
                    <h4 className="text-sm font-bold uppercase tracking-tighter text-foreground">Notifications</h4>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-auto px-2 py-1 text-[10px] font-black uppercase text-muted-foreground hover:text-primary hover:bg-transparent"
                            onClick={handleMarkAllRead}
                        >
                            <Check className="mr-1 h-3 w-3" />
                            Mark all read
                        </Button>
                    )}
                </div>
                <ScrollArea className="h-[380px]">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        </div>
                    ) : !notifications || notifications.length === 0 ? (
                        <div className="py-20 text-center space-y-2 opacity-50">
                            <Bell className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-20" />
                            <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">No notifications</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-border/50">
                            {notifications.map((notif: any) => (
                                <div
                                    key={notif.id}
                                    className={cn(
                                        "px-4 py-4 space-y-1 transition-colors cursor-default",
                                        !notif.read ? "bg-primary/5 border-l-2 border-primary" : "hover:bg-muted/50"
                                    )}
                                >
                                    <h5 className={cn("text-xs font-bold text-foreground leading-tight", notif.read && "text-muted-foreground")}>
                                        {notif.title}
                                    </h5>
                                    <p className="text-[10px] text-muted-foreground leading-relaxed font-medium">
                                        {notif.message}
                                    </p>
                                    {notif.createdAt && (
                                        <p className="text-[9px] text-muted-foreground/60 font-medium pt-0.5">
                                            {/* @ts-ignore - formatting fallback is safe enough */}
                                            {notif.createdAt?.toDate ? timeAgo(notif.createdAt.toDate()) : 'recently'}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </PopoverContent>
        </Popover>
    );
}
