"use client";

import { Bell, Check, Loader2 } from "lucide-react";
import { useState, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useFirebase, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy, doc, Timestamp } from "firebase/firestore";
import { updateDocumentNonBlocking } from "@/firebase/non-blocking-updates";
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

    const notifCollectionPath = useMemo(() => {
        if (!user || user.isAnonymous || !firestore || !settings.dataPersistence) return null;
        return collection(firestore, 'users', user.uid, 'notifications');
    }, [firestore, user, settings.dataPersistence]);

    const notifQuery = useMemoFirebase(() => {
        if (!notifCollectionPath) return null;
        return query(notifCollectionPath, orderBy('createdAt', 'desc'));
    }, [notifCollectionPath]);

    const { data: notifications, isLoading } = useCollection<any>(notifQuery);

    const unreadCount = useMemo(() => {
        if (!notifications) return 0;
        return notifications.filter((n: any) => !n.read).length;
    }, [notifications]);

    const handleMarkAllRead = useCallback(() => {
        if (!notifications || !user || !firestore) return;
        const unread = notifications.filter((n: any) => !n.read);
        unread.forEach((n: any) => {
            const docRef = doc(firestore, 'users', user.uid, 'notifications', n.id);
            updateDocumentNonBlocking(docRef, { read: true });
        });
    }, [notifications, user, firestore]);

    // Don't show for anonymous/loading users OR if notifications are disabled
    if (isUserLoading || !user || user.isAnonymous || !settings.notifications) return null;

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative h-10 w-10 text-white hover:bg-white/10 rounded-full transition-all">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-[#112240]">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-[320px] p-0 bg-[#1a2c4e] border-white/10 shadow-2xl rounded-2xl overflow-hidden">
                <div className="flex items-center justify-between border-b border-white/5 px-4 py-3 bg-white/5">
                    <h4 className="text-sm font-bold uppercase tracking-tighter text-white">Notifications</h4>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-auto px-2 py-1 text-[10px] font-black uppercase text-muted-foreground hover:text-white hover:bg-transparent"
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
                            <Bell className="h-8 w-8 text-white mx-auto mb-2 opacity-20" />
                            <p className="text-[10px] text-white uppercase font-black tracking-widest">No notifications</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-white/5">
                            {notifications.map((notif: any) => (
                                <div
                                    key={notif.id}
                                    className={cn(
                                        "px-4 py-4 space-y-1 transition-colors cursor-default",
                                        !notif.read ? "bg-primary/10 border-l-2 border-primary" : "hover:bg-white/5"
                                    )}
                                >
                                    <h5 className={cn("text-xs font-bold text-white leading-tight", notif.read && "text-white/60")}>
                                        {notif.title}
                                    </h5>
                                    <p className="text-[10px] text-white/40 leading-relaxed font-medium">
                                        {notif.message}
                                    </p>
                                    {notif.createdAt && (
                                        <p className="text-[9px] text-white/20 font-medium pt-0.5">
                                            {timeAgo(notif.createdAt.toDate())}
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
