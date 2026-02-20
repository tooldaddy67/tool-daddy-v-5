'use client';

import { useState, useEffect } from 'react';
import { useFirebase } from '@/firebase';
import { doc, onSnapshot } from 'firebase/firestore';

export function useAdmin() {
    const { user, db } = useFirebase();
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user || !db) {
            setIsAdmin(false);
            setLoading(false);
            return;
        }

        const docRef = doc(db, 'profiles', user.uid);

        const unsubscribe = onSnapshot(docRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                // console.log('[useAdmin] Profile update:', data);
                setIsAdmin(data?.isAdmin === true || data?.is_admin === true);
            } else {
                setIsAdmin(false);
            }
            setLoading(false);
        }, (err) => {
            console.error('[useAdmin] Error listening to admin status:', err);
            setIsAdmin(false);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user, db]);

    return { isAdmin, loading };
}
