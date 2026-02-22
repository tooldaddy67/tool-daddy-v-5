import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { checkRateLimitEdge } from '@/lib/rate-limiter-edge';

// Sensitive routes for stricter rate limiting
const SENSITIVE_ROUTES = [
    '/api/admin',
    '/api/auth',
    '/api/otp',
    '/api/cron',
];

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const response = NextResponse.next();

    // 1. Rate Limiting (Edge Logic)
    if (!pathname.startsWith('/_next') && !pathname.includes('.')) {
        const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown';
        const isApi = pathname.startsWith('/api');
        const isSensitive = SENSITIVE_ROUTES.some(route => pathname.startsWith(route));

        // Dynamic limits: 
        // - Sensitive API: 10/min
        // - Regular API: 60/min
        // - General Pages: 100/min
        const limit = isSensitive ? 10 : (isApi ? 60 : 100);
        const identifier = isApi ? `${pathname}:${ip}` : `page:${ip}`;

        if (!checkRateLimitEdge(identifier, limit, 60 * 1000)) {
            return new NextResponse('Too Many Requests', {
                status: 429,
                headers: { 'Retry-After': '60' }
            });
        }
    }

    // 2. Security Headers
    const cspHeader = `
        default-src 'self';
        script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://www.google.com https://www.gstatic.com https://apis.google.com https://vitals.vercel-insights.com;
        style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
        img-src 'self' blob: data: https://*.google-analytics.com https://*.googletagmanager.com https://*.google.com https://*.gstatic.com https://placehold.co https://images.unsplash.com https://picsum.photos https://api.qrserver.com https://img.icons8.com https://cdn.hashnode.com;
        font-src 'self' https://fonts.gstatic.com;
        connect-src 'self' https://*.google-analytics.com https://*.googletagmanager.com https://*.analytics.google.com https://*.google.com https://*.gstatic.com https://firestore.googleapis.com https://identitytoolkit.googleapis.com https://vitals.vercel-insights.com https://api.hashnode.com;
        frame-src 'self' https://www.google.com https://td-v-5.vercel.app;
        media-src 'self' blob:;
        object-src 'none';
        base-uri 'self';
        form-action 'self';
        frame-ancestors 'none';
        upgrade-insecure-requests;
    `.replace(/\s{2,}/g, ' ').trim();

    const headers = {
        'Content-Security-Policy': cspHeader,
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'SAMEORIGIN',
        'X-XSS-Protection': '1; mode=block',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
        'X-DNS-Prefetch-Control': 'on',
    };

    Object.entries(headers).forEach(([key, value]) => {
        response.headers.set(key, value);
    });

    if (process.env.NODE_ENV === 'production') {
        response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    }

    // 3. Admin Route Protection
    if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
        const token = request.cookies.get('__session')?.value || request.cookies.get('token')?.value;
        if (!token) {
            return NextResponse.redirect(new URL('/login', request.url));
        }
    }

    return response;
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
};
