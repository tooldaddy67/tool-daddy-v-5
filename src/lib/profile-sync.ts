import { createClient } from './supabase';
import { User } from 'firebase/auth';

/**
 * Ensures a Supabase profile exists for the given Firebase user.
 * Updates the profile if it already exists to keep it in sync.
 */
export async function syncUserProfile(user: User) {
    if (!user || user.isAnonymous) return;

    const supabase = createClient();
    if (!supabase) return;

    try {
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
        console.log('[ProfileSync] Syncing user:', user.uid, 'to Supabase at', url ? 'URL Present' : 'MISSING URL');

        const profileData = {
            id: user.uid,
            full_name: user.displayName || '',
            avatar_url: user.photoURL || '',
            updated_at: new Date().toISOString(),
        };

        const { data, error } = await supabase
            .from('profiles')
            .upsert(profileData, { onConflict: 'id' })
            .select();

        if (error) {
            console.error('[ProfileSync] Supabase Upsert Error:', {
                message: error.message,
                code: error.code,
                details: error.details,
                hint: error.hint
            });
        } else {
            console.log('[ProfileSync] Profile synced successfully:', user.uid);
        }
    } catch (err) {
        console.error('[ProfileSync] Fatal Error:', err);
    }
}
