'use client';

import { toast } from '@/hooks/use-toast';

export interface NotificationPayload {
    title: string;
    message: string;
    type?: 'info' | 'success' | 'warning' | 'error';
    link?: string;
}

import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

/**
 * Creates a notification for a given user and displays a toast.
 * - If userId & firestore are provided, saves to DB.
 * - Always shows a Toast for immediate feedback.
 */
export async function sendNotification(
    firestore: any | null,
    userId: string | null | undefined,
    payload: NotificationPayload
) {
    // 1. Show immediate toast feedback
    toast({
        title: payload.title,
        description: payload.message,
        variant: payload.type === 'error' ? 'destructive' : 'default',
    });

    // 2. Save to Firestore if user is logged in
    if (firestore && userId) {
        try {
            const notificationsRef = collection(firestore, 'profiles', userId, 'notifications');
            await addDoc(notificationsRef, {
                title: payload.title,
                message: payload.message,
                type: payload.type || 'info',
                link: payload.link || null,
                read: false,
                createdAt: serverTimestamp(),
            });
        } catch (error) {
            console.error('Error saving notification:', error);
        }
    }
}
