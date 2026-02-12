import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase-admin';

// Bootstrap: emails that are always treated as admin (for initial setup)
const BOOTSTRAP_ADMIN_EMAILS = ['admin@tooldaddy.com'];

export async function POST(request: NextRequest) {
    try {
        // Verify caller is an admin
        const authHeader = request.headers.get('Authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const token = authHeader.split('Bearer ')[1];
        const callerToken = await adminAuth.verifyIdToken(token);

        // Only existing admins or bootstrap emails can set admin claims
        const isCallerAdmin =
            callerToken.admin === true ||
            BOOTSTRAP_ADMIN_EMAILS.includes(callerToken.email || '');

        if (!isCallerAdmin) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const body = await request.json();
        const { uid, email, admin } = body;

        if (!uid && !email) {
            return NextResponse.json(
                { error: 'Provide uid or email of the target user' },
                { status: 400 }
            );
        }

        // Resolve uid from email if needed
        let targetUid = uid;
        if (!targetUid && email) {
            const userRecord = await adminAuth.getUserByEmail(email);
            targetUid = userRecord.uid;
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
