import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { checkRateLimit, getClientIp } from '@/lib/rate-limiter';
import { logAuditEvent } from '@/lib/audit-log';
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

        const docRef = adminDb.collection('otp_codes').doc(email);
        const docSnap = await docRef.get();

        if (!docSnap.exists) {
            return NextResponse.json({ error: 'Invalid or expired OTP' }, { status: 400 });
        }

        const data = docSnap.data();

        if (!data) {
            return NextResponse.json({ error: 'Invalid OTP data' }, { status: 500 });
        }

        if (data.otp !== code) {
            return NextResponse.json({ error: 'Invalid OTP' }, { status: 400 });
        }

        if (Date.now() > data.expiresAt) {
            return NextResponse.json({ error: 'OTP has expired' }, { status: 400 });
        }

        // deleting it is safe to prevent replay attacks.
        await docRef.delete();

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
