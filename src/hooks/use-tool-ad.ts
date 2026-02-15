'use client';

import { useState, useMemo } from 'react';
import { useFirebase } from '@/firebase';
import { useDoc } from '@/firebase/firestore/use-doc';
import { doc } from 'firebase/firestore';

export type ToolType = 'standard' | 'heavy' | 'ai' | 'external' | 'heavy_ai';

const BOOTSTRAP_ADMIN_EMAILS = [
    'admin@tooldaddy.com',
    ...(process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(',').map(e => e.trim()) || [])
];

export function useToolAd(toolType: ToolType = 'standard') {
    const [isAdOpen, setIsAdOpen] = useState(false);
    const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);
    const { user, firestore } = useFirebase();

    // 1. Check Firestore for Admin status (Reactive)
    const userDocRef = useMemo(() => {
        if (!user?.uid || !firestore) return null;
        return doc(firestore, 'users', user.uid);
    }, [user?.uid, firestore]);

    const { data: userData } = useDoc(userDocRef);

    // 2. Comprehensive Admin Check
    const isAdmin = typeof window !== 'undefined' && (
        sessionStorage.getItem('head-admin-auth') === 'true' ||
        userData?.isAdmin === true ||
        (user?.email && BOOTSTRAP_ADMIN_EMAILS.includes(user.email))
    );

    // Standard is 5s, others are 10s
    let duration = 5;
    if (toolType !== 'standard') duration = 10;

    const showAd = (action: () => void) => {
        // Skip ad for admins
        if (isAdmin) {
            action();
            return;
        }

        setPendingAction(() => action);
        setIsAdOpen(true);
    };

    const handleAdFinish = () => {
        setIsAdOpen(false);
        if (pendingAction) {
            pendingAction();
            setPendingAction(null);
        }
    };

    return {
        isAdOpen,
        setIsAdOpen,
        showAd,
        handleAdFinish,
        duration,
        title: toolType === 'standard' ? "Processing your request..." : "Running advanced calculations..."
    };
}
