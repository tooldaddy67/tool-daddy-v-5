import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const mac = searchParams.get('mac');

    if (!mac) {
        return NextResponse.json({ error: 'MAC address required' }, { status: 400 });
    }

    const cleanMac = mac.replace(/[^a-fA-F0-9]/g, '').slice(0, 12);

    if (cleanMac.length < 6) {
        return NextResponse.json({ error: 'Invalid MAC address' }, { status: 400 });
    }

    try {
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

        // Try tertiary source - macaddress.io (Example, requires key usually, skipping for now)

        return NextResponse.json({ error: 'Vendor not found' }, { status: 404 });

    } catch (error) {
        console.error('MAC Lookup error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
