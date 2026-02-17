'use client';

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { Bell, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useFirebase } from '@/firebase';
import { cn } from '@/lib/utils';

type Notification = {
    id: string;
    title: string;
    message: string;
    read: boolean;
    createdAt: any;
};

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

import { useSettings } from '@/components/settings-provider';

export function NotificationBell() {
    const { user, isUserLoading } = useFirebase();
    const { settings } = useSettings();
    const [open, setOpen] = useState(false);

    const notifications: Notification[] = [];
    const isLoading = false;
    const unreadCount = 0;

    const handleMarkAllRead = useCallback(() => { }, []);
    const handleMarkRead = useCallback((notifId: string) => { }, []);

    // Don't show for anonymous/loading users OR if notifications are disabled
    if (isUserLoading || !user || user.isAnonymous || !settings.notifications) return null;

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative h-9 w-9">
                    <Bell className="h-4 w-4" />
                    {unreadCount > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-80 p-0">
                <div className="flex items-center justify-between border-b px-4 py-3">
                    <h4 className="text-sm font-semibold">Notifications</h4>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-auto px-2 py-1 text-xs text-muted-foreground hover:text-primary"
                            onClick={handleMarkAllRead}
                        >
                            <Check className="mr-1 h-3 w-3" />
                            Mark all read
                        </Button>
                    )}
                </div>
                <ScrollArea className="h-80">
                    <div className="min-h-full">
                        {isLoading ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                            </div>
                        ) : !notifications || notifications.length === 0 ? (
                            <div className="py-8 text-center text-sm text-muted-foreground">
                                No notifications yet.
                            </div>
                        ) : (
                            <div className="divide-y">
                                {notifications.map((notif) => (
                                    <button
                                        key={notif.id}
                                        className={cn(
                                            'w-full text-left px-4 py-3 transition-colors hover:bg-muted/50',
                                            !notif.read && 'bg-primary/5'
                                        )}
                                        onClick={() => {
                                            if (!notif.read) handleMarkRead(notif.id);
                                        }}
                                    >
                                        <div className="flex items-start gap-2">
                                            {!notif.read && (
                                                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
                                            )}
                                            <div className={cn('flex-1 min-w-0', notif.read && 'pl-4')}>
                                                <p className={cn('text-sm font-medium leading-tight', notif.read && 'text-muted-foreground')}>
                                                    {notif.title}
                                                </p>
                                                <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">
                                                    {notif.message}
                                                </p>
                                                {notif.createdAt && (
                                                    <p className="mt-1 text-[10px] text-muted-foreground/70">
                                                        {timeAgo(notif.createdAt.toDate())}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </PopoverContent>
        </Popover>
    );
}
