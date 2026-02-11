import { NextResponse } from 'next/server';
import { adminAuth, adminFirestore } from '@/lib/firebase-admin';
import { deleteUserDataAdmin } from '@/lib/admin-data-service';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Allow 60 seconds (Vercel max for standard functions)

export async function GET(request: Request) {
    // Security check (optional but recommended for cron jobs)
    const authHeader = request.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    try {
        const now = new Date();
        const cutoffDate = new Date(now.getTime() - 29 * 24 * 60 * 60 * 1000); // 29 days ago

        let deletedCount = 0;
        let processedCount = 0;
        let errors = [];

        // List all users (batch by batch if needed, but for now max 1000)
        // Ideally loop with pageToken for large user bases
        let nextPageToken;

        do {
            const listUsersResult = await adminAuth.listUsers(1000, nextPageToken);

            for (const user of listUsersResult.users) {
                processedCount++;
                const creationTime = new Date(user.metadata.creationTime);
                const lastSignInTime = user.metadata.lastSignInTime ? new Date(user.metadata.lastSignInTime) : creationTime;

                // Condition: Account > 29 days old AND Inactive > 29 days
                if (creationTime < cutoffDate && lastSignInTime < cutoffDate) {
                    try {
                        console.log(`[Auto-Delete] Deleting inactive user: ${user.uid} (Last active: ${lastSignInTime.toISOString()})`);

                        // 1. Delete Firestore Data
                        await deleteUserDataAdmin(user.uid);

                        // 2. Delete Auth Account
                        await adminAuth.deleteUser(user.uid);

                        deletedCount++;
                    } catch (error: any) {
                        console.error(`[Auto-Delete] Failed to delete user ${user.uid}:`, error);
                        errors.push({ uid: user.uid, error: error.message });
                    }
                }
            }

            nextPageToken = listUsersResult.pageToken;
        } while (nextPageToken);

        // --- Phase 2: Clean up old notifications (>7 days) ---
        let notificationsDeleted = 0;
        try {
            const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            const usersSnapshot = await adminFirestore.collection('users').listDocuments();

            for (const userDocRef of usersSnapshot) {
                const oldNotifs = await userDocRef
                    .collection('notifications')
                    .where('createdAt', '<', sevenDaysAgo)
                    .limit(500)
                    .get();

                if (!oldNotifs.empty) {
                    const batch = adminFirestore.batch();
                    oldNotifs.docs.forEach((doc) => batch.delete(doc.ref));
                    await batch.commit();
                    notificationsDeleted += oldNotifs.size;
                }
            }
        } catch (notifError: any) {
            console.error('Error cleaning up notifications:', notifError);
            errors.push({ task: 'notification-cleanup', error: notifError.message });
        }

        return NextResponse.json({
            success: true,
            processed: processedCount,
            deleted: deletedCount,
            notificationsDeleted,
            errors: errors.length > 0 ? errors : undefined,
            cutoffDate: cutoffDate.toISOString()
        });

    } catch (error: any) {
        console.error('Error in cleanup-users cron:', error);
        return new NextResponse(`Internal Server Error: ${error.message}`, { status: 500 });
    }
}
