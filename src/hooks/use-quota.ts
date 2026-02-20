import { useState, useCallback } from 'react';
import { useUser } from '@/firebase'; // Use useUser instead of useFirebase for cleaner auth check if needed, or just check localStorage
// We don't need firebase/firestore imports anymore

const DAILY_QUOTA = 10;

export function useQuota() {
    const { user } = useUser();
    const [loading, setLoading] = useState(false);

    const getQuotaKey = (toolId: string) => {
        const date = new Date().toISOString().split('T')[0];
        // Quota is per device now (localStorage), or per user if we include uid in key?
        // If we want per-user quota on the same device, include uid.
        // User requested NO DB storage.
        const uid = user?.uid || 'anonymous';
        return `tool_quota_${date}_${toolId}_${uid}`;
    };

    const checkQuota = useCallback(async (toolId: string) => {
        // Local check is instant
        const key = getQuotaKey(toolId);
        const stored = localStorage.getItem(key);
        const count = stored ? parseInt(stored, 10) : 0;

        return {
            allowed: count < DAILY_QUOTA,
            remaining: Math.max(0, DAILY_QUOTA - count),
            current: count
        };
    }, [user]);

    const incrementUsage = useCallback(async (toolId: string) => {
        const key = getQuotaKey(toolId);
        const stored = localStorage.getItem(key);
        const count = stored ? parseInt(stored, 10) : 0;

        localStorage.setItem(key, (count + 1).toString());
    }, [user]);

    return { checkQuota, incrementUsage, loading };
}
