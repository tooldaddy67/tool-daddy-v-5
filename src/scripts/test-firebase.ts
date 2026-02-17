import { getAdminDb } from '../lib/firebase-admin';
import * as dotenv from 'dotenv';
import path from 'path';

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function testConnection() {
    console.log('--- Firebase Admin Diagnostic ---');
    console.log('Project ID (Env):', process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);

    try {
        const db = getAdminDb();
        console.log('Admin DB Initialized. Attempting to fetch "admin_lockouts" collection...');

        const start = Date.now();
        const timeout = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Timeout after 10s')), 10000)
        );

        const fetch = db.collection('admin_lockouts').limit(1).get();

        const result = await Promise.race([fetch, timeout]) as any;
        const end = Date.now();

        console.log(`Success! Fetched ${result.size} documents in ${end - start}ms`);
    } catch (error: any) {
        console.error('FAILED:', error.message);
        if (error.stack) console.error(error.stack);
    }
}

testConnection();
