import { NextResponse } from 'next/server';
// Database removed
import { checkRateLimit, getClientIp } from '@/lib/rate-limiter';
import { logAuditEvent } from '@/lib/audit-log';
import { getAdminFirestore } from '@/lib/firebase-admin';
import { z } from 'zod';
import { sanitizeString } from '@/lib/sanitization';

const OtpVerifySchema = z.object({
    email: z.string().email('Invalid email address').trim(),
    code: z.string().length(6, 'Verification code must be 6 digits').regex(/^\d+$/, 'Invalid code format'),
}).strict();

export async function POST(req: Request) {
    try {
        const ip = await getClientIp();
        if (!checkRateLimit(ip, 5, 10 * 60 * 1000)) { // 5 attempts per 10 minutes
            return NextResponse.json({ error: 'Too many attempts. Please try again later.' }, { status: 429 });
        }

        const body = await req.json();
        const validation = OtpVerifySchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json({ error: validation.error.issues[0].message }, { status: 400 });
        }

        const email = sanitizeString(validation.data.email);
        const code = sanitizeString(validation.data.code);

        const db = getAdminFirestore();
        const otpDocRef = db.collection('otps').doc(email);
        const otpDoc = await otpDocRef.get();

        if (!otpDoc.exists) {
            console.warn(`[OTP] No code found for ${email}`);
            return NextResponse.json({ error: 'Verification code not found or expired.' }, { status: 404 });
        }

        const data = otpDoc.data();
        if (!data) {
            return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
        }

        // Check expiry
        const expiresAt = data.expiresAt.toDate ? data.expiresAt.toDate() : new Date(data.expiresAt);
        if (expiresAt < new Date()) {
            console.log(`[OTP] Code expired for ${email}`);
            await otpDocRef.delete();
            return NextResponse.json({ error: 'Verification code expired.' }, { status: 400 });
        }

        // Brute-force protection (max 5 attempts)
        if (data.attempts >= 5) {
            console.warn(`[OTP] Max attempts reached for ${email}`);
            return NextResponse.json({ error: 'Too many failed attempts. Please request a new code.' }, { status: 429 });
        }

        // Verify code
        if (data.code !== code) {
            console.log(`[OTP] Invalid code attempt for ${email}`);
            await otpDocRef.update({
                attempts: (data.attempts || 0) + 1
            });
            return NextResponse.json({ error: 'Invalid verification code.' }, { status: 400 });
        }

        console.log(`[OTP] Successfully verified code for ${email}`);

        // Success! Remove the OTP document so it can't be reused
        await otpDocRef.delete();

        // Log the activity
        await logAuditEvent({
            userId: 'anonymous',
            action: 'AUTH_OTP_VERIFIED',
            userEmail: email,
            target: 'AUTH_GATE',
            status: 'success'
        });

        return NextResponse.json({ message: 'OTP verified successfully' });
    } catch (error: any) {
        console.error('Error verifying OTP:', error);
        return NextResponse.json({ error: error.message || 'Failed to verify OTP' }, { status: 500 });
    }
}
