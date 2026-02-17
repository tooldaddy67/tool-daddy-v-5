'use client';

import React, { useMemo } from 'react';
import { initializeApp, getApps, getApp } from 'firebase/app';
// Firestore removed
import { getAuth } from 'firebase/auth';
import { firebaseConfig } from './config';
import { FirebaseProvider } from './provider';

export function FirebaseClientProvider({ children }: { children: React.ReactNode }) {
    const firebaseApp = useMemo(() => {
        return getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    }, []);

    const auth = useMemo(() => getAuth(firebaseApp), [firebaseApp]);

    return (
        <FirebaseProvider
            firebaseApp={firebaseApp}
            auth={auth}
        >
            {children}
        </FirebaseProvider>
    );
}
