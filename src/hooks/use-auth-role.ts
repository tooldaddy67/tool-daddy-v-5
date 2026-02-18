"use client";
import { useEffect, useState } from 'react';
import { useSupabaseAuth } from '@/lib/auth-provider';

export function useAuthUserRole() {
  const { supabase, user } = useSupabaseAuth();
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    // Supabase doesn't have custom claims like Firebase
    // If you need roles, store them in the profiles table
    if (user) {
      setRole('user'); // Default role
    } else {
      setRole(null);
    }
  }, [user]);

  return role;
}