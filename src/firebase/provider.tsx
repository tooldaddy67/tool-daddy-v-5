// This file now re-exports from the Supabase auth provider for backward compatibility
// Files that import from '@/firebase/provider' will get the new Supabase-based hooks
export {
  SupabaseAuthProvider as FirebaseProvider,
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
