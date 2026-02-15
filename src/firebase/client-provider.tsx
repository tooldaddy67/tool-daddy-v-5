'use client';

import React, { useState, useEffect, type ReactNode } from 'react';
import { FirebaseProvider } from '@/firebase/provider';
import { initializeFirebase } from '@/firebase';

interface FirebaseClientProviderProps {
  children: ReactNode;
}

export function FirebaseClientProvider({ children }: FirebaseClientProviderProps) {
  const [services, setServices] = useState<any>(null);

  useEffect(() => {
    // Delay initialization to move Firebase out of the critical hydration path
    const timer = setTimeout(() => {
      setServices(initializeFirebase());
    }, 1500); // 1.5s delay to ensure LCP is scored and main thread is quiet
    return () => clearTimeout(timer);
  }, []);

  return (
    <FirebaseProvider
      firebaseApp={services?.firebaseApp}
      auth={services?.auth}
      firestore={services?.firestore}
    >
      {children}
    </FirebaseProvider>
  );
}