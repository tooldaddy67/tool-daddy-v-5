import { adminFirestore } from './firebase-admin';

/**
 * Deletes all documents in a collection/subcollection using Admin SDK
 */
async function deleteCollectionAdmin(collectionPath: string, batchSize = 100) {
    const collectionRef = adminFirestore.collection(collectionPath);
    const query = collectionRef.orderBy('__name__').limit(batchSize);

    return new Promise((resolve, reject) => {
        deleteQueryBatch(adminFirestore, query, resolve).catch(reject);
    });
}

async function deleteQueryBatch(db: FirebaseFirestore.Firestore, query: FirebaseFirestore.Query, resolve: (value?: unknown) => void) {
    const snapshot = await query.get();

    const batchSize = snapshot.size;
    if (batchSize === 0) {
        // When there are no documents left, we are done
        resolve();
        return;
    }

    const batch = db.batch();
    snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
    });
    await batch.commit();

    // Recurse on the next process tick, to avoid
    // exploding the stack.
    process.nextTick(() => {
        deleteQueryBatch(db, query, resolve);
    });
}

/**
 * Deletes all user data from Firestore using Admin SDK
 */
export async function deleteUserDataAdmin(userId: string) {
    if (!userId) return;

    try {
        console.log(`[Admin] Starting data deletion for user: ${userId}`);

        // 1. Delete History
        await deleteCollectionAdmin(`users/${userId}/history`);

        // 2. Delete Palettes
        await deleteCollectionAdmin(`users/${userId}/palettes`);

        // 3. Delete Notifications
        await deleteCollectionAdmin(`users/${userId}/notifications`);

        // 4. Delete Todo Lists (and their sub-tasks)
        const todoListsSnapshot = await adminFirestore.collection(`users/${userId}/todolists`).get();

        // First delete subcollections (tasks) for each list
        for (const doc of todoListsSnapshot.docs) {
            await deleteCollectionAdmin(`users/${userId}/todolists/${doc.id}/tasks`);
        }

        // Then delete the lists themselves
        await deleteCollectionAdmin(`users/${userId}/todolists`);

        // 5. Delete Settings
        // Delete entire settings collection or specific docs?
        // Let's delete the `settings` collection if possible, or known docs.
        await deleteCollectionAdmin(`users/${userId}/settings`);

        // 6. Delete the user document itself
        await adminFirestore.collection('users').doc(userId).delete();

        console.log(`[Admin] User data deletion complete for ${userId}`);
    } catch (error) {
        console.error(`[Admin] Error deleting user data for ${userId}:`, error);
        throw error;
    }
}
