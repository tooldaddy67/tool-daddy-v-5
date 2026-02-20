import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { checkRateLimitEdge } from '@/lib/rate-limiter-edge';

// Sensitive routes that require stricter rate limiting
const SENSITIVE_ROUTES = [
	'/api/admin',
	'/api/auth',
	'/api/otp',
];

// Security Headers for non-API routes
const securityHeaders = {
	'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://apis.google.com https://www.googletagmanager.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https: blob:; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://firestore.googleapis.com https://firebaseinstallations.googleapis.com https://www.google-analytics.com https://us-central1-tool-dady.cloudfunctions.net https://accounts.google.com https://*.firebaseapp.com;",
	'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
	'X-Frame-Options': 'DENY',
	'X-Content-Type-Options': 'nosniff',
	'X-XSS-Protection': '1; mode=block',
	'Referrer-Policy': 'strict-origin-when-cross-origin',
	'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
	'X-DNS-Prefetch-Control': 'on',
	'Cross-Origin-Opener-Policy': 'unsafe-none',
	'Cross-Origin-Embedder-Policy': 'unsafe-none',
};

export async function middleware(request: NextRequest) {
	const { pathname } = request.nextUrl;
	// console.log('Middleware executed for path:', pathname);


	// 1. Handle API routes
	if (pathname.startsWith('/api')) {
		const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown';

		// Determine rate limit based on route sensitivity
		const isSensitive = SENSITIVE_ROUTES.some(route => pathname.startsWith(route));
		const limit = isSensitive ? 10 : 60; // 10 requests/min for sensitive, 60 for others
		const windowMs = 60 * 1000;

		if (!checkRateLimitEdge(`${pathname}:${ip}`, limit, windowMs)) {
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

	// 2. Handle non-API routes (Rate Limiting & Security Headers)
	const response = NextResponse.next();

	if (!pathname.startsWith('/api')) {
		// Security Headers for general pages
		Object.entries(securityHeaders).forEach(([key, value]) => {
			response.headers.set(key, value);
		});

		// Rate Limiting for general pages (Skip static assets)
		if (!pathname.startsWith('/_next') && !pathname.includes('.')) {
			const ip = (request as any).ip || request.headers.get('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1';
			const userAgent = request.headers.get('user-agent') || 'unknown';
			const identifier = btoa(`${ip}-${userAgent}`).replace(/[/+=]/g, '_');

			const isAllowed = checkRateLimitEdge(identifier, 100, 60 * 1000);
			if (!isAllowed) {
				return new NextResponse('Too Many Requests', { status: 429 });
			}
		}
	} else {
		// Basic security headers for API
		response.headers.set('X-Content-Type-Options', 'nosniff');
		response.headers.set('X-Frame-Options', 'DENY');
		response.headers.set('X-XSS-Protection', '1; mode=block');
		response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
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
