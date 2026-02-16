import admin from 'firebase-admin';

/**
 * Robustly cleans a PEM private key from environment variables.
 * Handles literal \n, surrounding quotes, and whitespace.
 */
function cleanPrivateKey(key: string | undefined): string | undefined {
    if (!key) return undefined;

    let cleaned = key.trim();

    // 1. Remove surrounding quotes if they exist
    if ((cleaned.startsWith('"') && cleaned.endsWith('"')) || (cleaned.startsWith("'") && cleaned.endsWith("'"))) {
        cleaned = cleaned.slice(1, -1).trim();
    }

    // 2. Handle literal \n sequences often found in env vars
    cleaned = cleaned.replace(/\\n/g, '\n');

    // 3. Ensure it has the headers and footers structure correctly formatted
    if (!cleaned.includes('\n') && cleaned.includes('-----BEGIN PRIVATE KEY-----')) {
        cleaned = cleaned.replace(/ /g, '\n');
    }

    if (cleaned.includes('-----BEGIN PRIVATE KEY-----') && !cleaned.includes('-----BEGIN PRIVATE KEY-----\n')) {
        cleaned = cleaned.replace('-----BEGIN PRIVATE KEY-----', '-----BEGIN PRIVATE KEY-----\n');
    }
    if (cleaned.includes('-----END PRIVATE KEY-----') && !cleaned.includes('\n-----END PRIVATE KEY-----')) {
        cleaned = cleaned.replace('-----END PRIVATE KEY-----', '\n-----END PRIVATE KEY-----');
    }

    return cleaned.trim();
}

function getInitializeApp() {
    if (admin.apps.length > 0) return admin.apps[0]!;

    try {
        let privateKey = cleanPrivateKey(process.env.FIREBASE_PRIVATE_KEY);
        let clientEmail = process.env.FIREBASE_CLIENT_EMAIL?.trim();
        let projectId = (process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID)?.trim();

        // Strip quotes from other creds too
        if (clientEmail?.startsWith('"') && clientEmail.endsWith('"')) clientEmail = clientEmail.slice(1, -1);
        if (clientEmail?.startsWith("'") && clientEmail.endsWith("'")) clientEmail = clientEmail.slice(1, -1);
        if (projectId?.startsWith('"') && projectId.endsWith('"')) projectId = projectId.slice(1, -1);
        if (projectId?.startsWith("'") && projectId.endsWith("'")) projectId = projectId.slice(1, -1);

        console.log(`[FirebaseAdmin] Attempting Init: PID=${!!projectId}, EMAIL=${!!clientEmail}, KEY_LEN=${privateKey?.length || 0}`);

        // Strategy 1: Individual Credentials
        if (projectId && clientEmail && privateKey) {
            console.log(`[FirebaseAdmin] Using Individual Credentials Strategy for: ${projectId}`);
            try {
                return admin.initializeApp({
                    credential: admin.credential.cert({
                        projectId,
                        clientEmail,
                        privateKey,
                    }),
                });
            } catch (certError: any) {
                console.error('[FirebaseAdmin] Individual Creds strategy failed:', certError.message);
            }
        }

        // Strategy 2: JSON Key
        if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
            console.log('[FirebaseAdmin] Using JSON key Strategy.');
            let key = process.env.FIREBASE_SERVICE_ACCOUNT_KEY.trim();
            if ((key.startsWith("'") && key.endsWith("'")) || (key.startsWith('"') && key.endsWith('"'))) {
                key = key.slice(1, -1);
            }

            try {
                const serviceAccount = JSON.parse(key);
                if (serviceAccount.private_key) {
                    serviceAccount.private_key = cleanPrivateKey(serviceAccount.private_key);
                }

                return admin.initializeApp({
                    credential: admin.credential.cert(serviceAccount),
                });
            } catch (jsonError: any) {
                console.error('[FirebaseAdmin] JSON key strategy failed:', jsonError.message);
            }
        }

        // Strategy 3: Default (ADC / Project ID only)
        if (projectId) {
            console.log(`[FirebaseAdmin] Using Default/PID Strategy: ${projectId}`);
            try {
                return admin.initializeApp({ projectId });
            } catch (e: any) {
                console.error('[FirebaseAdmin] Default strategy failed:', e.message);
            }
        }

        throw new Error('All Firebase Admin initialization strategies failed. Ensure FIREBASE_PRIVATE_KEY or FIREBASE_SERVICE_ACCOUNT_KEY are correctly set.');
    } catch (error: any) {
        console.error('[FirebaseAdmin] Fatal Initialization Error:', error.message);
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
