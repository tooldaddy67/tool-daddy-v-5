'use server';

import { headers } from 'next/headers';
import admin from 'firebase-admin';
import { getAdminDb } from '@/lib/firebase-admin';

export interface AdminAuthResponse {
    isValid: boolean;
    isLocked?: boolean;
    lockedUntil?: number;
    error?: string;
}

// In-memory cache for IP lockout status to avoid slow Firestore reads on every page load
// This persists across requests on the same server instance (warm lambdas)
interface CacheEntry {
    response: AdminAuthResponse;
    timestamp: number;
}
// Use global to persist across HMR in development
const globalForLockout = global as unknown as { lockoutCache: Record<string, CacheEntry> };
const lockoutCache = globalForLockout.lockoutCache || (globalForLockout.lockoutCache = {});
const CACHE_TTL = 300000; // 5 minutes (300,000 ms)

async function getIp() {
    try {
        const headerList = await headers();

        // Log headers to debug IP detection (redacted)
        const ipHeaders = ['x-forwarded-for', 'x-real-ip', 'cf-connecting-ip', 'x-client-ip', 'true-client-ip'];
        console.log('[AdminAuth] Header Scan:', ipHeaders.map(h => `${h}: ${headerList.get(h) ? '[SET]' : '[MISSING]'}`).join(', '));

        for (const header of ipHeaders) {
            const value = headerList.get(header);
            if (value) {
                const ip = value.split(',')[0].trim();
                if (ip) return ip;
            }
        }
    } catch (e) {
        // Fallback for non-Next.js environment (testing)
        return '127.0.0.1';
    }

    return '127.0.0.1';
}

export async function verifyAdminPassword(password: string): Promise<AdminAuthResponse> {
    let correctPassword = process.env.ADMIN_PASSWORD?.trim();
    if (correctPassword?.startsWith('"') && correctPassword.endsWith('"')) correctPassword = correctPassword.slice(1, -1);
    if (correctPassword?.startsWith("'") && correctPassword.endsWith("'")) correctPassword = correctPassword.slice(1, -1);

    const ip = await getIp();
    const trimmedInput = password.trim();

    console.log(`[AdminAuth] >>> VERIFY ATTEMPT from IP: [${ip}]`);
    console.log(`[AdminAuth] DEBUG - env check: PROJECT_ID=${!!process.env.FIREBASE_PROJECT_ID}, ADMIN_PW=${!!correctPassword}`);

    let adminDb;
    try {
        adminDb = getAdminDb();
    } catch (e: any) {
        console.error('[AdminAuth] Firebase Admin SDK failed to initialize:', e);
        return { isValid: false, error: `Database connection failed (Admin.ts Init error: ${e.message || 'Unknown'})` };
    }

    if (!correctPassword) {
        console.error('[AdminAuth] ADMIN_PASSWORD environment variable is not set!');
        return { isValid: false, error: 'System configuration error' };
    }

    const lockoutRef = adminDb.collection('admin_lockouts').doc(ip);
    const lockoutDoc = await lockoutRef.get();

    if (lockoutDoc.exists) {
        const data = lockoutDoc.data();
        if (data && data.lockedUntil) {
            const now = Date.now();
            let lockedUntil: number = 0;

            try {
                const lu = data.lockedUntil;
                if (lu && typeof lu === 'object' && '_seconds' in lu) lockedUntil = lu._seconds * 1000;
                else if (typeof lu?.toMillis === 'function') lockedUntil = lu.toMillis();
                else if (lu instanceof Date) lockedUntil = lu.getTime();
                else if (lu && typeof lu === 'object' && 'getTime' in lu) lockedUntil = (lu as any).getTime();
                else lockedUntil = Number(lu);
            } catch (e) {
                lockedUntil = 0;
            }

            if (lockedUntil > now) {
                console.log(`[AdminAuth] IP [${ip}] is ALREADY LOCKED until ${new Date(lockedUntil).toISOString()}`);
                return { isValid: false, isLocked: true, lockedUntil };
            }
        }
    }

    if (trimmedInput === correctPassword) {
        console.log(`[AdminAuth] IP [${ip}] - SUCCESS`);
        await lockoutRef.set({ attempts: 0, lockedUntil: 0, lastSuccess: new Date() }, { merge: true });
        return { isValid: true };
    } else {
        const data = lockoutDoc.data();
        let attempts = 1;

        if (lockoutDoc.exists && data) {
            const now = Date.now();
            let lockedUntil: number = 0;
            const lastAttempt = data.lastAttempt?.toMillis?.() || data.lastAttempt?.getTime?.() || 0;

            try {
                const lu = data.lockedUntil;
                if (lu && typeof lu === 'object' && '_seconds' in lu) lockedUntil = lu._seconds * 1000;
                else if (typeof lu?.toMillis === 'function') lockedUntil = lu.toMillis();
                else if (lu instanceof Date) lockedUntil = lu.getTime();
                else lockedUntil = Number(lu);
            } catch (e) {
                lockedUntil = 0;
            }

            // RESET LOGIC: 
            // 1. If we were locked and the time has passed, start fresh.
            // 2. OR if it's been more than 30 minutes since the last failed attempt, start fresh.
            const isOldAttempt = lastAttempt && (now - lastAttempt > 30 * 60 * 1000);

            if ((lockedUntil > 0 && now > lockedUntil) || isOldAttempt) {
                console.log(`[AdminAuth] IP [${ip}] - Resetting attempts (Lock expired or 30m idle). previous: ${data.attempts}`);
                attempts = 1;
            } else {
                attempts = (data.attempts || 0) + 1;
            }
        }

        console.log(`[AdminAuth] IP [${ip}] - FAILED attempt #${attempts}`);

        if (attempts >= 4) {
            const lockedUntil = Date.now() + 3 * 60 * 1000;
            await lockoutRef.set({
                attempts,
                lockedUntil: new Date(lockedUntil),
                lastAttempt: new Date()
            }, { merge: true });
            console.log(`[AdminAuth] IP [${ip}] - LOCKING for 3 minutes. (Until: ${new Date(lockedUntil).toISOString()})`);
            return { isValid: false, isLocked: true, lockedUntil };
        } else {
            await lockoutRef.set({
                attempts,
                lastAttempt: new Date()
            }, { merge: true });
            return { isValid: false };
        }
    }
}

