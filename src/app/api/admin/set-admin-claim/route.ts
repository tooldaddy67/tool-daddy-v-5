import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase-admin';
import { z } from 'zod';
import { sanitizeString } from '@/lib/sanitization';

const SetAdminClaimSchema = z.object({
    uid: z.string().max(128).optional(),
    email: z.string().email().optional(),
    admin: z.boolean().optional(),
}).strict().refine(data => data.uid || data.email, {
    message: "Either uid or email must be provided"
});

const BOOTSTRAP_ADMIN_EMAILS = [
    'admin@tooldaddy.com',
    ...(process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(',') || [])
];

async function checkFirestoreAdmin(uid: string): Promise<boolean> {
    try {
        const { adminFirestore } = await import('@/lib/firebase-admin');
        if (!adminFirestore) return false;
        const userDoc = await adminFirestore.collection('users').doc(uid).get();
        return userDoc.exists && userDoc.data()?.isAdmin === true;
    } catch (e) {
        return false;
    }
}

export async function POST(request: NextRequest) {
    try {
        console.log('SetAdminClaim API: Start request');
        // Verify caller is an admin
        const authHeader = request.headers.get('Authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const token = authHeader.split('Bearer ')[1];
        const callerToken = await adminAuth.verifyIdToken(token);
        const callerUid = callerToken.uid;
        const callerEmail = callerToken.email;

        console.log(`SetAdminClaim API: Checking authorization for caller UID: ${callerUid}, Email: ${callerEmail}`);

        // Only existing admins or bootstrap emails or Firestore admins can set admin claims
        const isBootstrap = callerToken.admin === true || BOOTSTRAP_ADMIN_EMAILS.includes(callerEmail || '');
        const isFirestoreAdmin = await checkFirestoreAdmin(callerUid);

        if (!isBootstrap && !isFirestoreAdmin) {
            console.warn(`Access Denied: Caller UID ${callerUid} (${callerEmail}) is not authorized to set claims.`);
            return NextResponse.json({
                error: 'Forbidden',
                message: 'Only super admins can modify custom claims.',
                debug: { callerUid, callerEmail }
            }, { status: 403 });
        }

        const body = await request.json();
        const validation = SetAdminClaimSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json({ error: validation.error.issues[0].message }, { status: 400 });
        }

        const { uid, email, admin } = validation.data;

        // Resolve uid from email if needed
        let targetUid = uid;
        if (!targetUid && email) {
            const userRecord = await adminAuth.getUserByEmail(email);
            targetUid = userRecord.uid;
        }

        if (!targetUid) {
            return NextResponse.json({ error: 'Failed to resolve user ID' }, { status: 400 });
        }

        // Set or remove admin claim
        const isAdmin = admin !== false; // default: true
        await adminAuth.setCustomUserClaims(targetUid, { admin: isAdmin });

        // Force token refresh for the target user
        await adminAuth.revokeRefreshTokens(targetUid);

        return NextResponse.json({
            success: true,
            uid: targetUid,
            admin: isAdmin,
            message: isAdmin
                ? 'Admin claim set. User must re-login.'
                : 'Admin claim removed. User must re-login.',
        });
    } catch (error: any) {
        console.error('Error setting admin claim:', error);
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
