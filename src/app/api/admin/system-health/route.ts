import { NextRequest, NextResponse } from 'next/server';
import { adminFirestore, adminAuth } from '@/lib/firebase-admin';
import { getClientIp, checkRateLimit } from '@/lib/rate-limiter';

export async function GET(request: NextRequest) {
    const startTime = Date.now();
    try {
        // Rate limit for health check
        const ip = await getClientIp();
        if (!checkRateLimit(`health:${ip}`, 30, 60000)) {
            return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
        }

        // Verify Admin Token
        const authHeader = request.headers.get('Authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const token = authHeader.split('Bearer ')[1];
        await adminAuth.verifyIdToken(token);

        // 1. Database Health
        const dbStart = Date.now();
        let dbStatus = 'healthy';
        let dbLatency = 0;
        try {
            await adminFirestore.collection('system-config').limit(1).get();
            dbLatency = Date.now() - dbStart;
        } catch (e) {
            dbStatus = 'degraded';
        }

        // 2. Aggregate counts for "Load" simulation
        const historyCount = await adminFirestore.collectionGroup('history')
            .where('timestamp', '>=', new Date(Date.now() - 3600000)) // last hour
            .count().get();
        const loadIntensity = historyCount.data().count;

        // 3. Tool specific health (check if any specific tool is failing recently)
        const recentFailures = await adminFirestore.collectionGroup('history')
            .where('status', '==', 'error')
            .where('timestamp', '>=', new Date(Date.now() - 3600000))
            .count().get();

        const failureCount = recentFailures.data().count;
        const systemStatus = failureCount > 10 ? 'degraded' : 'healthy';

        // 4. Node Status Simulation (but based on real load)
        const totalLatency = Date.now() - startTime;

        return NextResponse.json({
            status: systemStatus,
            latency: totalLatency,
            db: { status: dbStatus, latency: dbLatency },
            load: {
                current: loadIntensity,
                failureRate: failureCount / (loadIntensity || 1)
            },
            nodes: [
                {
                    id: 'Primary (US)',
                    load: Math.min(99, Math.floor(loadIntensity * 1.5)),
                    latency: totalLatency,
                    status: dbStatus === 'healthy' ? 'green' : 'amber'
                },
                {
                    id: 'AI-Cluster (EU)',
                    load: Math.min(99, Math.floor(loadIntensity * 0.8)),
                    latency: totalLatency + 15,
                    status: failureCount === 0 ? 'green' : 'amber'
                },
                {
                    id: 'Storage (ASIA)',
                    load: Math.min(99, Math.floor(loadIntensity * 0.4)),
                    latency: totalLatency + 45,
                    status: 'green'
                }
            ]
        });

    } catch (error: any) {
        console.error('System Health API Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
