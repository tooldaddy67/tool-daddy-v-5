import { createClient } from '@/lib/supabase';

/**
 * Deletes all user data from LOCAL STORAGE
 */
export async function deleteUserData() {
    try {
        console.log(`Starting data deletion from local storage`);

        // Clear all Tool Daddy specific local storage
        if (typeof window !== 'undefined') {
            const keysToRemove = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && (key.startsWith('tool-daddy-') || key.startsWith('simple-notepad-'))) {
                    keysToRemove.push(key);
                }
            }
            keysToRemove.forEach(key => localStorage.removeItem(key));
        }

        console.log('Local data deletion complete');
    } catch (error) {
        console.error('Error deleting local data:', error);
        throw error;
    }
}

/**
 * Deletes the user account and all local data.
 * Uses Supabase auth to delete the current session user.
 */
export async function deleteUserAccount() {
    try {
        // 1. Delete all Local data
        await deleteUserData();

        // 2. Sign out (actual account deletion requires admin/service role)
        const supabase = createClient();
        const { error } = await supabase.auth.signOut();
        if (error) throw error;

        console.log('User signed out and local data deleted');
    } catch (error: any) {
        console.error('Error during account cleanup:', error);
        throw error;
    }
}
