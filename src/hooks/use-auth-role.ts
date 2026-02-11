"use client";
import { useEffect, useState } from 'react';
import { initializeFirebase } from '@/firebase';

export function useAuthUserRole() {
  const [role, setRole] = useState<string | null>(null);
  useEffect(() => {
    const { auth } = initializeFirebase();
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        const token = await user.getIdTokenResult();
        setRole((token.claims as any).role || null);
      } else {
        setRole(null);
      }
    });
    return () => unsubscribe();
  }, []);
  return role;
}