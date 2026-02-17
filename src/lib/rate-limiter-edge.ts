/**
 * EDGE COMPATIBLE RATE LIMITER
 * This file is strictly for use in Middleware/Proxy (Edge Runtime).
 * It MUST NOT import firebase-admin or any Node.js native modules.
 */

interface RateLimitEntry {
    count: number;
    resetTime: number;
}

// In-memory store for the current Edge instance
const rateLimitStore = new Map<string, RateLimitEntry>();

export function checkRateLimitEdge(
    identifier: string,
    limit: number = 30,
    windowMs: number = 60 * 1000
): boolean {
    const now = Date.now();
    const entry = rateLimitStore.get(identifier);

    // Clear expired entry
    if (entry && now > entry.resetTime) {
        rateLimitStore.delete(identifier);
    }

    const currentEntry = rateLimitStore.get(identifier);

    if (!currentEntry) {
        rateLimitStore.set(identifier, {
            count: 1,
            resetTime: now + windowMs,
        });
        return true;
    }

    if (currentEntry.count >= limit) {
        return false;
    }

    currentEntry.count++;
    return true;
}
