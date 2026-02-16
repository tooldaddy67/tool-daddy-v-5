import admin from 'firebase-admin';

function getInitializeApp() {
    if (admin.apps.length > 0) return admin.apps[0]!;

    try {
        let privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n').trim();
        let clientEmail = process.env.FIREBASE_CLIENT_EMAIL?.trim();
        let projectId = (process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID)?.trim();

        // Strip accidental quotes that might come from CLI env setting
        if (privateKey?.startsWith('"') && privateKey.endsWith('"')) privateKey = privateKey.slice(1, -1);
        if (privateKey?.startsWith("'") && privateKey.endsWith("'")) privateKey = privateKey.slice(1, -1);
        if (clientEmail?.startsWith('"') && clientEmail.endsWith('"')) clientEmail = clientEmail.slice(1, -1);
        if (clientEmail?.startsWith("'") && clientEmail.endsWith("'")) clientEmail = clientEmail.slice(1, -1);
        if (projectId?.startsWith('"') && projectId.endsWith('"')) projectId = projectId.slice(1, -1);
        if (projectId?.startsWith("'") && projectId.endsWith("'")) projectId = projectId.slice(1, -1);

        console.log(`[FirebaseAdmin] Checking env: PID=${!!projectId}, EMAIL=${!!clientEmail}, KEY=${!!privateKey}, SERVICE_KEY=${!!process.env.FIREBASE_SERVICE_ACCOUNT_KEY}`);

        if (projectId && clientEmail && privateKey) {
            console.log(`[FirebaseAdmin] Initializing with individual credentials for project: ${projectId}`);
            try {
                return admin.initializeApp({
                    credential: admin.credential.cert({
                        projectId,
                        clientEmail,
                        privateKey,
                    }),
                });
            } catch (certError: any) {
                console.error('[FirebaseAdmin] admin.credential.cert failed:', certError.message);
                throw certError;
            }
        }

        if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
            console.log('[FirebaseAdmin] Initializing with JSON key.');
            let key = process.env.FIREBASE_SERVICE_ACCOUNT_KEY.trim();
            if (key.startsWith("'") && key.endsWith("'")) key = key.slice(1, -1);
            if (key.startsWith('"') && key.endsWith('"')) key = key.slice(1, -1);

            try {
                const serviceAccount = JSON.parse(key);
                return admin.initializeApp({
                    credential: admin.credential.cert(serviceAccount),
                });
            } catch (jsonError: any) {
                console.error('[FirebaseAdmin] JSON Parse failed for FIREBASE_SERVICE_ACCOUNT_KEY:', jsonError.message);
                throw new Error(`Invalid JSON format in FIREBASE_SERVICE_ACCOUNT_KEY: ${jsonError.message}`);
            }
        }

        if (projectId) {
            console.log(`[FirebaseAdmin] Attempting default initialization for project: ${projectId}`);
            try {
                return admin.initializeApp({ projectId });
            } catch (e: any) {
                console.error('[FirebaseAdmin] Default init failed:', e.message);
                throw e;
            }
        }

        throw new Error('No Firebase Admin credentials found in environment variables. Set FIREBASE_PRIVATE_KEY, FIREBASE_CLIENT_EMAIL, and FIREBASE_PROJECT_ID.');
    } catch (error: any) {
        console.error('[FirebaseAdmin] Initialization failed!', error.message);
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
