# Production Deployment Guide

This guide outlines the steps required to deploy Tool Daddy to production.

## 1. Environment Variables

The following environment variables must be set in your production environment (e.g., Vercel, Netlify, Docker).

| Variable Name | Description | Required? |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_BASE_URL` | Your production URL (e.g., `https://tool-daddy.com`) | Yes |
| `NEXT_PUBLIC_GA_ID` | Google Analytics Measurement ID | Yes |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase Client API Key | Yes |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase Project ID | Yes |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase Auth Domain | Yes |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Firebase Messaging Sender ID | Yes |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Firebase App ID | Yes |
| `HUMANIZER_API_KEY` | Google Gemini API Key for Humanizer flow | Yes |
| `PLAYLIST_MAKER_API_KEY` | Google Gemini API Key for Playlist flow | Yes |
| `GEMINI_API_KEY` | Fallback Gemini API Key | Yes |
| `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` | Google reCAPTCHA v3 Site Key | Yes |
| `RECAPTCHA_SECRET_KEY` | Google reCAPTCHA v3 Secret Key | Yes |
| `FIREBASE_SERVICE_ACCOUNT_KEY` | **Full JSON content** of your Firebase Service Account Private Key | Yes (for Cron) |
| `CRON_SECRET` | A strong random string to protect cron endpoints | Yes (for Cron) |

> **Note:** `FIREBASE_SERVICE_ACCOUNT_KEY` must be the entire JSON object string. In Vercel, simply paste the JSON content into the value field.

## 2. Cron Jobs (Auto-Deletion)

To ensure inactive accounts are deleted automatically, you must set up a Cron Job.

**Endpoint:** `GET /api/cron/cleanup-users`
**Schedule:** Daily (e.g., `0 0 * * *`)
**Headers:** `Authorization: Bearer <YOUR_CRON_SECRET>`

### Setup on Vercel
1.  Add `vercel.json` to the root (if not present) with cron configuration:
    ```json
    {
      "crons": [
        {
          "path": "/api/cron/cleanup-users",
          "schedule": "0 0 * * *"
        }
      ]
    }
    ```
2.  Vercel automatically calls this route. Ensure `CRON_SECRET` is set in Vercel Environment Variables.
    *Note: Vercel Cron requests are automatically authenticated if you protect the route correctly, but using a secret header is a good generic practice.*

### Setup on GitHub Actions / External
Use a tool like `cron-job.org` or GitHub Actions to make a daily GET request to `https://your-domain.com/api/cron/cleanup-users` with the Authorization header.

## 3. Firebase Security Rules & Indexes

Ensure your Firestore Rules and Indexes are deployed.

1.  **Install Firebase CLI**: `npm install -g firebase-tools`
2.  **Login**: `firebase login`
3.  **Deploy**:
    ```bash
    firebase deploy --only firestore
    ```

This will upload `firestore.rules` and `firestore.indexes.json` to your project.

## 4. Build & Start

The application is a standard Next.js app.

```bash
# Install dependencies
npm install

# Build for production
npm run build

# Start the production server
npm start
```

## 5. Troubleshooting

-   **Cron Job Failures**: Check Vercel logs or your external cron service logs. Verify `FIREBASE_SERVICE_ACCOUNT_KEY` is valid JSON strings.
-   **Auth Errors**: Ensure "Google" and "Email/Password" providers are enabled in Firebase Console authentication settings.
-   **CORS Issues**: Check `next.config.ts` for any allowed origins settings if you have API consumers.
