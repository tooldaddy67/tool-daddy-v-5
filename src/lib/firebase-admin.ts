import admin from 'firebase-admin';
import * as fs from 'fs';
import * as path from 'path';

function debugFileLog(msg: string) {
    try {
        const logPath = path.join(process.cwd(), 'admin_debug.log');
        const timestamp = new Date().toISOString();
        fs.appendFileSync(logPath, `[${timestamp}] [Init] ${msg}\n`);
    } catch (e) {
        // Ignore logging errors
    }
}

/**
 * Robustly cleans a PEM private key from environment variables.
 */
function cleanPrivateKey(key: string | undefined): string | undefined {
    if (!key) return undefined;

    // Normalize to string and trim
    let cleaned = String(key).trim();

    // 1. Remove surrounding quotes (including escaped ones)
    cleaned = cleaned.replace(/^["']|["']$/g, '').trim();

    // 2. Handle literal escaped newlines which are common in env vars
    cleaned = cleaned.replace(/\\n/g, '\n').replace(/\\r/g, '\r');

    // 3. Extract the base64 body if markers are present
    const markers = ['-----BEGIN PRIVATE KEY-----', '-----END PRIVATE KEY-----'];
    let body = cleaned;
    if (body.includes(markers[0])) {
        const parts = body.split(markers[0]);
        if (parts.length > 1) {
            body = parts[1].split(markers[1])[0] || body;
        }
    }

    // Strip ALL non-base64 characters
    const base64Only = body.replace(/[^\w+/=]/g, '');

    // PEM format: 64 chars per line
    const lines = base64Only.match(/.{1,64}/g) || [];
    const pemBody = lines.join('\n');

    return `${markers[0]}\n${pemBody}\n${markers[1]}\n`;
}

const ADMIN_APP_NAME = 'tool-daddy-admin';

export function getInitializeApp() {
    const existingApp = admin.apps.find(app => app && app.name === ADMIN_APP_NAME);
    if (existingApp) {
        if (process.env.NODE_ENV === 'development') {
            try { existingApp.delete(); } catch (e) { }
        } else {
            return existingApp!;
        }
    }

    try {
        const rawKey = process.env.FIREBASE_PRIVATE_KEY;
        const rawEmail = process.env.FIREBASE_CLIENT_EMAIL;
        const rawPid = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
        const rawJson = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

        debugFileLog(`Starting Init: PID=${rawPid}, EMAIL=${rawEmail}, KEY=${!!rawKey}, JSON=${!!rawJson}`);

        let privateKey = cleanPrivateKey(rawKey);
        let clientEmail = rawEmail?.trim();
        let projectId = rawPid?.trim();

        const stripQuotes = (s: string | undefined) => {
            if (!s) return s;
            let val = s.trim();
            if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
                return val.slice(1, -1).trim();
            }
            return val;
        };

        projectId = stripQuotes(projectId);
        clientEmail = stripQuotes(clientEmail);

        if (projectId && clientEmail && privateKey) {
            debugFileLog(`Strategy 1: Attempting cert for ${projectId}`);
            try {
                const app = admin.initializeApp({
                    credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
                }, ADMIN_APP_NAME);
                debugFileLog(`Strategy 1 SUCCESS`);
                return app;
            } catch (certError: any) {
                debugFileLog(`Strategy 1 FAILED: ${certError.message}`);
                console.error('[FirebaseAdmin] Strategy 1 Failed:', certError.message);
            }
        }

        if (rawJson) {
            debugFileLog(`Strategy 2: Attempting JSON key`);
            let jsonString = stripQuotes(rawJson);
            if (jsonString) {
                try {
                    const sa = JSON.parse(jsonString);
                    debugFileLog(`Strategy 2: JSON parsed. Project=${sa.project_id}`);
                    if (sa.private_key) {
                        const originalLen = sa.private_key.length;
                        sa.private_key = cleanPrivateKey(sa.private_key);
                        debugFileLog(`Strategy 2: Key cleaned. ${originalLen} -> ${sa.private_key?.length}`);
                    }
                    const app = admin.initializeApp({
                        credential: admin.credential.cert(sa),
                    }, ADMIN_APP_NAME);
                    debugFileLog(`Strategy 2 SUCCESS`);
                    return app;
                } catch (jsonError: any) {
                    debugFileLog(`Strategy 2 FAILED: ${jsonError.message}`);
                    console.error('[FirebaseAdmin] Strategy 2 Failed:', jsonError.message);
                }
            }
        }

        debugFileLog(`Strategy 3: Fallback to ADC for ${projectId || 'unknown'}`);
        try {
            const app = admin.initializeApp(projectId ? { projectId } : {}, ADMIN_APP_NAME);
            debugFileLog(`Strategy 3 SUCCESS`);
            return app;
        } catch (e: any) {
            debugFileLog(`Strategy 3 FAILED: ${e.message}`);
            console.error('[FirebaseAdmin] Strategy 3 Failed:', e.message);
        }

        throw new Error('All Firebase Admin initialization strategies failed.');
    } catch (error: any) {
        debugFileLog(`FATAL: ${error.message}`);
        console.error('[FirebaseAdmin] FATAL:', error.message);
        throw error;
    }
}

export const getAdminAuth = () => admin.auth(getInitializeApp());
export const getAdminFirestore = () => admin.firestore(getInitializeApp());

export default admin;
