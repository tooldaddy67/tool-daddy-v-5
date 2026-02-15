import { adminFirestore } from './firebase-admin';

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

export async function logAuditEvent({
  userId,
  action,
  userEmail,
  target,
  status = 'success',
  level = 'INFO',
  details = {},
  duration,
  ip,
  userAgent
}: AuditEvent) {
  try {
    if (!adminFirestore) return;
    await adminFirestore.collection('audit_logs').add({
      userId,
      action,
      userEmail: userEmail || 'system@internal',
      target: target || 'global',
      status,
      level: status === 'error' ? 'ERROR' : (status === 'warning' ? 'WARN' : level),
      details,
      duration: duration || null,
      ip: ip || '0.0.0.0',
      userAgent: userAgent || 'internal/system',
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Failed to log audit event:', error);
  }
}
