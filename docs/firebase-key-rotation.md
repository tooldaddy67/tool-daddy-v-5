# Firebase Service Account Key Rotation Guide

Rotating your Firebase service account keys is critical for security. Follow these steps to rotate keys safely:

## 1. Go to Google Cloud Console
- Visit https://console.cloud.google.com/iam-admin/serviceaccounts
- Select your project.

## 2. Find the Firebase Admin SDK Service Account
- Look for the service account used by your app (often ends with `@<project-id>.iam.gserviceaccount.com`).

## 3. Add a New Key
- Click the service account.
- Go to the "Keys" tab.
- Click "Add Key" > "Create new key".
- Choose JSON and download the new key file.

## 4. Update Your Application
- Replace the old service account key in your environment variables or config files (e.g., `.env`, `api-keys.json`).
- Deploy the updated key to your server/hosting environment.

## 5. Remove the Old Key
- In the "Keys" tab, find the old key.
- Click the trash icon to delete it.

## 6. Test Your Application
- Ensure authentication and all Firebase features work as expected.

## 7. Document the Rotation
- Record the date, who rotated the key, and any issues.

---
**Best Practices:**
- Rotate keys at least every 90 days.
- Never commit service account keys to source control.
- Use environment variables for secrets in production.
