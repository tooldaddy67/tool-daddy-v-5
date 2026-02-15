import { NextRequest, NextResponse } from 'next/server';
import { adminFirestore, adminAuth } from '@/lib/firebase-admin';

const BOOTSTRAP_ADMIN_EMAILS = [
    'admin@tooldaddy.com',
    ...(process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(',') || [])
];

function isAdminByToken(decodedToken: { admin?: boolean; email?: string }): boolean {
    if (decodedToken.admin === true) return true;
    if (decodedToken.email && BOOTSTRAP_ADMIN_EMAILS.includes(decodedToken.email)) return true;
    return false;
}

export async function GET(request: NextRequest) {
    try {
        // 1. Authorization check
        const authHeader = request.headers.get('Authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const token = authHeader.split('Bearer ')[1];
        const decodedToken = await adminAuth.verifyIdToken(token);

        if (!isAdminByToken(decodedToken)) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const now = new Date();
        const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);

        // 2. Fetch Audit Logs for Analytics
        const logsSnapshot = await adminFirestore.collection('audit_logs')
            .where('timestamp', '>=', last24h)
            .get();

        const logs = logsSnapshot.docs.map(doc => doc.data());

        // 3. Aggregate Data
        const hourlyStats: Record<string, { total: number; errors: number }> = {};
        const endpointStats: Record<string, { count: number; totalDuration: number; errors: number }> = {};
        const levelStats: Record<string, number> = { INFO: 0, WARN: 0, ERROR: 0, FATAL: 0, DEBUG: 0 };

        logs.forEach(log => {
            const date = log.timestamp?.toDate() || new Date();
            const hourKey = `${date.getHours().toString().padStart(2, '0')}:00`;

            // Hourly distribution
            if (!hourlyStats[hourKey]) hourlyStats[hourKey] = { total: 0, errors: 0 };
            hourlyStats[hourKey].total++;
            if (log.status === 'error' || log.level === 'ERROR' || log.level === 'FATAL') {
                hourlyStats[hourKey].errors++;
            }

            // Endpoint/Action stats
            const action = log.action || 'UNKNOWN';
            if (!endpointStats[action]) endpointStats[action] = { count: 0, totalDuration: 0, errors: 0 };
            endpointStats[action].count++;
            endpointStats[action].totalDuration += (log.duration || 0);
            if (log.status === 'error') endpointStats[action].errors++;

            // Level distribution
            const level = log.level || 'INFO';
            levelStats[level] = (levelStats[level] || 0) + 1;
        });

        // Format for Recharts
        const volumeData = Object.keys(hourlyStats).sort().map(hour => ({
            time: hour,
            requests: hourlyStats[hour].total,
            errors: hourlyStats[hour].errors
        }));

        const endpointData = Object.keys(endpointStats).map(name => ({
            name,
            count: endpointStats[name].count,
            avgLatency: Math.round(endpointStats[name].totalDuration / endpointStats[name].count) || 0,
            successRate: Math.round(((endpointStats[name].count - endpointStats[name].errors) / endpointStats[name].count) * 100)
        })).sort((a, b) => b.count - a.count).slice(0, 8);

        return NextResponse.json({
            volumeData,
            endpointData,
            levelStats,
            summary: {
                totalRequests: logs.length,
                errorCount: logs.filter(l => l.status === 'error' || l.level === 'ERROR').length,
                avgSystemLatency: Math.round(logs.reduce((acc, curr) => acc + (curr.duration || 0), 0) / logs.length) || 0
            }
        });

    } catch (error: any) {
        console.error('Observability API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
