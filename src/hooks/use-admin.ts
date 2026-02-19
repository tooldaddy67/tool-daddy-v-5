'use client';

import { useState, useEffect } from 'react';
import { useFirebase } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';

export function useAdmin() {
    const { user, db } = useFirebase();
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAdmin = async () => {
            if (!user || !db) {
                setIsAdmin(false);
                setLoading(false);
                return;
            }

            try {
                const docRef = doc(db, 'profiles', user.uid);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setIsAdmin(data?.isAdmin === true || data?.is_admin === true); // support both for migration ease
                } else {
                    setIsAdmin(false);
                }
            } catch (err) {
                console.error('[useAdmin] Error checking admin status:', err);
                setIsAdmin(false);
            } finally {
                setLoading(false);
            }
        };

        checkAdmin();
    }, [user, db]);

    return { isAdmin, loading };
}
