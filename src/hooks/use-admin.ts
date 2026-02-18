import { useState, useEffect } from 'react';
import { useFirebase } from '@/firebase';
import { createClient } from '@/lib/supabase';

export function useAdmin() {
    const { user } = useFirebase();
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        const checkAdmin = async () => {
            if (!user) {
                console.log('[useAdmin] No user, setting isAdmin false');
                setIsAdmin(false);
                setLoading(false);
                return;
            }

            try {
                console.log('[useAdmin] Checking admin status for:', user.uid);
                const { data, error } = await supabase
                    .from('profiles')
                    .select('is_admin')
                    .eq('id', user.uid)
                    .single();

                if (error) {
                    if (error.code === 'PGRST116') {
                        console.log('[useAdmin] Profile not found for:', user.uid);
                    } else {
                        console.error('[useAdmin] Supabase error:', {
                            message: error.message,
                            code: error.code,
                            details: error.details,
                            hint: error.hint
                        });
                    }
                    setIsAdmin(false);
                } else {
                    console.log('[useAdmin] Admin status for', user.uid, ':', data?.is_admin);
                    setIsAdmin(data?.is_admin || false);
                }
            } catch (err) {
                console.error('[useAdmin] Fatal error:', err);
                setIsAdmin(false);
            } finally {
                setLoading(false);
            }
        };

        checkAdmin();
    }, [user, supabase]);

    return { isAdmin, loading };
}
