import { headers } from 'next/headers';

/**
 * Simplified in-memory rate limiting for Tool Daddy. 
 * Database persistence removed.
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const globalStore = global as unknown as { _rateLimitStore?: Map<string, RateLimitEntry> };
const rateLimitStore = globalStore._rateLimitStore || new Map<string, RateLimitEntry>();
if (process.env.NODE_ENV !== 'production') globalStore._rateLimitStore = rateLimitStore;

// Cleanup old entries every 5 minutes
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

export async function getRateLimitIdentifier(): Promise<string> {
  const headersList = await headers();
  const ip = headersList.get('x-forwarded-for')?.split(',')[0].trim() || '0.0.0.0';
  const userAgent = headersList.get('user-agent') || 'unknown';
  return btoa(`${ip}-${userAgent}`).replace(/[/+=]/g, '_');
}

/**
 * Simple rate limiter that replaces the previous Firestore-backed version.
 * Now operates strictly in-memory.
 */
export async function checkPersistentRateLimit(toolId?: string): Promise<{
  allowed: boolean;
  remaining: number;
  limit: number;
  resetTime?: number;
}> {
  const identifier = await getRateLimitIdentifier();

  // Hardcoded default limits since system-config is gone
  const DEFAULT_LIMIT = 30;
  const limits: Record<string, number> = {
    'ai-text-humanizer': 5,
    'ai-image-enhancer': 2
  };

  const limit = (toolId && limits[toolId]) || DEFAULT_LIMIT;
  const now = Date.now();
  const windowMs = 60 * 1000;

  const entry = rateLimitStore.get(identifier);

  if (!entry || now > entry.resetTime) {
    const newEntry = {
      count: 1,
      resetTime: now + windowMs,
    };
    rateLimitStore.set(identifier, newEntry);
    return { allowed: true, remaining: limit - 1, limit };
  }

  if (entry.count >= limit) {
    const resetSeconds = Math.ceil((entry.resetTime - now) / 1000);
    return {
      allowed: false,
      remaining: 0,
      limit,
      resetTime: resetSeconds
    };
  }

  entry.count++;
  return {
    allowed: true,
    remaining: limit - entry.count,
    limit
  };
}

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
