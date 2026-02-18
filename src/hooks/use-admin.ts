'use client';

import { useState, useEffect, useMemo } from 'react';
import { createClient } from '@/lib/supabase';
import { useUser } from '@/firebase';

export function useAdmin() {
    const { user } = useUser();
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);

    const supabase = useMemo(() => {
        try { return createClient(); } catch { return null; }
    }, []);

    useEffect(() => {
        const checkAdmin = async () => {
            if (!user || !supabase) {
                setIsAdmin(false);
                setLoading(false);
                return;
            }

            try {
                const { data, error } = await supabase
                    .from('profiles')
                    .select('is_admin')
                    .eq('id', user.uid)
                    .maybeSingle();

                if (error) {
                    const msg = error.message || '';
                    if (!msg.includes('Failed to fetch') && !msg.includes('NetworkError')) {
                        console.error('[useAdmin] DB Error:', JSON.stringify(error));
                    }
                    setIsAdmin(false);
                } else {
                    setIsAdmin(data?.is_admin === true);
                }
            } catch (err) {
                setIsAdmin(false);
            } finally {
                setLoading(false);
            }
        };

        checkAdmin();
    }, [user, supabase]);

    return { isAdmin, loading };
}
