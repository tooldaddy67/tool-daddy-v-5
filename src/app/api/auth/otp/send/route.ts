import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { sendEmail } from '@/lib/send-email';
import { checkRateLimit, getClientIp } from '@/lib/rate-limiter';

export async function POST(req: Request) {
  try {
    const ip = await getClientIp();
    if (!checkRateLimit(ip, 3, 10 * 60 * 1000)) { // 3 requests per 10 minutes
      return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 });
    }

    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes from now

    // Store OTP in Firestore (using Admin SDK for secure backend access)
    // We'll use a collection 'otp_codes' and document ID as email (or a unique ID if we want to support multiple requests, but email is simpler for now to rate limit/overwrite)
    // Using email as doc ID allows easy lookup and replacement of old codes.
    await adminDb.collection('otp_codes').doc(email).set({
      otp,
      expiresAt,
      createdAt: Date.now(),
    });

    // Send email
    const subject = 'Your Verification Code - Tool Daddy';
    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Verify your email address</h2>
        <p>Thanks for starting the signup process for Tool Daddy. We want to make sure it's really you.</p>
        <p>Please enter the following verification code when prompted. If you don't want to create an account, you can ignore this message.</p>
        <div style="background-color: #f4f4f4; padding: 20px; text-align: center; border-radius: 5px; margin: 20px 0;">
          <h1 style="margin: 0; letter-spacing: 5px; color: #333;">${otp}</h1>
        </div>
        <p>This code will expire in 10 minutes.</p>
      </div>
    `;

    await sendEmail(email, subject, html);

    return NextResponse.json({ message: 'OTP sent successfully' });
  } catch (error: any) {
    console.error('Error sending OTP:', error);
    return NextResponse.json({ error: error.message || 'Failed to send OTP' }, { status: 500 });
  }
}
