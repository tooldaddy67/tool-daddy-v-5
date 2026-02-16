'use client';

import React, { useMemo } from 'react';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { firebaseConfig } from './config';
import { FirebaseProvider } from './provider';

export function FirebaseClientProvider({ children }: { children: React.ReactNode }) {
    const firebaseApp = useMemo(() => {
        return getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    }, []);

    const firestore = useMemo(() => getFirestore(firebaseApp), [firebaseApp]);
    const auth = useMemo(() => getAuth(firebaseApp), [firebaseApp]);

    return (
        <FirebaseProvider
            firebaseApp={firebaseApp}
            firestore={firestore}
            auth={auth}
        >
            {children}
        </FirebaseProvider>
    );
}
