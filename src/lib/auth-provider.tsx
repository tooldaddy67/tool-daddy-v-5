'use client';

import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode, DependencyList } from 'react';
import { createClient } from '@/lib/supabase';
import type { SupabaseClient, User as SupabaseUser, Session } from '@supabase/supabase-js';

// ------------------------------------------------------------------
// Compatibility types – mimic the shape the rest of the app expects
// ------------------------------------------------------------------

export interface AppUser {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
    isAnonymous: boolean;
}

interface AuthContextState {
    user: AppUser | null;
    isUserLoading: boolean;
    userError: Error | null;
    supabase: SupabaseClient;
    session: Session | null;
}

// Return type for useFirebase() – backward compat
export interface FirebaseServicesAndUser {
    firebaseApp: null;
    auth: SupabaseClient | null;      // supabase client acts as "auth"
    user: AppUser | null;
    isUserLoading: boolean;
    userError: Error | null;
}

// Return type for useUser()
export interface UserHookResult {
    user: AppUser | null;
    isUserLoading: boolean;
    userError: Error | null;
}

// ------------------------------------------------------------------
// Context
// ------------------------------------------------------------------
const AuthContext = createContext<AuthContextState | undefined>(undefined);

/** Map a Supabase user to the AppUser shape used everywhere. */
function mapUser(su: SupabaseUser | null | undefined): AppUser | null {
    if (!su) return null;
    return {
        uid: su.id,
        email: su.email ?? null,
        displayName: su.user_metadata?.full_name ?? su.user_metadata?.display_name ?? su.email?.split('@')[0] ?? null,
        photoURL: su.user_metadata?.avatar_url ?? null,
        isAnonymous: false,
    };
}

// ------------------------------------------------------------------
// Provider
// ------------------------------------------------------------------
export function SupabaseAuthProvider({ children }: { children: ReactNode }) {
    const supabase = useMemo(() => createClient(), []);
    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState<AppUser | null>(null);
    const [isUserLoading, setIsUserLoading] = useState(true);
    const [userError, setUserError] = useState<Error | null>(null);

    useEffect(() => {
        // 1. Get the current session
        supabase.auth.getSession().then(({ data: { session: s }, error }) => {
            if (error) {
                console.error('[Auth] getSession error:', error.message);
                setUserError(error);
            }
            setSession(s);
            setUser(mapUser(s?.user));
            setIsUserLoading(false);
        });

        // 2. Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (_event, newSession) => {
                setSession(newSession);
                setUser(mapUser(newSession?.user));
                setIsUserLoading(false);
            },
        );

        return () => { subscription.unsubscribe(); };
    }, [supabase]);

    const value = useMemo<AuthContextState>(
        () => ({ user, isUserLoading, userError, supabase, session }),
        [user, isUserLoading, userError, supabase, session],
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ------------------------------------------------------------------
// Hooks (drop-in replacements)
// ------------------------------------------------------------------

/** Main hook – gives you the supabase client + user */
export function useSupabaseAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useSupabaseAuth must be used inside SupabaseAuthProvider');
    return ctx;
}

/** Drop-in for useFirebase() */
export const useFirebase = (): FirebaseServicesAndUser => {
    const { user, isUserLoading, userError, supabase } = useSupabaseAuth();
    return { firebaseApp: null, auth: supabase as any, user, isUserLoading, userError };
};

/** Drop-in for useUser() */
export const useUser = (): UserHookResult => {
    const { user, isUserLoading, userError } = useSupabaseAuth();
    return { user, isUserLoading, userError };
};

/** Drop-in for useAuth() – returns the supabase client */
export const useAuth = () => {
    const { supabase } = useSupabaseAuth();
    return supabase;
};

// Stubs kept for backward compat
export const useFirestore = (): null => null;
export const useFirebaseApp = (): null => null;

export function useMemoFirebase<T>(factory: () => T, deps: DependencyList): T {
    return useMemo(factory, deps);
}

// Re-export the provider under old name for layout.tsx compat
export const FirebaseClientProvider = SupabaseAuthProvider;
