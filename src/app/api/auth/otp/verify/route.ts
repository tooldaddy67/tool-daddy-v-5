import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { checkRateLimit, getClientIp } from '@/lib/rate-limiter';

export async function POST(req: Request) {
    try {
        const ip = await getClientIp();
        if (!checkRateLimit(ip, 5, 10 * 60 * 1000)) { // 5 attempts per 10 minutes
            return NextResponse.json({ error: 'Too many attempts. Please try again later.' }, { status: 429 });
        }

        const { email, code } = await req.json();

        if (!email || !code) {
            return NextResponse.json({ error: 'Email and code are required' }, { status: 400 });
        }

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

        // OTP is valid. Ideally, we should delete it now to prevent reuse,
        // OR mark it as verified if we need to do a multi-step process.
        // Since the client will immediately create the user after this success response,
        // deleting it is safe to prevent replay attacks.
        await docRef.delete();

        return NextResponse.json({ message: 'OTP verified successfully' });
    } catch (error: any) {
        console.error('Error verifying OTP:', error);
        return NextResponse.json({ error: error.message || 'Failed to verify OTP' }, { status: 500 });
    }
}
