import { headers } from 'next/headers';

/**
 * Simple in-memory rate limiter for server-side protection
 * Tracks requests by IP address
 * 
 * For production with multiple instances, use Redis or Upstash instead
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const globalStore = global as unknown as { _rateLimitStore?: Map<string, RateLimitEntry> };
const rateLimitStore = globalStore._rateLimitStore || new Map<string, RateLimitEntry>();
if (process.env.NODE_ENV !== 'production') globalStore._rateLimitStore = rateLimitStore;

// Cleanup old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

/**
 * Check if a request should be rate limited
 * @param identifier - Usually IP address or user ID
 * @param limit - Max requests allowed
 * @param windowMs - Time window in milliseconds
 * @returns true if request is allowed, false if rate limited
 */
export function checkRateLimit(
  identifier: string,
  limit: number = 30,
  windowMs: number = 60 * 1000 // 1 minute
): boolean {
  const now = Date.now();
  const entry = rateLimitStore.get(identifier);

  if (!entry || now > entry.resetTime) {
    // Create new entry or reset expired one
    rateLimitStore.set(identifier, {
      count: 1,
      resetTime: now + windowMs,
    });
    return true;
  }

  // Check if limit exceeded
  if (entry.count >= limit) {
    return false;
  }

  // Increment counter
  entry.count++;
  return true;
}

/**
 * Get client IP from request headers
 * Works behind proxies (Vercel, Firebase, etc.)
 */
export async function getClientIp(): Promise<string> {
  const headersList = await headers();

  // Check various header sources in order of reliability
  const forwarded = headersList.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  const realIp = headersList.get('x-real-ip');
  if (realIp) {
    return realIp;
  }

  const clientIp = headersList.get('x-client-ip');
  if (clientIp) {
    return clientIp;
  }

  // Fallback (shouldn't happen in production)
  return 'unknown';
}

/**
 * Middleware function to enforce rate limiting on API routes
 * Use this in your API route handlers
 * 
 * Example:
 * ```typescript
 * import { checkRateLimit, getClientIp } from '@/lib/rate-limiter';
 * 
 * export async function POST(request: Request) {
 *   const ip = await getClientIp();
 *   if (!checkRateLimit(ip, 10, 60 * 1000)) { // 10 requests per minute
 *     return NextResponse.json(
 *       { error: 'Too many requests' },
 *       { status: 429 }
 *     );
 *   }
 *   // Your handler logic...
 * }
 * ```
 */
export function createRateLimitChecker(limit: number = 30, windowMs: number = 60 * 1000) {
  return async () => {
    const ip = await getClientIp();
    return checkRateLimit(ip, limit, windowMs);
  };
}
