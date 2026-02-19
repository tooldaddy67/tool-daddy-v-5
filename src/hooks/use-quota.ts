import { useState, useCallback } from 'react';
import { useFirebase } from '@/firebase';
import { doc, getDoc, setDoc, updateDoc, increment } from 'firebase/firestore';

const DAILY_QUOTA = 10; // Example quota

export function useQuota() {
    const { user, db } = useFirebase();
    const [loading, setLoading] = useState(false);

    const checkQuota = useCallback(async (toolId: string) => {
        if (!user || !db) {
            console.warn('[QuotaCheck] Quota check skipped (user or db not ready)');
            return { allowed: true, remaining: DAILY_QUOTA };
        }

        const date = new Date().toISOString().split('T')[0];
        const docId = `${user.uid}_${toolId}_${date}`;
        const usageRef = doc(db, 'tool_usage', docId);

        setLoading(true);
        try {
            const docSnap = await getDoc(usageRef);

            if (!docSnap.exists()) {
                return { allowed: true, remaining: DAILY_QUOTA, current: 0 };
            }

            const data = docSnap.data();
            const count = data?.count || 0;

            return {
                allowed: count < DAILY_QUOTA,
                remaining: Math.max(0, DAILY_QUOTA - count),
                current: count
            };
        } catch (err: any) {
            console.error('[QuotaCheck] Exception:', err);
            return { allowed: true, remaining: 1 }; // Fallback to allow
        } finally {
            setLoading(false);
        }
    }, [user, db]);

    const incrementUsage = useCallback(async (toolId: string) => {
        if (!user || !db) return;

        const date = new Date().toISOString().split('T')[0];
        const docId = `${user.uid}_${toolId}_${date}`;
        const usageRef = doc(db, 'tool_usage', docId);

        try {
            // Use updateDoc if likely exists, but setDoc with merge is safer for "upsert" equivalent
            // However, Firestore doesn't support "increment if exists, else create with 1" in one atomic setDoc call easily without a transaction or logic.
            // Using setDoc with merge and increment works if the document exists, but for a new document we need to initialize.

            // Simpler approach: check existence (we likely just checked quota), but for robustness:
            // We can use setDoc with merge: true. `increment` works with setDoc? Yes.

            await setDoc(usageRef, {
                userId: user.uid,
                toolId: toolId,
                date: date,
                count: increment(1)
            }, { merge: true });

        } catch (err) {
            console.error('[QuotaCheck] Error incrementing usage:', err);
        }
    }, [user, db]);

    return { checkQuota, incrementUsage, loading };
}
