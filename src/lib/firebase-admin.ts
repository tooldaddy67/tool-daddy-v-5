import admin from 'firebase-admin';

function getInitializeApp() {
    if (admin.apps.length > 0) return admin.apps[0]!;

    try {
        const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
        const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
        const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

        if (projectId && clientEmail && privateKey) {
            console.log(`[FirebaseAdmin] Initializing with individual credentials for project: ${projectId}`);
            return admin.initializeApp({
                credential: admin.credential.cert({
                    projectId,
                    clientEmail,
                    privateKey,
                }),
            });
        }

        if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
            console.log('[FirebaseAdmin] Initializing with JSON key.');
            let key = process.env.FIREBASE_SERVICE_ACCOUNT_KEY.trim();
            if (key.startsWith("'") && key.endsWith("'")) key = key.slice(1, -1);
            if (key.startsWith('"') && key.endsWith('"')) key = key.slice(1, -1);

            const serviceAccount = JSON.parse(key);
            return admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
            });
        }

        if (projectId) {
            console.log(`[FirebaseAdmin] Attempting default initialization for project: ${projectId}`);
            return admin.initializeApp({ projectId });
        }

        throw new Error('No Firebase Admin credentials found in environment variables.');
    } catch (error) {
        console.error('[FirebaseAdmin] Initialization failed!', error);
        throw error;
    }
}

/**
 * Gets the Admin Auth instance, initializing the app if necessary.
 */
export const getAdminAuth = (): admin.auth.Auth => {
    const app = getInitializeApp();
    return admin.auth(app);
};

/**
 * Gets the Admin Firestore instance, initializing the app if necessary.
 */
export const getAdminDb = (): admin.firestore.Firestore => {
    const app = getInitializeApp();
    return admin.firestore(app);
};

// For backward compatibility
export const adminAuth = null as unknown as admin.auth.Auth;
export const adminFirestore = null as unknown as admin.firestore.Firestore;
export const adminDb = null as unknown as admin.firestore.Firestore;

export default admin;
