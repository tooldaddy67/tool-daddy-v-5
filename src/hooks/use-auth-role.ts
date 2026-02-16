"use client";
import { useEffect, useState } from 'react';
import { useFirebase } from '@/firebase/provider';

export function useAuthUserRole() {
  const { auth, user } = useFirebase();
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    if (!auth) return;

    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        const token = await user.getIdTokenResult();
        setRole((token.claims as any).role || null);
      } else {
        setRole(null);
      }
    });
    return () => unsubscribe();
  }, [auth]);

  return role;
}