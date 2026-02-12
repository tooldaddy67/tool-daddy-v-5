import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { initializeApp, getApps, cert } from 'firebase-admin/app';

// Initialize Firebase SDK if not already initialized
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}


/**
 * Middleware to protect sensitive routes and enforce RBAC.
 * Checks for a valid Firebase Auth ID token in the Authorization header (Bearer token) or cookie.
 * If valid, allows request to proceed. Otherwise, returns 401 Unauthorized.
 *
 * RBAC: Supports 'unstablegng' role.
 * Users with 'unstablegng' role will not see ads (set X-User-Role header).
 */
const UNSTABLEGNG_ROLE = 'unstablegng';

export async function requireAuth(request: NextRequest, options?: { requireRole?: string }) {
  const authHeader = request.headers.get('authorization');
  let idToken = null;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    idToken = authHeader.split('Bearer ')[1];
  } else {
    // Optionally, check for token in cookies (e.g., session)
    idToken = request.cookies.get('token')?.value || null;
  }

  if (!idToken) {
    return NextResponse.json({ error: 'Unauthorized: No token provided' }, { status: 401 });
  }

  try {
    const decodedToken = await getAuth().verifyIdToken(idToken);
    // RBAC: Check for custom role claim
    let userRole = decodedToken.role || null;

    // If a specific role is required, enforce it
    if (options?.requireRole && userRole !== options.requireRole) {
      return NextResponse.json({ error: 'Forbidden: Insufficient role' }, { status: 403 });
    }

    // Return user info for downstream use (not possible in Next.js middleware, but can be used in API handlers)
    return { user: decodedToken, role: userRole };
  } catch (error) {
    return NextResponse.json({ error: 'Unauthorized: Invalid token' }, { status: 401 });
  }
}

/**
 * Helper to check if a user has the 'unstablegng' role (for hiding ads)
 */
export function userHasUnstablegngRole(userInfo: { role?: string }) {
  return userInfo.role === UNSTABLEGNG_ROLE;
}
