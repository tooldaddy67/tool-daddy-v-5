import { getAdminFirestore } from '@/lib/firebase-admin';

export async function verifyAdminPassword(password: string, userId?: string) {
    const correctPassword = process.env.ADMIN_PASSWORD;

    if (!correctPassword) {
        console.error('ADMIN_PASSWORD environment variable is not set!');
        return { isValid: false, isLocked: false, error: 'Configuration Error: Admin password not set.' };
    }

    if (password === correctPassword) {
        if (userId) {
            try {
                const db = getAdminFirestore();
                await db.collection('profiles').doc(userId).set({
                    isAdmin: true,
                    is_admin: true,
                    updatedAt: new Date()
                }, { merge: true });
                console.log(`[AdminAction] Granted admin access to user ${userId}`);
            } catch (error) {
                console.error('[AdminAction] Error granting admin access:', error);
                // We still return isValid: true because the password was correct, 
                // but we might want to return an error about the persistence failure.
            }
        }
        return { isValid: true, isLocked: false };
    }

    return { isValid: false, isLocked: false, error: 'Incorrect password' };
}
