import { NextResponse } from 'next/server';
import { getAdminAuth, getAdminFirestore } from '@/lib/firebase-admin';

/**
 * Cron job to clean up inactive users.
 * 
 * Criteria:
 * - Users who haven't signed in for more than 90 days
 * - Users with no profile data (optional, but good for hygiene)
 * 
 * Frequency: Recommended daily via Vercel Cron.
 * Security: Protected by CRON_SECRET header.
 */
export async function GET(request: Request) {
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    // Verify cron secret if configured
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
        console.warn('[CRON] Unauthorized cleanup attempt');
        return new Response('Unauthorized', { status: 401 });
    }

    try {
        const auth = getAdminAuth();
        const db = getAdminFirestore();

        // Define inactivity threshold (90 days)
        const INACTIVITY_DAYS = 90;
        const thresholdDate = new Date();
        thresholdDate.setDate(thresholdDate.getDate() - INACTIVITY_DAYS);
        const thresholdMs = thresholdDate.getTime();

        console.log(`[CRON] Starting user cleanup. Threshold: ${thresholdDate.toISOString()}`);

        let totalDeleted = 0;
        let nextPageToken: string | undefined = undefined;

        // Process users in pages to avoid memory/timeout issues
        do {
            const listUsersResult = await auth.listUsers(1000, nextPageToken);

            const inactiveUsers = listUsersResult.users.filter(user => {
                const lastSignInDate = user.metadata.lastSignInTime
                    ? new Date(user.metadata.lastSignInTime)
                    : new Date(user.metadata.creationTime);
                return lastSignInDate.getTime() < thresholdMs;
            });

            if (inactiveUsers.length > 0) {
                console.log(`[CRON] Found ${inactiveUsers.length} inactive users in this batch.`);

                // Delete each user from Auth and Firestore
                // We use Promise.allSettled to ensure we try to delete everyone even if one fails
                const deletePromises = inactiveUsers.map(async (user) => {
                    try {
                        // 1. Delete from Firebase Auth
                        await auth.deleteUser(user.uid);

                        // 2. Delete Profile from Firestore
                        await db.collection('profiles').doc(user.uid).delete();

                        // 3. Delete Tool Usage (Optional: GDPR compliance)
                        const usageDocs = await db.collection('tool_usage')
                            .where('userId', '==', user.uid)
                            .get();

                        const batch = db.batch();
                        usageDocs.forEach(doc => batch.delete(doc.ref));
                        await batch.commit();

                        return user.uid;
                    } catch (err: any) {
                        console.error(`[CRON] Failed to delete user ${user.uid}:`, err.message);
                        throw err;
                    }
                });

                const results = await Promise.allSettled(deletePromises);
                totalDeleted += results.filter(r => r.status === 'fulfilled').length;
            }

            nextPageToken = listUsersResult.pageToken;
        } while (nextPageToken);

        console.log(`[CRON] Cleanup complete. Deleted ${totalDeleted} users.`);

        return NextResponse.json({
            success: true,
            deletedCount: totalDeleted,
            threshold: thresholdDate.toISOString(),
            timestamp: new Date().toISOString()
        });

    } catch (error: any) {
        console.error('[CRON] Fatal cleanup error:', error);
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}

// Ensure the route is not cached
export const dynamic = 'force-dynamic';
