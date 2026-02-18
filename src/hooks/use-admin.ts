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
                setIsAdmin(false);
                setLoading(false);
                return;
            }

            try {
                const { data, error } = await supabase
                    .from('profiles')
                    .select('is_admin')
                    .eq('id', user.uid)
                    .single();

                if (error) throw error;
                setIsAdmin(data?.is_admin || false);
            } catch (err) {
                console.error('Error checking admin status:', err);
                setIsAdmin(false);
            } finally {
                setLoading(false);
            }
        };

        checkAdmin();
    }, [user, supabase]);

    return { isAdmin, loading };
}
