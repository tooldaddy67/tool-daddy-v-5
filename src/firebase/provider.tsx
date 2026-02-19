// This file re-exports from the auth provider
// Files that import from '@/firebase/provider' will get the Firebase-based hooks
export {

  FirebaseClientProvider as FirebaseProvider,
  FirebaseClientProvider,
  useFirebase,
  useUser,
  useAuth,
  useFirebaseApp,
  useFirestore,
  useMemoFirebase,
} from '@/lib/auth-provider';

export type {
  FirebaseServicesAndUser,
  UserHookResult,
  AppUser,
} from '@/lib/auth-provider';

// Keep the context export for any files that reference it directly
export { default as React } from 'react';
