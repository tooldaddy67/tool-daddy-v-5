import admin from 'firebase-admin';

// Initialize Firebase Admin if it hasn't been initialized yet
if (!admin.apps.length) {
    try {
        const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
        const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
        const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

        if (projectId && clientEmail && privateKey) {
            admin.initializeApp({
                credential: admin.credential.cert({
                    projectId,
                    clientEmail,
                    privateKey,
                }),
            });
            console.log('Firebase Admin: Initialized with individual credentials.');
        } else if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
            let key = process.env.FIREBASE_SERVICE_ACCOUNT_KEY.trim();
            // Handle cases where the env var might be wrapped in quotes
            if (key.startsWith("'") && key.endsWith("'")) key = key.slice(1, -1);
            if (key.startsWith('"') && key.endsWith('"')) key = key.slice(1, -1);

            const serviceAccount = JSON.parse(key);
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
            });
            console.log('Firebase Admin: Initialized with JSON key.');
        } else if (projectId) {
            // Fallback for environments with partial config or ADC
            admin.initializeApp({ projectId });
            console.log('Firebase Admin: Initialized with Project ID only (using default credentials).');
        } else {
            console.error('Firebase Admin: Fatal Error - No credentials or Project ID found in environment variables.');
        }
    } catch (error) {
        console.error('Firebase Admin: Initialization failed!', error);
    }
}

// Export specific services
let adminAuth: admin.auth.Auth;
let adminFirestore: admin.firestore.Firestore;
let adminDb: admin.firestore.Firestore;

try {
    if (admin.apps.length > 0) {
        const app = admin.apps[0];
        if (app) {
            adminAuth = admin.auth(app);
            adminFirestore = admin.firestore(app);
            adminDb = adminFirestore;
        } else {
            throw new Error('No Firebase app found even though apps.length > 0');
        }
    } else {
        console.warn('Firebase Admin: Services requested but no app was initialized. Admin features will fail.');
        // @ts-ignore
        adminAuth = null;
        // @ts-ignore
        adminFirestore = null;
        // @ts-ignore
        adminDb = null;
    }
} catch (error) {
    console.error('Failed to initialize Firebase Admin services', error);
    // @ts-ignore
    adminAuth = null;
    // @ts-ignore
    adminFirestore = null;
    // @ts-ignore
    adminDb = null;
}

export { adminAuth, adminFirestore, adminDb };
export default admin;
