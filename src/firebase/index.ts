// Re-export everything from the auth provider
// This keeps all existing imports (import { useFirebase } from '@/firebase') working
export {

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
