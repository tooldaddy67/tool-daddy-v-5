import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminFirestore } from '@/lib/firebase-admin';
import { deleteUserDataAdmin } from '@/lib/admin-data-service';
import { logAuditEvent } from '@/lib/audit-log';

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
        if (!adminFirestore) return false;
        const userDoc = await adminFirestore.collection('users').doc(uid).get();
        return userDoc.exists && userDoc.data()?.isAdmin === true;
    } catch (e) {
        return false;
    }
}

export async function POST(request: NextRequest) {
    try {
        // 1. Authorization check
        const authHeader = request.headers.get('Authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const token = authHeader.split('Bearer ')[1];
        const decodedToken = await adminAuth.verifyIdToken(token);
        const callerUid = decodedToken.uid;
        const callerEmail = decodedToken.email;

        // Check admin via: custom claim → bootstrap email → Firestore isAdmin field
        const isBootstrap = isAdminByToken(decodedToken);
        const isFirestoreAdmin = await checkFirestoreAdmin(callerUid);

        if (!isBootstrap && !isFirestoreAdmin) {
            return NextResponse.json({
                error: 'Forbidden',
                message: 'Elevated permissions required'
            }, { status: 403 });
        }

        const body = await request.json();
        const { targetUid, action } = body;

        if (!targetUid || !action) {
            return NextResponse.json({ error: 'Missing targetUid or action' }, { status: 400 });
        }

        // Get target user info
        const targetUser = await adminAuth.getUser(targetUid);
        if (BOOTSTRAP_ADMIN_EMAILS.includes(targetUser.email || '')) {
            return NextResponse.json({ error: 'Operation Forbidden: Cannot modify root bootstrap administrators.' }, { status: 403 });
        }

        let message = '';

        switch (action) {
            case 'TERMINATE_ADMIN':
                await adminAuth.setCustomUserClaims(targetUid, { admin: false });
                await adminAuth.revokeRefreshTokens(targetUid);
                message = `Administrative privileges revoked for ${targetUser.email}`;
                break;

            case 'FREEZE_ACCOUNT':
                await adminAuth.updateUser(targetUid, { disabled: true });
                await adminAuth.revokeRefreshTokens(targetUid);
                message = `Account access suspended for ${targetUser.email}`;
                break;

            case 'UNFREEZE_ACCOUNT':
                await adminAuth.updateUser(targetUid, { disabled: false });
                message = `Account access restored for ${targetUser.email}`;
                break;

            case 'BAN_EMAIL':
                if (targetUser.email) {
                    await adminFirestore.collection('banned_emails').doc(targetUser.email).set({
                        reason: 'Banned by Head Admin',
                        timestamp: new Date(),
                        bannedBy: callerUid
                    });
                }
                await adminAuth.updateUser(targetUid, { disabled: true });
                await adminAuth.revokeRefreshTokens(targetUid);
                message = `Email ${targetUser.email} has been permanently blacklisted and account disabled.`;
                break;

            case 'UNBAN_EMAIL':
                if (targetUser.email) {
                    await adminFirestore.collection('banned_emails').doc(targetUser.email).delete();
                }
                await adminAuth.updateUser(targetUid, { disabled: false });
                message = `Email ${targetUser.email} has been removed from blacklist.`;
                break;

            case 'DELETE_DATA':
                // Use the existing utility for full data deletion
                await deleteUserDataAdmin(targetUid);
                // Also delete from Auth
                await adminAuth.deleteUser(targetUid);
                message = `User ${targetUser.email} and all associated data permanently deleted.`;
                break;

            case 'CHANGE_PASSWORD':
                const { newPassword } = body;
                if (!newPassword || newPassword.length < 6) {
                    return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
                }
                await adminAuth.updateUser(targetUid, { password: newPassword });
                await adminAuth.revokeRefreshTokens(targetUid);
                message = `Password updated successfully for ${targetUser.email}. Existing sessions have been terminated for security.`;
                break;

            default:
                return NextResponse.json({ error: 'Invalid action type' }, { status: 400 });
        }

        // 2. Audit Log
        await logAuditEvent({
            userId: callerUid,
            userEmail: callerEmail || 'system@internal',
            action: `HEAD_ADMIN_${action}`,
            target: targetUid,
            status: action === 'DELETE_DATA' ? 'warning' : 'success',
            details: {
                targetEmail: targetUser.email,
                callerEmail,
                timestamp: new Date().toISOString()
            }
        });

        return NextResponse.json({ success: true, message });

    } catch (error: any) {
        console.error('User Management Error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
