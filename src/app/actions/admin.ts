'use server';

import { headers } from 'next/headers';
import { getAdminDb } from '@/lib/firebase-admin';

export interface AdminAuthResponse {
    isValid: boolean;
    isLocked?: boolean;
    lockedUntil?: number;
    error?: string;
}

async function getIp() {
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

    return '127.0.0.1';
}

export async function verifyAdminPassword(password: string): Promise<AdminAuthResponse> {
    const correctPassword = process.env.ADMIN_PASSWORD;
    const ip = await getIp();

    console.log(`[AdminAuth] >>> VERIFY ATTEMPT from IP: [${ip}]`);
    console.log(`[AdminAuth] DEBUG - env check: PROJECT_ID=${!!process.env.FIREBASE_PROJECT_ID}, CLIENT_EMAIL=${!!process.env.FIREBASE_CLIENT_EMAIL}, PRIVATE_KEY=${!!process.env.FIREBASE_PRIVATE_KEY}, SERVICE_KEY=${!!process.env.FIREBASE_SERVICE_ACCOUNT_KEY}, ADMIN_PW=${!!correctPassword}`);

    let adminDb;
    try {
        adminDb = getAdminDb();
    } catch (e) {
        console.error('[AdminAuth] Firebase Admin SDK failed to initialize:', e);
        return { isValid: false, error: 'Database connection failed (Initialization error)' };
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

    if (password === correctPassword) {
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
    try {
        const ip = await getIp();

        const adminDb = getAdminDb();
        if (!adminDb) return { isValid: false, isLocked: false, lockedUntil: 0 };

        const lockoutRef = adminDb.collection('admin_lockouts').doc(ip);
        const lockoutDoc = await lockoutRef.get();

        if (lockoutDoc.exists) {
            const data = lockoutDoc.data();
            if (data) {
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
                    // Redact IP in production logs but show first segment for debugging
                    const redactedIp = ip === '127.0.0.1' ? ip : `${ip.split('.')[0]}.X.X.X`;
                    console.log(`[AdminAuth] >>> BLOCKING SITE for IP: [${redactedIp}] until ${new Date(lockedUntil).toISOString()}`);
                    return { isValid: false, isLocked: true, lockedUntil };
                }

                // Secondary safety: if attempts are huge but no lockedUntil, 
                // lock them anyway ONLY if the last attempt was recent (within 30 mins)
                const lastAttempt = data.lastAttempt?.toMillis?.() || data.lastAttempt?.getTime?.() || 0;
                const isRecentFailure = lastAttempt && (now - lastAttempt < 30 * 60 * 1000);

                if (data.attempts >= 4 && !lockedUntil && isRecentFailure) {
                    const newLockedUntil = Date.now() + 3 * 60 * 1000;
                    await lockoutRef.set({ lockedUntil: new Date(newLockedUntil) }, { merge: true });
                    return { isValid: false, isLocked: true, lockedUntil: newLockedUntil };
                }
            }
        }

        return { isValid: false, isLocked: false };
    } catch (error) {
        console.error('[AdminAuth] Error in checkIpLockout:', error);
        return { isValid: false, isLocked: false };
    }
}
