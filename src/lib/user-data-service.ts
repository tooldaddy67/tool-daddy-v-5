import { collection, deleteDoc, doc, getDocs, writeBatch, Firestore, DocumentData, QuerySnapshot } from 'firebase/firestore';
import { User, deleteUser } from 'firebase/auth';

/**
 * Deletes all documents in a subcollection
 */
async function deleteCollection(firestore: Firestore, path: string) {
    const colRef = collection(firestore, path);
    const snapshot = await getDocs(colRef);

    if (snapshot.empty) return;

    const batch = writeBatch(firestore);
    let count = 0;

    snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
        count++;
    });

    await batch.commit();
    console.log(`Deleted ${count} documents from ${path}`);
}

/**
 * Deletes all subcollections for a specific todo list
 */
async function deleteTodoListSubcollections(firestore: Firestore, userId: string, listId: string) {
    // Delete tasks subcollection for this list
    await deleteCollection(firestore, `users/${userId}/todolists/${listId}/tasks`);
}

/**
 * Deletes all user data from Firestore
 */
export async function deleteUserData(firestore: Firestore, userId: string) {
    if (!userId) return;

    try {
        console.log(`Starting data deletion for user: ${userId}`);

        // 1. Delete History
        await deleteCollection(firestore, `users/${userId}/history`);

        // 2. Delete Palettes
        await deleteCollection(firestore, `users/${userId}/palettes`);

        // 3. Delete Notifications
        await deleteCollection(firestore, `users/${userId}/notifications`);

        // 4. Delete Todo Lists (and their sub-tasks)
        const todoListsRef = collection(firestore, `users/${userId}/todolists`);
        const todoListsSnapshot = await getDocs(todoListsRef);

        // First delete subcollections (tasks) for each list
        for (const doc of todoListsSnapshot.docs) {
            await deleteTodoListSubcollections(firestore, userId, doc.id);
        }

        // Then delete the lists themselves
        await deleteCollection(firestore, `users/${userId}/todolists`);

        // 5. Delete specific settings docs (except preferences which contains the flag itself, though we might want to reset it?)
        // The prompt says "delete it", implying all data.
        // However, we need to keep the "dataPersistence: false" preference! 
        // So we should NOT delete `users/${userId}/settings/preferences` entirely, or we should re-create it.
        // But we SHOULD delete other settings like `users/${userId}/settings/notepad`.
        await deleteDoc(doc(firestore, `users/${userId}/settings/notepad`));

        console.log('User data deletion complete');
    } catch (error) {
        console.error('Error deleting user data:', error);
        throw error;
    }
}

/**
 * Deletes the user account and all data
 */
export async function deleteUserAccount(firestore: Firestore, user: User) {
    if (!user) return;

    try {
        // 1. Delete all Firestore data
        await deleteUserData(firestore, user.uid);

        // 2. Delete the user document itself (if it exists)
        await deleteDoc(doc(firestore, 'users', user.uid));

        // 3. Delete preferences specifically (since we are deleting the account)
        await deleteDoc(doc(firestore, `users/${user.uid}/settings/preferences`));

        // 4. Delete Auth account
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
