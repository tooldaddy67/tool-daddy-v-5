import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminFirestore } from '@/lib/firebase-admin';
import { checkRateLimit, getClientIp } from '@/lib/rate-limiter';

// Bootstrap admin emails — used before custom claims are set up
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
        console.error(`Admin check failed for UID ${uid}:`, e);
        return false;
    }
}

export async function GET(request: NextRequest) {
    try {
        console.log('Analytics API: Start request');
        // Rate limit: 10 requests per minute
        const ip = await getClientIp();
        if (!checkRateLimit(`analytics:${ip}`, 10, 60 * 1000)) {
            return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
        }
        // Verify the Authorization token
        const authHeader = request.headers.get('Authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const token = authHeader.split('Bearer ')[1];
        const decodedToken = await adminAuth.verifyIdToken(token);
        const uid = decodedToken.uid;
        const email = decodedToken.email;

        console.log(`Analytics API: Checking admin status for UID: ${uid}, Email: ${email}`);

        // Check admin via: custom claim → bootstrap email → Firestore isAdmin field
        const isBootstrap = isAdminByToken(decodedToken);
        const isFirestoreAdmin = await checkFirestoreAdmin(uid);

        if (!isBootstrap && !isFirestoreAdmin) {
            console.warn(`Access Denied: UID ${uid} (${email}) is not an admin.`);
            return NextResponse.json({
                error: 'Forbidden',
                message: 'You do not have administrative privileges.',
                debug: { uid, email }
            }, { status: 403 });
        }

        console.log(`Access Granted: UID ${uid} (Bootstrap: ${isBootstrap}, Firestore: ${isFirestoreAdmin})`);

        // --- Aggregate Analytics Data ---

        // 1. Total Users (from Firebase Auth)
        let totalUsers = 0;
        try {
            // listUsers is paginated, get first page for count
            const listResult = await adminAuth.listUsers(1000);
            totalUsers = listResult.users.length;
        } catch (e) {
            console.error('Error listing users:', e);
        }

        // 2. Total feedback items
        let totalFeedback = 0;
        try {
            const feedbackSnapshot = await adminFirestore.collection('feedback').count().get();
            totalFeedback = feedbackSnapshot.data().count;
        } catch (e) {
            console.error('Error counting feedback:', e);
        }

        // 3. Recent tool usage (last 7 days) — aggregate from all users' history
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const toolUsageMap: Record<string, number> = {};
        const dailyActivityMap: Record<string, Set<string>> = {};
        let totalExecutions = 0;

        try {
            // Aggregate from all users' history using collectionGroup
            const historySnapshot = await adminFirestore
                .collectionGroup('history')
                .where('timestamp', '>=', sevenDaysAgo)
                .orderBy('timestamp', 'desc')
                .limit(2000) // Limit to a reasonable amount for aggregation
                .get();

            historySnapshot.docs.forEach((doc) => {
                const data = doc.data();
                const toolName = data.tool || 'Unknown';
                const timestamp = data.timestamp?.toDate?.() || new Date();
                const dayKey = timestamp.toISOString().split('T')[0]; // YYYY-MM-DD
                const userId = doc.ref.parent.parent?.id; // Ancestor of the subcollection item

                // Count tool usage
                toolUsageMap[toolName] = (toolUsageMap[toolName] || 0) + 1;
                totalExecutions++;

                // Track daily unique users
                if (userId) {
                    if (!dailyActivityMap[dayKey]) {
                        dailyActivityMap[dayKey] = new Set();
                    }
                    dailyActivityMap[dayKey].add(userId);
                }
            });
        } catch (e) {
            console.error('Error aggregating history via collectionGroup:', e);
            // Fallback: If collectionGroup fails (e.g. index not yet created), we might need to notify admin
        }

        // 4. Format top tools (sorted by usage, top 8)
        const topTools = Object.entries(toolUsageMap)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 8)
            .map(([name, usage]) => ({ name, usage }));

        // 5. Format daily activity (last 7 days)
        const dailyActivity: { name: string; active: number }[] = [];
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateKey = date.toISOString().split('T')[0];
            const dayName = dayNames[date.getDay()];

            dailyActivity.push({
                name: dayName,
                active: dailyActivityMap[dateKey]?.size || 0,
            });
        }

        // 6. User growth (mock a monthly trend — can expand later with real signup dates)
        const userGrowth: { name: string; users: number }[] = [];
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const currentMonth = new Date().getMonth();

        // Simple estimated growth curve based on total users
        for (let i = 6; i >= 0; i--) {
            const monthIndex = (currentMonth - i + 12) % 12;
            // Estimate growth as fraction of total (exponential-ish)
            const fraction = Math.pow((7 - i) / 7, 1.5);
            userGrowth.push({
                name: monthNames[monthIndex],
                users: Math.round(totalUsers * fraction),
            });
        }

        return NextResponse.json({
            totalUsers,
            totalFeedback,
            totalExecutions,
            activeTools: topTools.length || Object.keys(toolUsageMap).length,
            topTools,
            dailyActivity,
            userGrowth,
        });
    } catch (error: any) {
        console.error('Analytics API error:', error);
        if (error.code === 'auth/id-token-expired') {
            return NextResponse.json({ error: 'Token expired' }, { status: 401 });
        }
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
