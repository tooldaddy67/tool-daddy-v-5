# Authentication & Authorization Flow

## Overview
This document describes how authentication and authorization are handled in the Tool Daddy application.

---

## Authentication
- **Firebase Auth** is used for user authentication (email/password, anonymous, etc.).
- On sign-in, a Firebase ID token is issued and stored in a secure, httpOnly, SameSite=Strict, Secure cookie.
- Multi-factor authentication (MFA) is enforced for users with the `unstablegng` role.

### Token Handling
- Tokens are validated on every sensitive/admin API request using the `requireAuth` middleware.
- Tokens are only accepted from httpOnly cookies or Authorization headers.

---

## Authorization (RBAC)
- Role-based access control is enforced in API endpoints.
- The special role `unstablegng` is assigned if the correct password is provided (for demo/testing).
- Users with the `unstablegng` role:
  - Do not see ads
  - Must use MFA
  - Can access privileged/admin endpoints
- Roles are checked in the `requireAuth` middleware and in UI components via `useAuthUserRole`.

---

## Security Features
- **Password Policy:** Minimum 8 characters, must include uppercase, lowercase, number, and symbol.
- **Audit Logging:** All sensitive operations (deletes, role changes, etc.) are logged to Firestore.
- **Session Review:** Inactive sessions/tokens are regularly reviewed and revoked.
- **CORS/CSRF:** All endpoints are protected with secure CORS and CSRF middleware.
- **Error Tracking:** Sentry is integrated for error monitoring.

---

## Developer Notes
- Never commit secrets or service account keys to source control.
- Always use the secure cookie utility for tokens.
- Update dependencies regularly and monitor for vulnerabilities.
- See `src/lib/` for reusable security utilities.

---
For questions, contact the security lead or check the latest security documentation in `/docs`.
