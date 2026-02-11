# Authentication & Authorization Security Guide

## Current Authentication Setup

Your application uses **Firebase Authentication** as the primary auth mechanism. This is good — Firebase handles:
- ✅ Secure password hashing
- ✅ Multi-factor authentication (MFA) support
- ✅ Social login integration
- ✅ Token management and refresh
- ✅ Session security

## Security Review & Recommendations

### 1. Firebase Rules (Firestore)

**Status**: ⚠️ Need to verify security rules

Firebase Firestore access is controlled by `firestore.rules`. Verify:
- ✅ Rules enforce authentication checks
- ✅ Users can only read/write their own data
- ✅ Admin operations require proper role checks
- ✅ Public data is explicitly marked

**Current firestore.rules**: See [firestore.rules](../../firestore.rules)

**Review checklist**:
```bash
# Validate rules syntax
firebase rules:test
```

### 2. Firebase Auth Configuration

**Recommended settings in Firebase Console**:
- ✅ Enable Email/Password authentication
- ✅ Enforce strong password requirements
- ✅ Enable Multi-Factor Authentication (MFA)
- ✅ Configure OAuth 2.0 redirect URIs (for social login)
- ✅ Set session duration to 24 hours
- ✅ Revoke old refresh tokens on password change

**Action items**:
1. Go to Firebase Console → Authentication → Settings
2. Review providers and enable security features
3. Set password policy: min 8 chars, requires numbers/symbols
4. Enable reCAPTCHA protection for authentication flows

### 3. Next.js Auth Middleware

**Status**: ❌ Not implemented yet

Implement middleware to protect sensitive routes:

```typescript
// middleware.ts (already created, see src/middleware.ts)
import { NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  // Check if user is authenticated via Firebase token
  const token = request.cookies.get('__session')?.value;
  
  if (!token && request.nextUrl.pathname.startsWith('/admin')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};
```

### 4. Authorization Levels

**Recommended role structure**:
```typescript
enum UserRole {
  GUEST = 'guest',       // No authentication
  USER = 'user',         // Basic authenticated user
  PREMIUM = 'premium',   // Paid tier (if applicable)
  MODERATOR = 'moderator', // Can moderate content
  ADMIN = 'admin',       // Full system access
}

// Store in Firebase Custom Claims or Firestore:
// user.claims.role = 'admin'  // OR
// users/{uid}/role = 'admin'
```

**API route protection example**:
```typescript
import { auth } from 'firebase-admin';

async function requireAuth(request: Request) {
  const token = request.headers.get('Authorization')?.split(' ')[1];
  if (!token) throw new UnauthorizedError('No auth token');
  
  try {
    return await auth().verifyIdToken(token);
  } catch {
    throw new UnauthorizedError('Invalid token');
  }
}

async function requireRole(token: DecodedIdToken, requiredRole: string) {
  const role = token.claims?.role || 'user';
  if (role !== requiredRole && role !== 'admin') {
    throw new ForbiddenError('Insufficient permissions');
  }
}
```

### 5. Token Security

**Best practices**:
- ✅ Use short-lived access tokens (1 hour max)
- ✅ Store tokens in secure, httpOnly cookies (not localStorage)
- ✅ Refresh tokens in secure, httpOnly cookies
- ✅ Validate token signature server-side on every request
- ✅ Implement token revocation on logout
- ✅ Clear tokens on password change

**Firebase handles most of this**, but verify:
1. ID tokens have `expiresIn: 3600` (1 hour)
2. Refresh tokens are httpOnly
3. Logout clears session cookies

### 6. Session Management

**Current**: Firebase session via `__session` cookie

**Verify**:
- ✅ Session timeout: 24 hours recommended
- ✅ Session expires on logout
- ✅ Session bound to user + IP (anti-hijacking)
- ✅ CSRF protection for state-changing operations

### 7. API Key Security (Service Account)

**If using Firebase Admin SDK** (`firebase-admin`):
- ❌ **NEVER commit service account keys**
- ✅ Store in environment variables or secret manager
- ✅ Restrict permissions (use IAM roles)
- ✅ Rotate keys quarterly
- ✅ Monitor usage for anomalies

**Check current keys**:
```bash
# View active service accounts
gcloud iam service-accounts list --project=YOUR_PROJECT_ID

# Rotate keys
gcloud iam service-accounts keys list --iam-account=YOUR_SA@YOUR_PROJECT.iam.gserviceaccount.com
```

### 8. CORS & CSRF Protection

**CORS**:
- ✅ Whitelist trusted origins only
- ✅ Use credentials: 'include' on client-side fetch
- ✅ Set SameSite=Strict cookies

**CSRF**:
- ✅ Use anti-CSRF tokens for POST/PUT/DELETE
- ✅ Verify referer header
- ✅ Use SameSite cookies

**Next.js with Firebase already handles CSRF** via httpOnly sessions.

### 9. Admin Routes Protection

**Create protected admin routes**:
```typescript
// src/app/api/admin/users/route.ts
import { requireAuth, requireRole } from '@/lib/auth-helpers';

export async function GET(request: Request) {
  const user = await requireAuth(request);
  await requireRole(user, 'admin');
  
  // Admin-only logic
  return NextResponse.json({ users: [] });
}
```

### 10. Rate Limiting on Auth Endpoints

**Already implemented**, but verify on**:
- `/api/auth/login` — 5 attempts per minute per IP
- `/api/auth/signup` — 3 new accounts per IP per hour
- `/api/auth/password-reset` — 3 attempts per IP per hour

### 11. Audit Logging

**Implement audit trails for sensitive operations**:
```typescript
async function logAuditEvent(
  userId: string,
  action: string,
  resource: string,
  result: 'success' | 'failure'
) {
  const db = getFirestoreServer();
  await db.collection('audit-logs').add({
    userId,
    action,
    resource,
    result,
    timestamp: new Date(),
    ip: getClientIp(),
    userAgent: getUserAgent(),
  });
}

// Use in critical operations:
// logAuditEvent(userId, 'DELETE_USER', userId, 'success');
```

## Security Checklist

- [ ] Review Firestore rules (`firestore.rules`)
- [ ] Enable MFA in Firebase Console
- [ ] Set password policy to minimum 8 chars
- [ ] Verify httpOnly cookies are used for tokens
- [ ] Implement role-based access control (RBAC)
- [ ] Protect admin routes with middleware
- [ ] Implement audit logging for sensitive actions
- [ ] Rotate service account keys quarterly
- [ ] Review active sessions/tokens regularly
- [ ] Implement token revocation on logout
- [ ] Test CORS and CSRF protections
- [ ] Set up monitoring for suspicious auth attempts
- [ ] Document authentication flow for team
- [ ] Enable sign-in method notifications (email user on new login)

## Testing Auth Security

```bash
# Test rate limiting on login
for i in {1..10}; do
  curl -X POST http://localhost:3000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"wrong"}'
  sleep 1
done

# Should fail with 429 after 5 attempts

# Test token validation
curl -H "Authorization: Bearer INVALID_TOKEN" \
  http://localhost:3000/api/admin/users
# Should return 401
```

## References

- [Firebase Security Best Practices](https://firebase.google.com/docs/database/security)
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [Next.js Authentication](https://nextjs.org/docs/authentication)
- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)
