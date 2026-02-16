'use server';

import { headers } from 'next/headers';
import { getAdminAuth, getAdminDb } from '@/lib/firebase-admin';

export interface HeadAdminAuthResponse {
    isValid: boolean;
    isLocked?: boolean;
    lockedUntil?: number;
    error?: string;
}

const BOOTSTRAP_ADMIN_EMAILS = [
    'admin@tooldaddy.com',
    ...(process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(',') || [])
];

function isAdminByToken(decodedToken: { admin?: boolean; email?: string }): boolean {
    if (decodedToken.admin === true) return true;
    if (decodedToken.email && BOOTSTRAP_ADMIN_EMAILS.includes(decodedToken.email)) return true;
    return false;
}

async function checkFirestoreAdmin(uid: string): Promise<boolean> {
    try {
        const adminDb = getAdminDb();
        const userDoc = await adminDb.collection('users').doc(uid).get();
        return userDoc.exists && userDoc.data()?.isAdmin === true;
    } catch (e) {
        return false;
    }
}

async function getIp() {
    const headerList = await headers();
    const ipHeaders = ['x-forwarded-for', 'x-real-ip', 'cf-connecting-ip', 'x-client-ip', 'true-client-ip'];

    for (const header of ipHeaders) {
        const value = headerList.get(header);
        if (value) {
            const ip = value.split(',')[0].trim();
            if (ip) return ip;
        }
    }

    return '127.0.0.1';
}

export async function verifyHeadAdminPassword(password: string, idToken: string): Promise<HeadAdminAuthResponse> {
    const correctPassword = process.env.HEAD_ADMIN_PASSWORD;
    const ip = await getIp();

    let adminDb;
    let adminAuth;
    try {
        adminDb = getAdminDb();
        adminAuth = getAdminAuth();
    } catch (e) {
        console.error('[HeadAdminAuth] Firebase Admin SDK failed to initialize:', e);
        return { isValid: false, error: 'Database connection failed (Initialization error)' };
    }

    // 1. Verify User is already a normal Admin
    try {
        const decodedToken = await adminAuth.verifyIdToken(idToken);
        const isBootstrap = isAdminByToken(decodedToken);
        const isFirestoreAdmin = await checkFirestoreAdmin(decodedToken.uid);

        if (!isBootstrap && !isFirestoreAdmin) {
            return { isValid: false, error: 'Forbidden: You must be a normal admin first.' };
        }
    } catch (error) {
        return { isValid: false, error: 'Unauthorized: Invalid session.' };
    }

    if (!correctPassword) {
        return { isValid: false, error: 'System configuration error' };
    }

    // 2. Check Lockout
    const lockoutRef = adminDb.collection('head_admin_lockouts').doc(ip);
    const lockoutDoc = await lockoutRef.get();

    if (lockoutDoc.exists) {
        const data = lockoutDoc.data();
        if (data && data.lockedUntil) {
            const now = Date.now();
            let lockedUntil: number = 0;

            const lu = data.lockedUntil;
            if (lu && typeof lu === 'object' && '_seconds' in lu) lockedUntil = lu._seconds * 1000;
            else if (typeof lu?.toMillis === 'function') lockedUntil = lu.toMillis();
            else if (lu instanceof Date) lockedUntil = lu.getTime();
            else lockedUntil = Number(lu);

            if (lockedUntil > now) {
                return { isValid: false, isLocked: true, lockedUntil };
            }
        }
    }

    // 3. Verify Password
    if (password === correctPassword) {
        await lockoutRef.set({ attempts: 0, lockedUntil: 0, lastSuccess: new Date() }, { merge: true });
        return { isValid: true };
    } else {
        const data = lockoutDoc.data();
        let attempts = 1;

        if (lockoutDoc.exists && data) {
            const now = Date.now();
            const lastAttempt = data.lastAttempt?.toMillis?.() || data.lastAttempt?.getTime?.() || 0;
            const isOldAttempt = lastAttempt && (now - lastAttempt > 10 * 60 * 1000);

            if (isOldAttempt) {
                attempts = 1;
            } else {
                attempts = (data.attempts || 0) + 1;
            }
        }

        if (attempts >= 2) {
            const lockedUntil = Date.now() + 1 * 60 * 1000; // 1 minute lockout
            await lockoutRef.set({
                attempts,
                lockedUntil: new Date(lockedUntil),
                lastAttempt: new Date()
            }, { merge: true });
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