export async function checkIpLockout(): Promise<AdminAuthResponse> {
    const start = Date.now();
    try {
        const ip = await getIp();
        const now = Date.now();

        // Check cache first
        const cached = lockoutCache[ip];
        if (cached && (now - cached.timestamp < CACHE_TTL)) {
            console.log(`[AdminAuth] Cache HIT for IP: [${ip}] (valid for ${Math.round((CACHE_TTL - (now - cached.timestamp)) / 1000)}s)`);
            return cached.response;
        }

        const ipTaken = Date.now();

        const adminDb = getAdminDb();
        const dbInit = Date.now();

        if (!adminDb) return { isValid: false, isLocked: false, lockedUntil: 0 };

        const lockoutRef = adminDb.collection('admin_lockouts').doc(ip);

        // CRITICAL PERFORMANCE FIX: Implement a hard timeout for the DB fetch
        // If Firestore is slow or unreachable, we don't want to block the entire site for 8s.
        const dbFetchPromise = lockoutRef.get();
        const timeoutPromise = new Promise<null>((_, reject) =>
            setTimeout(() => reject(new Error('DATABASE_TIMEOUT')), 1500)
        );

        const lockoutDoc = await Promise.race([dbFetchPromise, timeoutPromise]) as admin.firestore.DocumentSnapshot;
        const docFetched = Date.now();

        console.log(`[AdminAuth] Performance: IP=${ipTaken - start}ms, DB_INIT=${dbInit - ipTaken}ms, FETCH=${docFetched - dbInit}ms, TOTAL=${Date.now() - start}ms`);

        let result: AdminAuthResponse = { isValid: false, isLocked: false };

        if (lockoutDoc.exists) {
            const data = lockoutDoc.data();
            if (data) {
                let lockedUntil: number = 0;

                try {
                    const lu = data.lockedUntil;
                    if (lu && typeof lu === 'object' && '_seconds' in lu) lockedUntil = lu._seconds * 1000;
                    else if (typeof lu?.toMillis === 'function') lockedUntil = lu.toMillis();
                    else if (lu instanceof Date) lockedUntil = lu.getTime();
                    else if (lu && typeof lu === 'object' && 'getTime' in lu) lockedUntil = (lu as any).getTime();
                    else lockedUntil = Number(lu);
                } catch (e) {
                    lockedUntil = 0;
                }

                if (lockedUntil > now) {
                    const redactedIp = ip === '127.0.0.1' ? ip : `${ip.split('.')[0]}.X.X.X`;
                    console.log(`[AdminAuth] >>> BLOCKING SITE for IP: [${redactedIp}] until ${new Date(lockedUntil).toISOString()}`);
                    result = { isValid: false, isLocked: true, lockedUntil };
                } else if (data.attempts >= 4 && !lockedUntil) {
                    // Secondary safety check
                    const lastAttempt = data.lastAttempt?.toMillis?.() || data.lastAttempt?.getTime?.() || 0;
                    const isRecentFailure = lastAttempt && (now - lastAttempt < 30 * 60 * 1000);
                    if (isRecentFailure) {
                        const newLockedUntil = Date.now() + 3 * 60 * 1000;
                        await lockoutRef.set({ lockedUntil: new Date(newLockedUntil) }, { merge: true });
                        result = { isValid: false, isLocked: true, lockedUntil: newLockedUntil };
                    }
                }
            }
        }

        // Update cache
        lockoutCache[ip] = {
            response: result,
            timestamp: Date.now()
        };

        return result;
    } catch (error: any) {
        console.error('[AdminAuth] Error in checkIpLockout:', error);

        // CRITICAL PERFORMANCE FIX: Cache the failure!
        // If we hit a timeout or credential error, we MUST cache 'not locked' for the next 60s
        // otherwise every single request will wait 8 seconds for a failing connection.
        const errorResponse: AdminAuthResponse = { isValid: false, isLocked: false };

        try {
            // We need the IP again since the previous attempt might have failed early
            const headerList = await headers();
            let ip = '127.0.0.1';
            const ipHeaders = ['x-forwarded-for', 'x-real-ip', 'cf-connecting-ip', 'x-client-ip', 'true-client-ip'];
            for (const header of ipHeaders) {
                const value = headerList.get(header);
                if (value) {
                    ip = value.split(',')[0].trim();
                    break;
                }
            }

            lockoutCache[ip] = {
                response: errorResponse,
                timestamp: Date.now()
            };
            console.log(`[AdminAuth] Cached FAILURE response for IP: [${ip}] to prevent performance degradation.`);
        } catch (ipError) {
            // If even headers fail, we use a generic 'local' key
            lockoutCache['error-fallback'] = {
                response: errorResponse,
                timestamp: Date.now()
            };
        }

        return errorResponse;
    }
}
