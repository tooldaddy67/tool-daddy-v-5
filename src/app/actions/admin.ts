'use server';

import { headers } from 'next/headers';
import { adminDb } from '@/lib/firebase-admin';

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

    if (!adminDb) {
        console.error('[AdminAuth] Firebase Admin DB not initialized!');
        return { isValid: false, error: 'Database connection error' };
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
        let attempts = 1;
        if (lockoutDoc.exists) {
            attempts = (lockoutDoc.data()?.attempts || 0) + 1;
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
    const ip = await getIp();

    if (!adminDb) return { isValid: false, isLocked: false };

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
                console.log(`[AdminAuth] >>> BLOCKING SITE for IP: [${ip}] until ${new Date(lockedUntil).toISOString()}`);
                return { isValid: false, isLocked: true, lockedUntil };
            }

            // Secondary safety: if attempts are huge but no lockedUntil, lock them anyway
            if (data.attempts >= 4 && !lockedUntil) {
                const newLockedUntil = Date.now() + 3 * 60 * 1000;
                await lockoutRef.set({ lockedUntil: new Date(newLockedUntil) }, { merge: true });
                return { isValid: false, isLocked: true, lockedUntil: newLockedUntil };
            }
        }
    }

    return { isValid: false, isLocked: false };
}
