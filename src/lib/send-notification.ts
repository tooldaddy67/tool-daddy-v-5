'use client';

import { collection, addDoc, serverTimestamp, Firestore } from 'firebase/firestore';
import { toast } from '@/hooks/use-toast';

export interface NotificationPayload {
    title: string;
    message: string;
    type?: 'info' | 'success' | 'warning' | 'error';
    link?: string;
}

/**
 * Creates a notification for a given user and displays a toast.
 * - If userId & firestore are provided, saves to DB.
 * - Always shows a Toast for immediate feedback.
 */
export async function sendNotification(
    firestore: Firestore | null,
    userId: string | null | undefined,
    payload: NotificationPayload
) {
    // 1. Show immediate toast feedback
    toast({
        title: payload.title,
        description: payload.message,
        variant: payload.type === 'error' ? 'destructive' : 'default',
    });

    // 2. Save to Firestore if user is logged in (not anonymous logic handled by caller usually, but safe here)
    if (firestore && userId) {
        try {
            const notifCol = collection(firestore, 'users', userId, 'notifications');
            await addDoc(notifCol, {
                ...payload,
                read: false,
                createdAt: serverTimestamp(),
            });
        } catch (error) {
            console.error("Failed to save notification:", error);
        }
    }
}
