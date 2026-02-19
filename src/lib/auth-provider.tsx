'use client';

import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth, onAuthStateChanged, User, signOut, GoogleAuthProvider, signInWithPopup, isSignInWithEmailLink, signInWithEmailLink } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAnalytics, Analytics, isSupported } from 'firebase/analytics';
import { firebaseConfig } from '@/firebase/config';

// ------------------------------------------------------------------
// Types
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
    firebaseUser: User | null;
    isUserLoading: boolean;
    userError: Error | null;
    app: FirebaseApp | null;
    auth: Auth | null;
    db: Firestore | null;
    analytics: Analytics | null;
}

export interface FirebaseServicesAndUser {
    firebaseApp: FirebaseApp | null;
    auth: Auth | null;
    user: AppUser | null;
    firebaseUser: User | null;
    isUserLoading: boolean;
    userError: Error | null;
    db: Firestore | null;
}

export interface UserHookResult {
    user: AppUser | null;
    firebaseUser: User | null;
    isUserLoading: boolean;
    userError: Error | null;
}

// ------------------------------------------------------------------
// Context
// ------------------------------------------------------------------
const AuthContext = createContext<AuthContextState | undefined>(undefined);

function mapUser(user: User | null): AppUser | null {
    if (!user) return null;
    return {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        isAnonymous: user.isAnonymous,
    };
}

// ------------------------------------------------------------------
// Provider
// ------------------------------------------------------------------
export function FirebaseAuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<AppUser | null>(null);
    const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
    const [isUserLoading, setIsUserLoading] = useState(true);
    const [userError, setUserError] = useState<Error | null>(null);

    // Initialize Firebase
    const app = useMemo(() => {
        if (typeof window === 'undefined') return null;
        return getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    }, []);

    const auth = useMemo(() => (app ? getAuth(app) : null), [app]);
    const db = useMemo(() => (app ? getFirestore(app) : null), [app]);

    const [analytics, setAnalytics] = useState<Analytics | null>(null);

    useEffect(() => {
        if (app && typeof window !== 'undefined') {
            isSupported().then((supported) => {
                if (supported) {
                    setAnalytics(getAnalytics(app));
                }
            }).catch(console.error);
        }
    }, [app]);


    useEffect(() => {
        if (!auth) {
            setIsUserLoading(false);
            return;
        }

        const unsubscribe = onAuthStateChanged(
            auth,
            (fbUser) => {
                setFirebaseUser(fbUser);
                setUser(mapUser(fbUser));
                setIsUserLoading(false);
            },
            (error) => {
                console.error('[Auth] Error:', error);
                setUserError(error);
                setIsUserLoading(false);
            }
        );

        return () => unsubscribe();
    }, [auth]);

    // Handle Magic Link Sign-In
    useEffect(() => {
        if (!auth || typeof window === 'undefined') return;

        if (isSignInWithEmailLink(auth, window.location.href)) {
            let email = window.localStorage.getItem('emailForSignIn');

            if (!email) {
                // User opened link on a different device. Ask for email.
                email = window.prompt('Please provide your email for confirmation');
            }

            if (email) {
                signInWithEmailLink(auth, email, window.location.href)
                    .then(() => {
                        window.localStorage.removeItem('emailForSignIn');
                        // Remove the query parameters to clean up the URL
                        window.history.replaceState({}, document.title, window.location.pathname);
                    })
                    .catch((error) => {
                        console.error('Error signing in with email link:', error);
                        // Optionally set an error state here if you want to expose it
                        setUserError(error);
                    });
            }
        }
    }, [auth]);

    const value = useMemo<AuthContextState>(
        () => ({ user, firebaseUser, isUserLoading, userError, app, auth, db, analytics }),
        [user, firebaseUser, isUserLoading, userError, app, auth, db, analytics]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ------------------------------------------------------------------
// Hooks
// ------------------------------------------------------------------

export function useFirebaseAuthContext() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useFirebaseAuthContext must be used inside FirebaseAuthProvider');
    return ctx;
}

export const useFirebase = (): FirebaseServicesAndUser => {
    const { app, auth, user, firebaseUser, isUserLoading, userError, db } = useFirebaseAuthContext();
    return { firebaseApp: app, auth, user, firebaseUser, isUserLoading, userError, db };
};

export const useUser = (): UserHookResult => {
    const { user, firebaseUser, isUserLoading, userError } = useFirebaseAuthContext();
    return { user, firebaseUser, isUserLoading, userError };
};

export const useAuth = () => {
    const { auth } = useFirebaseAuthContext();
    return auth;
};

export const useFirestore = () => {
    const { db } = useFirebaseAuthContext();
    return db;
};

export const useFirebaseApp = () => {
    const { app } = useFirebaseAuthContext();
    return app;
};

export function useMemoFirebase<T>(factory: () => T, deps: React.DependencyList): T {
    return useMemo(factory, deps);
}

// Aliases for backward compatibility with existing imports

export const FirebaseClientProvider = FirebaseAuthProvider;
