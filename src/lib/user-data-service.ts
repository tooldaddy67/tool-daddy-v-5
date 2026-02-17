import { User, deleteUser } from 'firebase/auth';


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
 * Deletes the user account and all local data
 */
export async function deleteUserAccount(user: User) {
    if (!user) return;

    try {
        // 1. Delete all Local data
        await deleteUserData();

        // 2. Delete Auth account
        await deleteUser(user);
        console.log('User account deleted');
    } catch (error: any) {
        // Don't log "requires-recent-login" as an error, it's a normal part of the flow
        if (error.code !== 'auth/requires-recent-login') {
            console.error('Error deleting user account:', error);
        }
        throw error;
    }
}
