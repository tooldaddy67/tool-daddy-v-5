import { getAuth } from 'firebase-admin/auth';

/**
 * Revoke refresh tokens for users inactive for a given number of days.
 * Logs the action to the console (can be extended to log to Firestore).
 * @param {number} daysInactive - Number of days of inactivity before revocation
 */
export async function revokeInactiveUserTokens(daysInactive = 30) {
  const auth = getAuth();
  const now = Date.now();
  const cutoff = now - daysInactive * 24 * 60 * 60 * 1000;
  let nextPageToken;
  do {
    const result: any = await auth.listUsers(1000, nextPageToken);
    for (const user of result.users) {
      if (user.metadata.lastSignInTime) {
        const lastSignIn = new Date(user.metadata.lastSignInTime).getTime();
        if (lastSignIn < cutoff) {
          await auth.revokeRefreshTokens(user.uid);
          console.log(`Revoked tokens for inactive user: ${user.uid}`);
        }
      }
    }
    nextPageToken = result.pageToken;
  } while (nextPageToken);
}
