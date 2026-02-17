import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { checkRateLimit } from '@/lib/rate-limiter';

// Sensitive routes that require stricter rate limiting
const SENSITIVE_ROUTES = [
    '/api/admin',
    '/api/auth',
    '/api/otp',
];

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Only apply to API routes
    if (pathname.startsWith('/api')) {
        const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown';

        // Determine rate limit based on route sensitivity
        const isSensitive = SENSITIVE_ROUTES.some(route => pathname.startsWith(route));
        const limit = isSensitive ? 10 : 60; // 10 requests/min for sensitive, 60 for others
        const windowMs = 60 * 1000;

        if (!checkRateLimit(`${pathname}:${ip}`, limit, windowMs)) {
            return NextResponse.json(
                { error: 'Too many requests. Please try again later.' },
                {
                    status: 429,
                    headers: {
                        'Retry-After': '60',
                        'X-RateLimit-Limit': limit.toString(),
                        'X-RateLimit-Remaining': '0',
                    }
                }
            );
        }
    }

    // Add security headers
    const response = NextResponse.next();

    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.google.com https://*.gstatic.com https://*.googletagmanager.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; frame-src 'self' https://*.google.com; connect-src 'self' https://*.googleapis.com https://*.firebaseio.com https://*.google-analytics.com;");

    return response;
}

export const config = {
    matcher: '/api/:path*',
};
