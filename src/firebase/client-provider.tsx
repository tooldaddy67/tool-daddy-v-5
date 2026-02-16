'use client';

import React, { ReactNode, useMemo } from 'react';
import { initializeFirebase } from './init';
import { FirebaseProvider } from './provider';

/**
 * FirebaseClientProvider is a wrapper around FirebaseProvider that
 * initializes Firebase SDKs on the client side.
 */
export function FirebaseClientProvider({ children }: { children: ReactNode }) {
    // Initialize Firebase and get SDK instances
    const sdks = useMemo(() => initializeFirebase(), []);

    return (
        <FirebaseProvider
            firebaseApp={sdks.firebaseApp}
            firestore={sdks.firestore}
            auth={sdks.auth}
        >
            {children}
        </FirebaseProvider>
    );
}
