'use server';

import { getAdminFirestore } from '@/lib/firebase-admin';
import { headers } from 'next/headers';

// In-memory store for failed admin password attempts (brute-force protection)
const failedAttempts = new Map<string, { count: number; resetTime: number }>();

function getClientIpFromHeaders() {
    // headers() in server actions needs to be called synchronously-ish
    // We'll handle this inline
    return 'server';
}

async function getIp(): Promise<string> {
    const headersList = await headers();
    return headersList.get('x-forwarded-for')?.split(',')[0].trim() || '0.0.0.0';
}

const MAX_ATTEMPTS = 5;
const LOCKOUT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes

export async function verifyAdminPassword(password: string, userId?: string) {
    const ip = await getIp();

    // Brute-force protection: check failed attempts
    const now = Date.now();
    const entry = failedAttempts.get(ip);
    if (entry && now < entry.resetTime && entry.count >= MAX_ATTEMPTS) {
        const waitSec = Math.ceil((entry.resetTime - now) / 1000);
        return { isValid: false, isLocked: true, error: `Too many failed attempts. Try again in ${waitSec} seconds.` };
    }

    const correctPassword = process.env.ADMIN_PASSWORD;

    if (!correctPassword) {
        console.error('ADMIN_PASSWORD environment variable is not set!');
        return { isValid: false, isLocked: false, error: 'Configuration Error: Admin password not set.' };
    }

    // Basic input sanity check
    if (!password || password.length > 200) {
        return { isValid: false, isLocked: false, error: 'Invalid input.' };
    }

    if (password === correctPassword) {
        // Clear failed attempts on success
        failedAttempts.delete(ip);

        if (userId) {
            try {
                const db = getAdminFirestore();
                await db.collection('profiles').doc(userId).set({
                    isAdmin: true,
                    is_admin: true,
                    updatedAt: new Date()
                }, { merge: true });
                console.log(`[AdminAction] Granted admin access to user ${userId}`);
            } catch (error) {
                console.error('[AdminAction] Error granting admin access:', error);
            }
        }
        return { isValid: true, isLocked: false };
    }

    // Record failed attempt
    if (!entry || now >= entry.resetTime) {
        failedAttempts.set(ip, { count: 1, resetTime: now + LOCKOUT_WINDOW_MS });
    } else {
        entry.count++;
    }

    const remaining = MAX_ATTEMPTS - (failedAttempts.get(ip)?.count ?? 0);
    return {
        isValid: false,
        isLocked: false,
        error: remaining > 0
            ? `Incorrect password. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining.`
            : `Too many failed attempts. Try again later.`
    };
}
