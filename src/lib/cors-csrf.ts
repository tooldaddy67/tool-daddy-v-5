import { NextRequest, NextResponse } from 'next/server';

/**
 * CORS middleware for API routes. Allows only secure origins and enforces CORS best practices.
 * Usage: Call in every API route handler before processing the request.
 */
export function handleCors(request: NextRequest) {
  const allowedOrigins = [
    process.env.NEXT_PUBLIC_BASE_URL || 'https://tool-daddy.com',
    'http://localhost:3000',
  ];
  const origin = request.headers.get('origin');
  const response = NextResponse.next();

  if (origin && allowedOrigins.includes(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin);
  } else {
    response.headers.set('Access-Control-Allow-Origin', allowedOrigins[0]);
  }
  response.headers.set('Vary', 'Origin');
  response.headers.set('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  response.headers.set('Access-Control-Allow-Credentials', 'true');

  // Preflight
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, { status: 204, headers: response.headers });
  }
  return response;
}

/**
 * Simple CSRF protection: require a custom header for state-changing requests.
 * Usage: Check in every POST/PUT/DELETE API route.
 */
export function checkCsrf(request: NextRequest) {
  const csrfToken = request.headers.get('x-csrf-token');
  if (!csrfToken || csrfToken !== process.env.CSRF_SECRET) {
    return NextResponse.json({ error: 'Invalid CSRF token' }, { status: 403 });
  }
  return null;
}
