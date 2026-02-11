import admin from 'firebase-admin';

if (!admin.apps.length) {
    try {
        if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
            // Parse the JSON string from env var
            const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
            });
        } else {
            // Fallback for environments like App Hosting or local with GOOGLE_APPLICATION_CREDENTIALS
            console.warn('FIREBASE_SERVICE_ACCOUNT_KEY not found. Attempting default credentials.');
            admin.initializeApp();
        }
    } catch (error) {
        console.error('Firebase Admin initialization error', error);
    }
}

export const adminAuth = admin.auth();
export const adminFirestore = admin.firestore();
export default admin;
