"use client";
import { useEffect, useState } from 'react';
import { useUser } from '@/firebase';

export function useAuthUserRole() {
  const { user } = useUser();
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    // Firebase doesn't have default roles without custom claims
    if (user) {
      setRole('user'); // Default role
    } else {
      setRole(null);
    }
  }, [user]);

  return role;
}