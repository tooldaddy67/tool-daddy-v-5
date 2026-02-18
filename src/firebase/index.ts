// Re-export everything from the new Supabase auth provider
// This keeps all existing imports (import { useFirebase } from '@/firebase') working
export {
    SupabaseAuthProvider,
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
