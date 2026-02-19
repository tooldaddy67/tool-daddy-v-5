import { User } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { getApp, getApps, initializeApp } from 'firebase/app';
import { firebaseConfig } from '@/firebase/config';

/**
 * Ensures a Firestore profile exists for the given Firebase user.
 * Updates the profile if it already exists to keep it in sync.
 */
export async function syncUserProfile(user: User) {
    if (!user || user.isAnonymous) return;

    try {
        const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
        const db = getFirestore(app);

        // console.log('[ProfileSync] Syncing user:', user.uid);

        const profileData = {
            id: user.uid,
            full_name: user.displayName || '',
            avatar_url: user.photoURL || '',
            email: user.email || '',
            updated_at: new Date().toISOString(),
        };

        const userRef = doc(db, 'profiles', user.uid);
        await setDoc(userRef, profileData, { merge: true });

        console.log('[ProfileSync] Profile synced for:', user.uid);
    } catch (err) {
        console.error('[ProfileSync] Error syncing profile:', err);
    }
}
