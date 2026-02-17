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

    // 2. Normalize literal \n results to real newlines first
    cleaned = cleaned.replace(/\\n/g, '\n');

    const beginMarker = '-----BEGIN PRIVATE KEY-----';
    const endMarker = '-----END PRIVATE KEY-----';

    // 3. Extract the base64 part
    // We look for anything between BEGIN and END markers
    if (cleaned.includes(beginMarker) && cleaned.includes(endMarker)) {
        const startIdx = cleaned.indexOf(beginMarker) + beginMarker.length;
        const endIdx = cleaned.indexOf(endMarker);

        // Raw base64 content: Strip everything that isn't a valid base64 character
        let base64Content = cleaned.substring(startIdx, endIdx).replace(/[^a-zA-Z0-9+/=]/g, '');

        if (base64Content.length < 100) {
            console.warn(`[FirebaseAdmin] Warning: Extracted base64 content is suspiciously short (${base64Content.length} chars).`);
        }

        // Handle missing padding (crucial for DER parsing)
        const paddingNeeded = (4 - (base64Content.length % 4)) % 4;
        if (paddingNeeded > 0) {
            console.log(`[FirebaseAdmin] cleanPrivateKey: Adding ${paddingNeeded} padding chars to base64 content.`);
            base64Content = base64Content.padEnd(base64Content.length + paddingNeeded, '=');
        }

        // Reconstruct with standard 64-char wrapping (RFC 1421 / PEM standard style)
        let formattedBase64 = '';
        for (let i = 0; i < base64Content.length; i += 64) {
            formattedBase64 += base64Content.substring(i, i + 64) + '\n';
        }

        cleaned = `${beginMarker}\n${formattedBase64}${endMarker}\n`;
    }

    console.log(`[FirebaseAdmin] cleanPrivateKey (Super Nuclear): Result length=${cleaned.length}, base64Length=${cleaned.length - 52}`);
    if (cleaned.length > 100) {
        console.log(`[FirebaseAdmin] cleanPrivateKey: Key Snippet (start/end only): ${cleaned.substring(0, 35)}...${cleaned.substring(cleaned.length - 35)}`);
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
