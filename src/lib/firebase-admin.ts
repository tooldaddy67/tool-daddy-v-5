import admin from 'firebase-admin';

if (!admin.apps.length) {
    try {
        const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
        const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
        const projectId = process.env.FIREBASE_PROJECT_ID;

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
            // Remove wrapping quotes if present
            if (key.startsWith("'") && key.endsWith("'")) key = key.slice(1, -1);
            if (key.startsWith('"') && key.endsWith('"')) key = key.slice(1, -1);

            const serviceAccount = JSON.parse(key);
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
            });
            console.log('Firebase Admin: Initialized with JSON key.');
        } else {
            console.warn('Firebase Admin: No credentials found. Using default.');
            admin.initializeApp();
        }
    } catch (error) {
        console.error('Firebase Admin: Initialization failed!', error);
    }
}

let adminAuth: admin.auth.Auth;
let adminFirestore: admin.firestore.Firestore;
let adminDb: admin.firestore.Firestore;

try {
    adminAuth = admin.auth();
    adminFirestore = admin.firestore();
    adminDb = adminFirestore;
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
