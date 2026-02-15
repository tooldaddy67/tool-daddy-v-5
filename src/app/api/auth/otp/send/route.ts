import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { sendEmail } from '@/lib/send-email';
import { checkRateLimit, getClientIp } from '@/lib/rate-limiter';
import { logAuditEvent } from '@/lib/audit-log';

export async function POST(req: Request) {
  try {
    console.log('[OTP] Starting OTP send process...');
    console.log('[OTP] SMTP Config:', {
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      user: process.env.SMTP_USER ? 'SET' : 'NOT SET',
      pass: process.env.SMTP_PASS ? 'SET' : 'NOT SET',
    });

    const ip = await getClientIp();
    if (!checkRateLimit(ip, 10, 10 * 60 * 1000)) { // 10 requests per 10 minutes (increased for testing)
      return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 });
    }

    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    console.log('[OTP] Generating OTP for:', email);

    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes from now

    console.log('[OTP] Storing OTP in Firestore...');
    // Store OTP in Firestore (using Admin SDK for secure backend access)
    // We'll use a collection 'otp_codes' and document ID as email (or a unique ID if we want to support multiple requests, but email is simpler for now to rate limit/overwrite)
    // Using email as doc ID allows easy lookup and replacement of old codes.
    await adminDb.collection('otp_codes').doc(email).set({
      otp,
      expiresAt,
      createdAt: Date.now(),
    });

    console.log('[OTP] OTP stored successfully. Sending email...');

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

    // Log the event
    await logAuditEvent({
      userId: 'anonymous',
      action: 'AUTH_OTP_REQUESTED',
      userEmail: email,
      target: 'AUTH_GATE',
      status: 'success'
    });

    console.log('[OTP] Email sent successfully!');

    return NextResponse.json({ message: 'OTP sent successfully' });
  } catch (error: any) {
    console.error('[OTP] Error sending OTP:', error);
    console.error('[OTP] Error details:', {
      message: error.message,
      code: error.code,
      stack: error.stack,
    });
    return NextResponse.json({ error: error.message || 'Failed to send OTP' }, { status: 500 });
  }
}
