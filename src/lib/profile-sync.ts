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
            const msg = error.message || '';
            if (!msg.includes('Failed to fetch') && !msg.includes('NetworkError')) {
                console.error('[ProfileSync] Upsert Error:', JSON.stringify(error));
            }
        } else {
            console.log('[ProfileSync] Profile synced for:', user.uid);
        }
    } catch (err) {
        // Silently handle network errors
    }
}
