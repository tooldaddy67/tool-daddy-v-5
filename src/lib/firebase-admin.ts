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

    // 2. Normalize literal \n results to real newlines
    cleaned = cleaned.replace(/\\n/g, '\n');

    // 3. Basic validation: ensure BEGIN and END markers are present
    if (cleaned.includes('-----BEGIN PRIVATE KEY-----') && cleaned.includes('-----END PRIVATE KEY-----')) {
        // Safe logging of reconstructed key length and snippet
        console.log(`[FirebaseAdmin] cleanPrivateKey: Standardized key length=${cleaned.length}`);
        return cleaned;
    }

    // If it's just a raw base64 string without markers, try to reconstruct it
    // Some people put the raw base64 in the env var
    if (!cleaned.includes('-----')) {
        console.log('[FirebaseAdmin] cleanPrivateKey: Reconstructing key from raw base64');
        return `-----BEGIN PRIVATE KEY-----\n${cleaned}\n-----END PRIVATE KEY-----\n`;
    }

    return cleaned;
}

const ADMIN_APP_NAME = 'tool-daddy-admin';

export function getInitializeApp() {
    // Check for the specific named app
    const existingApp = admin.apps.find(app => app && app.name === ADMIN_APP_NAME);
    if (existingApp) {
        return existingApp!;
    }

    try {
        const rawKey = process.env.FIREBASE_PRIVATE_KEY;
        const rawEmail = process.env.FIREBASE_CLIENT_EMAIL;
        const rawPid = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
        const rawJson = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

        console.log(`[FirebaseAdmin] Starting Initialization Diagnostic (${ADMIN_APP_NAME}):`);
        console.log(` - PID: ${rawPid || '[MISSING]'}`);
        console.log(` - EMAIL: ${rawEmail || '[MISSING]'}`);
        console.log(` - KEY: ${rawKey ? `[PRESENT, length=${rawKey.length}]` : '[MISSING]'}`);
        console.log(` - JSON_KEY: ${rawJson ? `[PRESENT, length=${rawJson.length}]` : '[MISSING]'}`);

        let privateKey = cleanPrivateKey(rawKey);
        let clientEmail = rawEmail?.trim();
        let projectId = rawPid?.trim();

        // Strip quotes
        const strip = (s: string | undefined) => {
            if (!s) return s;
            let val = s.trim();
            if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
                return val.slice(1, -1).trim();
            }
            return val;
        };

        projectId = strip(projectId);
        clientEmail = strip(clientEmail);

        // Strategy 1: Individual Credentials
        if (projectId && clientEmail && privateKey) {
            console.log(`[FirebaseAdmin] Strategy 1: Attempting Individual Cert for ${projectId}`);
            try {
                return admin.initializeApp({
                    credential: admin.credential.cert({
                        projectId,
                        clientEmail,
                        privateKey,
                    }),
                }, ADMIN_APP_NAME);
            } catch (certError: any) {
                console.error('[FirebaseAdmin] Strategy 1 Failed:', certError.message);
            }
        }

        // Strategy 2: JSON Key
        if (rawJson) {
            console.log('[FirebaseAdmin] Strategy 2: Attempting JSON Service Account Key');
            let key = strip(rawJson);
            if (key) {
                try {
                    const serviceAccount = JSON.parse(key);
                    console.log(`[FirebaseAdmin] Strategy 2: JSON parsed successfully. Keys: ${Object.keys(serviceAccount).join(', ')}`);
                    if (serviceAccount.private_key) {
                        console.log(`[FirebaseAdmin] Strategy 2: Found private_key, length=${serviceAccount.private_key.length}`);
                        serviceAccount.private_key = cleanPrivateKey(serviceAccount.private_key);
                    } else {
                        console.warn('[FirebaseAdmin] Strategy 2: No private_key field found in JSON');
                    }
                    return admin.initializeApp({
                        credential: admin.credential.cert(serviceAccount),
                    }, ADMIN_APP_NAME);
                } catch (jsonError: any) {
                    console.error('[FirebaseAdmin] Strategy 2 Failed:', jsonError.message);
                    if (jsonError.stack) console.error(jsonError.stack);
                }
            }
        }

        // Strategy 3: Default (ADC)
        console.log(`[FirebaseAdmin] Strategy 3: Falling back to Default/ADC for ${projectId || 'unknown project'}`);
        try {
            return admin.initializeApp(projectId ? { projectId } : {}, ADMIN_APP_NAME);
        } catch (e: any) {
            console.error('[FirebaseAdmin] Strategy 3 Failed:', e.message);
        }

        throw new Error('All Firebase Admin initialization strategies failed. Verify environment variables.');
    } catch (error: any) {
        console.error('[FirebaseAdmin] FATAL:', error.message);
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
