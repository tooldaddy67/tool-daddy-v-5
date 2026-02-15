import { NextResponse } from 'next/server';
import { getSystemConfig } from '@/app/actions/system-config';
import { checkPersistentRateLimit } from '@/lib/rate-limiter';

export async function GET(request: Request) {
    try {
        const config = await getSystemConfig();
        if (config.maintenanceMode) {
            return NextResponse.json({ error: 'SITE_MAINTENANCE: The platform is currently undergoing scheduled maintenance.' }, { status: 503 });
        }

        // --- Rate Limit Enforcement ---
        const rateLimit = await checkPersistentRateLimit('mac-address-lookup');
        if (!rateLimit.allowed) {
            return NextResponse.json(
                { error: `Too many requests. Please try again in ${rateLimit.resetTime ?? 60} seconds.` },
                {
                    status: 429,
                    headers: {
                        'X-RateLimit-Limit': rateLimit.limit.toString(),
                        'X-RateLimit-Remaining': (rateLimit.remaining ?? 0).toString(),
                        'X-RateLimit-Reset': (rateLimit.resetTime ?? 60).toString()
                    }
                }
            );
        }

        const { searchParams } = new URL(request.url);
        const mac = searchParams.get('mac');

        if (!mac) {
            return NextResponse.json({ error: 'MAC address required' }, { status: 400 });
        }

        const cleanMac = mac.replace(/[^a-fA-F0-9]/g, '').slice(0, 12);

        if (cleanMac.length < 6) {
            return NextResponse.json({ error: 'Invalid MAC address' }, { status: 400 });
        }

        // Prepare to race with timeout
        const fetchWithTimeout = (url: string, timeout = 5000) => {
            return Promise.race([
                fetch(url).then(res => {
                    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
                    return res;
                }),
                new Promise<Response>((_, reject) => setTimeout(() => reject(new Error('timeout')), timeout))
            ]);
        };

        // Try primary source - maclookup.app (JSON, structured)
        try {
            const res = await fetchWithTimeout(`https://api.maclookup.app/v2/macs/${cleanMac}`);
            const data = await res.json();
            if (data.success && data.found && data.company) {
                return NextResponse.json({ vendor: data.company, source: 'maclookup.app' });
            }
        } catch (e) {
            console.error('Primary source failed:', e);
        }

        // Try secondary source - macvendors.com (Plain text)
        // Note: macvendors.com is heavily rate limited and might fail
        try {
            const res = await fetchWithTimeout(`https://api.macvendors.com/${cleanMac}`);
            const vendor = await res.text();
            if (vendor && vendor.length > 1) {
                return NextResponse.json({ vendor, source: 'macvendors.com' });
            }
        } catch (e) {
            console.error('Secondary source failed:', e);
        }

        return NextResponse.json({ error: 'Manufacturer not found in database. Try a different MAC.' }, { status: 404 });

    } catch (error: any) {
        console.error('Global MAC Lookup error:', error);
        return NextResponse.json({
            error: 'The lookup service is temporarily unavailable. Please try again later.',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        }, { status: 500 });
    }
}
