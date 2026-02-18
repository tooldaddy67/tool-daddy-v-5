"use client";
import { useEffect } from 'react';
import { useAuthUserRole } from './use-auth-role';

/**
 * React hook placeholder for MFA enforcement.
 * Supabase MFA is handled via the Supabase dashboard/config, not in-app.
 * This hook is kept for backward compatibility.
 */
export function useEnforceMfaForUnstablegng() {
  const userRole = useAuthUserRole();
  useEffect(() => {
    // Supabase handles MFA at the project level, not via client SDK
    // No-op for now
  }, [userRole]);
}
