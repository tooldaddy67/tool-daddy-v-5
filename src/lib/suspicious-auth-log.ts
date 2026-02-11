import { logAuditEvent } from './audit-log';

/**
 * Log and optionally alert on suspicious authentication attempts.
 * Suspicious events: repeated failed logins, use of known breached passwords, etc.
 *
 * @param {Object} params
 * @param {string} params.userId - The user (if known)
 * @param {string} params.event - The suspicious event type
 * @param {string} [params.ip] - The IP address
 * @param {object} [params.details] - Additional details
 */
interface SuspiciousAuthParams {
  userId?: string;
  event: string;
  ip?: string;
  details?: Record<string, any>;
}

export async function logSuspiciousAuthAttempt({ userId = 'unknown', event, ip = '', details = {} }: SuspiciousAuthParams) {
  // Log to Firestore audit log
  await logAuditEvent({
    userId,
    action: 'suspicious_auth',
    target: ip,
    details: { event, ...details },
  });

  // Simple alert: log to server console (replace with email/SMS/Slack as needed)
  console.warn(`[ALERT] Suspicious auth attempt:`, { userId, event, ip, details });
}
