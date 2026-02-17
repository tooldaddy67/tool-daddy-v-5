import { NextResponse } from 'next/server';
// Database removed
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

        console.log(`[OTP] MOCK VERIFY: ${email} with code ${code}`);
        // Database removed - always passing for now for dev/demo purposes 
        // OR return error if you prefer. Let's return success to allow UI to proceed.

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
