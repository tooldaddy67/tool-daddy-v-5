"use client";
import { useEffect } from 'react';
import { getAuth, multiFactor, PhoneAuthProvider, PhoneMultiFactorGenerator } from 'firebase/auth';
import { useAuthUserRole } from './use-auth-role';

/**
 * React hook to enforce MFA for users with the 'unstablegng' role.
 * If the user is signed in and has the role but not enrolled in MFA, prompt for enrollment.
 */
export function useEnforceMfaForUnstablegng() {
  const userRole = useAuthUserRole();
  useEffect(() => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (user && userRole === 'unstablegng') {
      const mfaInfo = multiFactor(user).enrolledFactors;
      if (!mfaInfo || mfaInfo.length === 0) {
        // Here you would trigger your UI to prompt for MFA enrollment (e.g., phone number verification)
        // This is a placeholder for actual MFA enrollment logic
        // Example: showMfaEnrollmentModal();
        // You can use PhoneAuthProvider and multiFactor(user).enroll(...)
        // For now, just log to console
        console.warn('User with unstablegng role must enroll in MFA.');
      }
    }
  }, [userRole]);
}
