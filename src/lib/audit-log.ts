export type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR' | 'FATAL';

export interface AuditEvent {
  userId: string;
  action: string;
  userEmail?: string;
  target?: string;
  status?: 'success' | 'warning' | 'error';
  level?: LogLevel;
  details?: Record<string, any>;
  duration?: number;
  ip?: string;
  userAgent?: string;
}

/**
 * Logs an audit event to the server console.
 */
export async function logAuditEvent(event: AuditEvent) {
  const {
    userId,
    action,
    status = 'success',
    level = 'INFO',
    details = {},
  } = event;

  try {
    const logEntry = {
      ...event,
      level: status === 'error' ? 'ERROR' : (status === 'warning' ? 'WARN' : level),
      timestamp: new Date().toISOString()
    };

    console.log(`[AUDIT] ${action} - ${status} - User: ${userId}`, logEntry);
  } catch (error) {
    console.error('Failed to log audit event:', error);
  }
}
