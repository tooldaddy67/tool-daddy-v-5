import { getFirestore, collection, addDoc, Timestamp } from 'firebase/firestore';

/**
 * Log a sensitive operation to Firestore 'audit_logs' collection.
 * @param {Object} params
 * @param {string} params.userId - The user performing the action
 * @param {string} params.action - The action performed (e.g., 'delete', 'role_change')
 * @param {string} params.target - The target of the action (e.g., userId, resourceId)
 * @param {object} [params.details] - Additional details
 */
export async function logAuditEvent({ userId, action, target, details = {} }) {
  try {
    const db = getFirestore();
    await addDoc(collection(db, 'audit_logs'), {
      userId,
      action,
      target,
      details,
      timestamp: Timestamp.now(),
    });
  } catch (error) {
    // Optionally, handle/log error elsewhere
    console.error('Failed to log audit event:', error);
  }
}
