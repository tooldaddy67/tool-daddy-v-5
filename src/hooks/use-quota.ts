import { useState, useCallback, useMemo } from 'react';
import { useFirebase } from '@/firebase';
import { createClient } from '@/lib/supabase';

const DAILY_QUOTA = 10; // Example quota

export function useQuota() {
    const { user } = useFirebase();
    const [loading, setLoading] = useState(false);

    const supabase = useMemo(() => {
        try {
            return createClient();
        } catch (e) {
            console.error('[QuotaCheck] Failed to initialize Supabase client:', e);
            return null;
        }
    }, []);

    const checkQuota = useCallback(async (toolId: string) => {
        if (!user || !supabase) {
            console.warn('[QuotaCheck] Quota check skipped (user or supabase not ready)');
            return { allowed: true, remaining: DAILY_QUOTA };
        }

        // Debug: Log config state (safe)
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
        console.log('[QuotaCheck] Checking quota for:', toolId, 'URL:', url);

        setLoading(true);
        try {
            // Test if we can even fetch anything from the URL
            try {
                const response = await fetch(`${url}/rest/v1/`, {
                    method: 'GET',
                    headers: { 'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string }
                });
                console.log('[QuotaCheck] Health Check Status:', response.status);
            } catch (fetchErr: any) {
                console.error('[QuotaCheck] Health Check Failed (Network Error):', fetchErr.message);
            }

            const date = new Date().toISOString().split('T')[0];

            // Get current usage
            const { data, error, status, statusText } = await supabase
                .from('tool_usage')
                .select('usage_count')
                .eq('user_id', user.uid)
                .eq('tool_id', toolId)
                .eq('usage_date', date)
                .single();

            if (error) {
                if (error.code === 'PGRST116') {
                    // PGRST116 is "no rows found", which is fine - means 0 usage
                    return { allowed: true, remaining: DAILY_QUOTA, current: 0 };
                }

                // Extremely verbose logging
                console.error('[QuotaCheck] Supabase Error:', error);
                throw error;
            }

            const count = data?.usage_count || 0;
            return {
                allowed: count < DAILY_QUOTA,
                remaining: DAILY_QUOTA - count,
                current: count
            };
        } catch (err: any) {
            console.error('[QuotaCheck] Fatal Exception:', err);
            return { allowed: true, remaining: 1 }; // Fallback to allow
        } finally {
            setLoading(false);
        }
    }, [user, supabase]);

    const incrementUsage = useCallback(async (toolId: string) => {
        if (!user || !supabase) return;

        const date = new Date().toISOString().split('T')[0];

        try {
            // Upsert usage count
            const { error } = await supabase.rpc('increment_tool_usage', {
                p_user_id: user.uid,
                p_tool_id: toolId,
                p_date: date
            });

            if (error) {
                // If RPC fails, try manual upsert
                const { data: current } = await supabase
                    .from('tool_usage')
                    .select('usage_count')
                    .eq('user_id', user.uid)
                    .eq('tool_id', toolId)
                    .eq('usage_date', date)
                    .single();

                const newCount = (current?.usage_count || 0) + 1;

                await supabase
                    .from('tool_usage')
                    .upsert({
                        user_id: user.uid,
                        tool_id: toolId,
                        usage_date: date,
                        usage_count: newCount
                    }, { onConflict: 'user_id,tool_id,usage_date' });
            }
        } catch (err) {
            console.error('[QuotaCheck] Error incrementing usage:', err);
        }
    }, [user, supabase]);

    return { checkQuota, incrementUsage, loading };
}
