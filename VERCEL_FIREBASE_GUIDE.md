# Firebase + Vercel Deployment Guide

If Firebase Authentication or other features are not working in production (Vercel), follow these steps:

## 1. Authorize Your Vercel Domain
Firebase only allows requests from specific domains for security reasons (especially for OAuth like Google Login and OTP).

1.  Go to the [Firebase Console](https://console.firebase.google.com/).
2.  Select your project.
3.  Go to **Authentication** > **Settings** > **Authorized Domains**.
4.  Add your Vercel deployment URL (e.g., `tool-daddy.vercel.app`).
5.  Also add `localhost` if it's missing.

## 2. Set Environment Variables in Vercel
Ensure your Vercel project has all the necessary environment variables configured:

### Client-Side (Public)
These are required for the standard Firebase SDK to run in the browser:
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID`

### Server-Side (Private)
These are used by the Firebase Admin SDK in API routes and Server Actions:
- `FIREBASE_PROJECT_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY` (Ensure this is wrapped in quotes in Vercel settings to handle newlines)

## 3. Deployment Check
After adding the domain and variables, you **must trigger a new deployment** in Vercel for the changes to take effect.
