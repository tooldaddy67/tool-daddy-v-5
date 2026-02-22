import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const response = NextResponse.next();

    // Security Headers
    // 1. Content Security Policy (adjusted for Next.js, Firebase, and Analytics)
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

    response.headers.set('Content-Security-Policy', cspHeader);

    // 2. X-Content-Type-Options: nosniff
    response.headers.set('X-Content-Type-Options', 'nosniff');

    // 3. X-Frame-Options: DENY or SAMEORIGIN
    response.headers.set('X-Frame-Options', 'SAMEORIGIN');

    // 4. X-XSS-Protection
    response.headers.set('X-XSS-Protection', '1; mode=block');

    // 5. Referrer-Policy
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

    // 6. Permissions-Policy
    response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

    // 7. Strict-Transport-Security (HSTS)
    if (process.env.NODE_ENV === 'production') {
        response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    }

    // Admin Route Protection (Basic existence check)
    // For full token verification, we'd need 'jose' for Edge runtime
    if (request.nextUrl.pathname.startsWith('/admin')) {
        const token = request.cookies.get('__session')?.value || request.cookies.get('token')?.value;

        // Redirect to login if no token is present
        if (!token && !request.nextUrl.pathname.startsWith('/admin/login')) {
            return NextResponse.redirect(new URL('/login', request.url));
        }
    }

    return response;
}

// See "Matching Paths" below to learn more
export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};
