import { headers } from 'next/headers';
import { adminFirestore } from '@/lib/firebase-admin';
import { getSystemConfig } from '@/app/actions/system-config';
import admin from 'firebase-admin';

/**
 * Robust rate limiting for Tool Daddy
 * Supports both in-memory and Firestore-backed persistent limiting
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const globalStore = global as unknown as { _rateLimitStore?: Map<string, RateLimitEntry> };
const rateLimitStore = globalStore._rateLimitStore || new Map<string, RateLimitEntry>();
if (process.env.NODE_ENV !== 'production') globalStore._rateLimitStore = rateLimitStore;

// Cleanup old in-memory entries every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of rateLimitStore.entries()) {
      if (now > entry.resetTime) {
        rateLimitStore.delete(key);
      }
    }
  }, 5 * 60 * 1000);
}

/**
 * Get client identifier (IP + UA) for rate limiting
 */
export async function getRateLimitIdentifier(): Promise<string> {
  const headersList = await headers();
  const ip = headersList.get('x-forwarded-for')?.split(',')[0].trim() || '0.0.0.0';
  const userAgent = headersList.get('user-agent') || 'unknown';
  // Base64 encode to avoid invalid Firestore characters
  return btoa(`${ip}-${userAgent}`).replace(/[/+=]/g, '_');
}

/**
 * Persistent Rate Limiter using Firestore
 * Pulls limits from Global System Config
 */
export async function checkPersistentRateLimit(toolId?: string): Promise<{
  allowed: boolean;
  remaining: number;
  limit: number;
  resetTime?: number;
}> {
  try {
    const config = await getSystemConfig();
    const identifier = await getRateLimitIdentifier();

    // Determine the limit: Tool specific > Global Auth > Global Public
    // For simplicity, we use publicRateLimit as default
    let limit = config.publicRateLimit;
    if (toolId && config.toolRateLimits && config.toolRateLimits[toolId]) {
      limit = config.toolRateLimits[toolId];
    }

    if (!adminFirestore) {
      return { allowed: true, remaining: limit, limit };
    }

    const windowMs = 60 * 1000; // 1 minute window
    const now = Date.now();
    const windowStart = now - windowMs;

    const rateLimitDocRef = adminFirestore.collection('rate-limits').doc(identifier);
    const docSnap = await rateLimitDocRef.get();

    let timestamps: admin.firestore.Timestamp[] = [];
    if (docSnap.exists) {
      const data = docSnap.data();
      const allTimestamps: admin.firestore.Timestamp[] = data?.timestamps || [];
      timestamps = allTimestamps.filter(ts => ts.toMillis() > windowStart);
    }

    if (timestamps.length >= limit) {
      const oldestRequest = timestamps.sort((a, b) => a.toMillis() - b.toMillis())[0];
      const resetSeconds = Math.ceil((oldestRequest.toMillis() + windowMs - now) / 1000);
      return {
        allowed: false,
        remaining: 0,
        limit,
        resetTime: resetSeconds
      };
    }

    // Optimistically update (or we could do this after the action)
    const newTimestamp = admin.firestore.Timestamp.fromMillis(now);
    const newTimestamps = [...timestamps, newTimestamp];

    // Fire and forget update
    rateLimitDocRef.set({ timestamps: newTimestamps }, { merge: true }).catch(err => {
      console.error('Rate limit log failed:', err);
    });

    return {
      allowed: true,
      remaining: limit - newTimestamps.length,
      limit
    };
  } catch (error) {
    console.error('Persistent Rate Limit Error:', error);
    return { allowed: true, remaining: 1, limit: 1 }; // Fallback allowed
  }
}

/**
 * In-memory fallback (original logic)
 */
export function checkRateLimit(
  identifier: string,
  limit: number = 30,
  windowMs: number = 60 * 1000
): boolean {
  const now = Date.now();
  const entry = rateLimitStore.get(identifier);

  if (!entry || now > entry.resetTime) {
    rateLimitStore.set(identifier, {
      count: 1,
      resetTime: now + windowMs,
    });
    return true;
  }

  if (entry.count >= limit) {
    return false;
  }

  entry.count++;
  return true;
}

export async function getClientIp(): Promise<string> {
  const headersList = await headers();
  return headersList.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown';
}
